import { StatusCodes } from 'http-status-codes'
import { EvaluationRunner, ICommonObject } from 'thub-components'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getErrorMessage } from '../../errors/utils'
import { Dataset } from '../../database/entities/Dataset'
import { DatasetRow } from '../../database/entities/DatasetRow'
import { Evaluation } from '../../database/entities/Evaluation'
import { EvaluationStatus, IEvaluationResult } from '../../Interface'
import { EvaluationRun } from '../../database/entities/EvaluationRun'
import { Credential } from '../../database/entities/Credential'
import { ApiKey } from '../../database/entities/ApiKey'
import { ChatFlow } from '../../database/entities/ChatFlow'
import { getAppVersion } from '../../utils'
import { In } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { calculateCost, formatCost } from './CostCalculator'
import { runAdditionalEvaluators } from './EvaluatorRunner'
import evaluatorsService from '../evaluator'
import { LLMEvaluationRunner } from './LLMEvaluationRunner'
import { Assistant } from '../../database/entities/Assistant'

const DEFAULT_EVALUATION_RUN_TIMEOUT_MS = 15 * 60 * 1000
const DEFAULT_LLM_EVALUATION_TIMEOUT_MS = 5 * 60 * 1000

const getTimeoutMs = (value: unknown, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseStringArray = (value: unknown): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string')
            return []
        } catch (error) {
            return []
        }
    }
    return []
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, timeoutErrorMessage: string): Promise<T> => {
    let timeoutRef: ReturnType<typeof setTimeout> | undefined
    try {
        return await Promise.race([
            promise,
            new Promise<T>((_, reject) => {
                timeoutRef = setTimeout(() => reject(new Error(timeoutErrorMessage)), timeoutMs)
            })
        ])
    } finally {
        if (timeoutRef) clearTimeout(timeoutRef)
    }
}

const runAgain = async (id: string, baseURL: string, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const queryBuilder = appServer.AppDataSource.getRepository(Evaluation).createQueryBuilder('ev').where('ev.id = :id', { id })
        if (tenantId) {
            queryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId })
        }
        const evaluation = await queryBuilder.getOne()
        if (!evaluation) throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Evaluation ${id} not found`)
        const additionalConfig = evaluation.additionalConfig ? JSON.parse(evaluation.additionalConfig) : {}
        const data: ICommonObject = {
            chatflowId: evaluation.chatflowId,
            chatflowName: evaluation.chatflowName,
            datasetName: evaluation.datasetName,
            datasetId: evaluation.datasetId,
            evaluationType: evaluation.evaluationType,
            selectedSimpleEvaluators: JSON.stringify(additionalConfig.simpleEvaluators),
            datasetAsOneConversation: additionalConfig.datasetAsOneConversation,
            chatflowType: JSON.stringify(additionalConfig.chatflowTypes ? additionalConfig.chatflowTypes : [])
        }
        if (evaluation.tenantId) {
            data.tenantId = evaluation.tenantId
        }
        data.name = evaluation.name
        if (evaluation.evaluationType === 'llm') {
            data.selectedLLMEvaluators = JSON.stringify(additionalConfig.lLMEvaluators)
            data.credentialId = additionalConfig.credentialId
            // this is to preserve backward compatibility for evaluations created before the llm/model options were added
            if (!additionalConfig.credentialId && additionalConfig.llmConfig) {
                data.model = additionalConfig.llmConfig.model
                data.llm = additionalConfig.llmConfig.llm
                data.credentialId = additionalConfig.llmConfig.credentialId
            } else {
                data.model = 'gpt-3.5-turbo'
                data.llm = 'OpenAI'
            }
        }
        data.version = true
        return await createEvaluation(data, baseURL)
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: EvalsService.runAgain - ${getErrorMessage(error)}`)
    }
}

const createEvaluation = async (body: ICommonObject, baseURL: string) => {
    try {
        const appServer = getRunningExpressApp()
        const tenantId = typeof body.tenantId === 'string' ? body.tenantId : undefined
        const newEval = new Evaluation()
        Object.assign(newEval, body)
        if (tenantId) {
            newEval.tenantId = tenantId
        }
        newEval.status = EvaluationStatus.PENDING

        const row = appServer.AppDataSource.getRepository(Evaluation).create(newEval)
        row.average_metrics = JSON.stringify({})
        const selectedSimpleEvaluators = parseStringArray(body.selectedSimpleEvaluators)
        const selectedLLMEvaluators = parseStringArray(body.selectedLLMEvaluators)

        const additionalConfig: ICommonObject = {
            chatflowTypes: body.chatflowType ? JSON.parse(body.chatflowType) : [],
            datasetAsOneConversation: body.datasetAsOneConversation,
            simpleEvaluators: selectedSimpleEvaluators
        }

        if (body.evaluationType === 'llm') {
            additionalConfig.lLMEvaluators = selectedLLMEvaluators
            additionalConfig.llmConfig = {
                credentialId: body.credentialId,
                llm: body.llm,
                model: body.model
            }
        }
        row.additionalConfig = JSON.stringify(additionalConfig)
        const newEvaluation = await appServer.AppDataSource.getRepository(Evaluation).save(row)

        await appServer.telemetry.sendTelemetry('evaluation_created', {
            version: await getAppVersion()
        })

        const datasetQueryBuilder = appServer.AppDataSource.getRepository(Dataset).createQueryBuilder('ds').where('ds.id = :id', {
            id: body.datasetId
        })
        if (tenantId) {
            datasetQueryBuilder.andWhere('ds.tenantId = :tenantId', { tenantId })
        }
        const dataset = await datasetQueryBuilder.getOne()
        if (!dataset) throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Dataset ${body.datasetId} not found`)

        const items = await appServer.AppDataSource.getRepository(DatasetRow).find({
            where: { datasetId: dataset.id },
            order: { sequenceNo: 'ASC' }
        })
        ;(dataset as any).rows = items

        const data: ICommonObject = {
            chatflowId: body.chatflowId,
            dataset: dataset,
            evaluationType: body.evaluationType,
            evaluationId: newEvaluation.id,
            credentialId: body.credentialId
        }
        if (body.datasetAsOneConversation) {
            data.sessionId = uuidv4()
        }

        // When chatflow has an APIKey
        const apiKeys: { chatflowId: string; apiKey: string }[] = []
        const chatflowIds = JSON.parse(body.chatflowId)
        for (let i = 0; i < chatflowIds.length; i++) {
            const chatflowId = chatflowIds[i]
            const cFlow = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({
                id: chatflowId,
                ...(tenantId ? { tenantId } : {})
            })
            if (cFlow && cFlow.apikeyid) {
                const apikeyObj = await appServer.AppDataSource.getRepository(ApiKey).findOneBy({
                    id: cFlow.apikeyid
                })
                if (apikeyObj) {
                    apiKeys.push({
                        chatflowId: chatflowId,
                        apiKey: apikeyObj.apiKey
                    })
                }
            }
        }
        if (apiKeys.length > 0) {
            data.apiKeys = apiKeys
        }

        // save the evaluation with status as pending
        const evalRunner = new EvaluationRunner(baseURL)
        if (body.evaluationType === 'llm') {
            const credential = await appServer.AppDataSource.getRepository(Credential).findOneBy({
                id: body.credentialId,
                ...(tenantId ? { tenantId } : {})
            })

            if (!credential) throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Credential ${body.credentialId} not found`)
        }

        const evaluationRunTimeoutMs = getTimeoutMs(process.env.EVALUATION_RUN_TIMEOUT_MS, DEFAULT_EVALUATION_RUN_TIMEOUT_MS)
        const llmEvaluationTimeoutMs = getTimeoutMs(process.env.LLM_EVALUATION_TIMEOUT_MS, DEFAULT_LLM_EVALUATION_TIMEOUT_MS)
        const evaluationRepo = appServer.AppDataSource.getRepository(Evaluation)

        const updateEvaluation = async (status: string, averageMetrics?: ICommonObject) => {
            const evaluation = await evaluationRepo.findOneBy({ id: newEvaluation.id })
            if (!evaluation) return
            evaluation.status = status
            if (averageMetrics !== undefined) {
                evaluation.average_metrics = JSON.stringify(averageMetrics)
            }
            await evaluationRepo.save(evaluation)
        }

        console.info(`[evaluations] started id=${newEvaluation.id} rows=${(dataset as any).rows?.length ?? 0} flows=${chatflowIds.length}`)

        void (async () => {
            let evalMetrics = { passCount: 0, failCount: 0, errorCount: 0 }
            try {
                const result = await withTimeout(
                    evalRunner.runEvaluations(data),
                    evaluationRunTimeoutMs,
                    `Evaluation run timed out after ${evaluationRunTimeoutMs}ms`
                )
                let totalTime = 0
                let allRowsSuccessful = true
                const llmEvaluationRunner = new LLMEvaluationRunner()
                for (const resultRow of result.rows) {
                    const metricsArray: ICommonObject[] = []
                    const actualOutputArray: string[] = []
                    const errorArray: string[] = []
                    for (const evaluationRow of resultRow.evaluations) {
                        if (evaluationRow.status === 'error') {
                            allRowsSuccessful = false
                        }
                        actualOutputArray.push(evaluationRow.actualOutput)
                        totalTime += parseFloat(evaluationRow.latency || '0')
                        let metricsObjFromRun: ICommonObject = {}

                        let nested_metrics = evaluationRow.nested_metrics

                        let promptTokens = 0,
                            completionTokens = 0,
                            totalTokens = 0
                        let inputCost = 0,
                            outputCost = 0,
                            totalCost = 0
                        if (nested_metrics && nested_metrics.length > 0) {
                            for (let i = 0; i < nested_metrics.length; i++) {
                                const nested_metric = nested_metrics[i]
                                if (nested_metric.model && nested_metric.promptTokens > 0) {
                                    promptTokens += nested_metric.promptTokens
                                    completionTokens += nested_metric.completionTokens
                                    totalTokens += nested_metric.totalTokens

                                    inputCost += nested_metric.cost_values.input_cost
                                    outputCost += nested_metric.cost_values.output_cost
                                    totalCost += nested_metric.cost_values.total_cost

                                    nested_metric['totalCost'] = formatCost(nested_metric.cost_values.total_cost)
                                    nested_metric['promptCost'] = formatCost(nested_metric.cost_values.input_cost)
                                    nested_metric['completionCost'] = formatCost(nested_metric.cost_values.output_cost)
                                }
                            }
                            nested_metrics = nested_metrics.filter((metric: any) => {
                                return metric.model && metric.provider
                            })
                        }
                        const metrics = evaluationRow.metrics
                        if (metrics) {
                            if (nested_metrics && nested_metrics.length > 0) {
                                metrics.push({
                                    promptTokens: promptTokens,
                                    completionTokens: completionTokens,
                                    totalTokens: totalTokens,
                                    totalCost: formatCost(totalCost),
                                    promptCost: formatCost(inputCost),
                                    completionCost: formatCost(outputCost)
                                })
                                metricsObjFromRun.nested_metrics = nested_metrics
                            }
                            metrics.map((metric: any) => {
                                if (metric) {
                                    const json = typeof metric === 'object' ? metric : JSON.parse(metric)
                                    Object.getOwnPropertyNames(json).map((key) => {
                                        metricsObjFromRun[key] = json[key]
                                    })
                                }
                            })
                            metricsArray.push(metricsObjFromRun)
                        }
                        errorArray.push(evaluationRow.error)
                    }

                    const newRun = new EvaluationRun()
                    newRun.evaluationId = newEvaluation.id
                    newRun.runDate = new Date()
                    newRun.input = resultRow.input
                    newRun.expectedOutput = resultRow.expectedOutput
                    newRun.actualOutput = JSON.stringify(actualOutputArray)
                    newRun.errors = JSON.stringify(errorArray)
                    calculateCost(metricsArray)
                    newRun.metrics = JSON.stringify(metricsArray)

                    const { results, evaluatorMetrics } = await runAdditionalEvaluators(
                        metricsArray,
                        actualOutputArray,
                        errorArray,
                        selectedSimpleEvaluators
                    )

                    newRun.evaluators = JSON.stringify(results)
                    evalMetrics.passCount += evaluatorMetrics.passCount
                    evalMetrics.failCount += evaluatorMetrics.failCount
                    evalMetrics.errorCount += evaluatorMetrics.errorCount

                    if (body.evaluationType === 'llm') {
                        resultRow.llmConfig = additionalConfig.llmConfig
                        resultRow.LLMEvaluators = selectedLLMEvaluators
                        const llmEvaluatorMap: { evaluatorId: string; evaluator: any }[] = []
                        for (let i = 0; i < resultRow.LLMEvaluators.length; i++) {
                            const evaluatorId = resultRow.LLMEvaluators[i]
                            const evaluator = await evaluatorsService.getEvaluator(evaluatorId, tenantId)
                            llmEvaluatorMap.push({
                                evaluatorId: evaluatorId,
                                evaluator: evaluator
                            })
                        }
                        const resultArray = await withTimeout(
                            llmEvaluationRunner.runLLMEvaluators(resultRow, actualOutputArray, errorArray, llmEvaluatorMap),
                            llmEvaluationTimeoutMs,
                            `LLM evaluation timed out after ${llmEvaluationTimeoutMs}ms`
                        )
                        newRun.llmEvaluators = JSON.stringify(resultArray)
                        const row = appServer.AppDataSource.getRepository(EvaluationRun).create(newRun)
                        await appServer.AppDataSource.getRepository(EvaluationRun).save(row)
                    } else {
                        const row = appServer.AppDataSource.getRepository(EvaluationRun).create(newRun)
                        await appServer.AppDataSource.getRepository(EvaluationRun).save(row)
                    }
                }

                let passPercent = -1
                if (evalMetrics.passCount + evalMetrics.failCount + evalMetrics.errorCount > 0) {
                    passPercent = (evalMetrics.passCount / (evalMetrics.passCount + evalMetrics.failCount + evalMetrics.errorCount)) * 100
                }

                await updateEvaluation(allRowsSuccessful ? EvaluationStatus.COMPLETED : EvaluationStatus.ERROR, {
                    averageLatency: result.rows.length > 0 ? (totalTime / result.rows.length).toFixed(3) : '0.000',
                    totalRuns: result.rows.length,
                    ...evalMetrics,
                    passPcnt: passPercent.toFixed(2)
                })

                console.info(
                    `[evaluations] finished id=${newEvaluation.id} status=${
                        allRowsSuccessful ? EvaluationStatus.COMPLETED : EvaluationStatus.ERROR
                    } runs=${result.rows.length}`
                )
            } catch (error) {
                const errorMsg = getErrorMessage(error)
                console.error(`[evaluations] failed id=${newEvaluation.id}: ${errorMsg}`)
                try {
                    await updateEvaluation(EvaluationStatus.ERROR, {
                        error: errorMsg
                    })
                } catch (dbError) {
                    console.error(`[evaluations] failed to persist status id=${newEvaluation.id}: ${getErrorMessage(dbError)}`)
                }
            }
        })()

        return getAllEvaluations(-1, -1, tenantId)
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: EvalsService.createEvaluation - ${getErrorMessage(error)}`)
    }
}

const getAllEvaluations = async (page: number = -1, limit: number = -1, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()

        // First, get the count of distinct evaluation names for the total
        // needed as the The getCount() method in TypeORM doesn't respect the GROUP BY clause and will return the total count of records
        const countQuery = appServer.AppDataSource.getRepository(Evaluation)
            .createQueryBuilder('ev')
            .select('COUNT(DISTINCT(ev.name))', 'count')
        if (tenantId) {
            countQuery.where('ev.tenantId = :tenantId', { tenantId })
        }

        const totalResult = await countQuery.getRawOne()
        const total = totalResult ? parseInt(totalResult.count) : 0

        // Then get the distinct evaluation names with their counts and latest run date
        const namesQueryBuilder = appServer.AppDataSource.getRepository(Evaluation)
            .createQueryBuilder('ev')
            .select('DISTINCT(ev.name)', 'name')
            .addSelect('COUNT(ev.name)', 'count')
            .addSelect('MAX(ev.runDate)', 'latestRunDate')
            .groupBy('ev.name')
            .orderBy('max(ev.runDate)', 'DESC') // Order by the latest run date
        if (tenantId) {
            namesQueryBuilder.where('ev.tenantId = :tenantId', { tenantId })
        }

        if (page > 0 && limit > 0) {
            namesQueryBuilder.skip((page - 1) * limit)
            namesQueryBuilder.take(limit)
        }

        const evaluationNames = await namesQueryBuilder.getRawMany()
        // Get all evaluations for all names at once in a single query
        const returnResults: IEvaluationResult[] = []

        if (evaluationNames.length > 0) {
            const names = evaluationNames.map((item) => item.name)
            // Fetch all evaluations for these names in a single query
            const allEvaluationsQueryBuilder = appServer.AppDataSource.getRepository(Evaluation)
                .createQueryBuilder('ev')
                .where('ev.name IN (:...names)', { names })
                .orderBy('ev.name', 'ASC')
                .addOrderBy('ev.runDate', 'DESC')
            if (tenantId) {
                allEvaluationsQueryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId })
            }
            const allEvaluations = await allEvaluationsQueryBuilder.getMany()

            // Process the results by name
            const evaluationsByName = new Map<string, Evaluation[]>()
            // Group evaluations by name
            for (const evaluation of allEvaluations) {
                if (!evaluationsByName.has(evaluation.name)) {
                    evaluationsByName.set(evaluation.name, [])
                }
                evaluationsByName.get(evaluation.name)!.push(evaluation)
            }

            // Process each name's evaluations
            for (const item of evaluationNames) {
                const evaluationsForName = evaluationsByName.get(item.name) || []
                for (let i = 0; i < evaluationsForName.length; i++) {
                    const evaluation = evaluationsForName[i] as IEvaluationResult
                    evaluation.latestEval = i === 0
                    evaluation.version = parseInt(item.count) - i
                    returnResults.push(evaluation)
                }
            }
        }

        if (page > 0 && limit > 0) {
            return {
                total: total,
                data: returnResults
            }
        } else {
            return returnResults
        }
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: EvalsService.getAllEvaluations - ${getErrorMessage(error)}`)
    }
}

// Delete evaluation and all rows via id
const deleteEvaluation = async (id: string, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        if (tenantId) {
            const evaluation = await appServer.AppDataSource.getRepository(Evaluation)
                .createQueryBuilder('ev')
                .where('ev.id = :id', { id })
                .andWhere('ev.tenantId = :tenantId', { tenantId })
                .getOne()
            if (!evaluation) throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Evaluation ${id} not found`)
        }
        await appServer.AppDataSource.getRepository(Evaluation).delete({ id: id })
        await appServer.AppDataSource.getRepository(EvaluationRun).delete({ evaluationId: id })
        return { id, deleted: true }
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: EvalsService.deleteEvaluation - ${getErrorMessage(error)}`)
    }
}

// check for outdated evaluations
const isOutdated = async (id: string, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const queryBuilder = appServer.AppDataSource.getRepository(Evaluation).createQueryBuilder('ev').where('ev.id = :id', { id })
        if (tenantId) {
            queryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId })
        }
        const evaluation = await queryBuilder.getOne()
        if (!evaluation) throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Evaluation ${id} not found`)
        const evaluationRunDate = evaluation.runDate.getTime()
        let isOutdated = false
        const returnObj: ICommonObject = {
            isOutdated: false,
            chatflows: [],
            dataset: '',
            errors: []
        }

        // check if the evaluation is outdated by extracting the runTime and then check with the dataset last updated time as well
        // as the chatflows last updated time. If the evaluation is outdated, then return true else return false
        const dataset = await appServer.AppDataSource.getRepository(Dataset).findOneBy({
            id: evaluation.datasetId
        })
        if (dataset) {
            const datasetLastUpdated = dataset.updatedDate.getTime()
            if (datasetLastUpdated > evaluationRunDate) {
                isOutdated = true
                returnObj.dataset = dataset
            }
        } else {
            returnObj.errors.push({
                message: `Dataset ${evaluation.datasetName} not found`,
                id: evaluation.datasetId
            })
            isOutdated = true
        }
        const chatflowIds = evaluation.chatflowId ? JSON.parse(evaluation.chatflowId) : []
        const chatflowNames = evaluation.chatflowName ? JSON.parse(evaluation.chatflowName) : []
        const chatflowTypes = evaluation.additionalConfig ? JSON.parse(evaluation.additionalConfig).chatflowTypes : []
        for (let i = 0; i < chatflowIds.length; i++) {
            // check for backward compatibility, as previous versions did not the types in additionalConfig
            if (chatflowTypes && chatflowTypes.length >= 0) {
                if (chatflowTypes[i] === 'Custom Assistant') {
                    // if the chatflow type is custom assistant, then we should NOT check in the chatflows table
                    continue
                }
            }
            const chatflow = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({
                id: chatflowIds[i],
                ...(tenantId ? { tenantId } : {})
            })
            if (!chatflow) {
                returnObj.errors.push({
                    message: `Chatflow ${chatflowNames[i]} not found`,
                    id: chatflowIds[i]
                })
                isOutdated = true
            } else {
                const chatflowLastUpdated = chatflow.updatedDate.getTime()
                if (chatflowLastUpdated > evaluationRunDate) {
                    isOutdated = true
                    returnObj.chatflows.push({
                        chatflowName: chatflowNames[i],
                        chatflowId: chatflowIds[i],
                        chatflowType: chatflow.type === 'AGENTFLOW' ? 'Agentflow v2' : 'Chatflow',
                        isOutdated: true
                    })
                }
            }
        }
        if (chatflowTypes && chatflowTypes.length > 0) {
            for (let i = 0; i < chatflowIds.length; i++) {
                if (chatflowTypes[i] !== 'Custom Assistant') {
                    // if the chatflow type is NOT custom assistant, then bail out for this item
                    continue
                }
                const assistant = await appServer.AppDataSource.getRepository(Assistant).findOneBy({
                    id: chatflowIds[i],
                    ...(tenantId ? { tenantId } : {})
                })
                if (!assistant) {
                    returnObj.errors.push({
                        message: `Custom Assistant ${chatflowNames[i]} not found`,
                        id: chatflowIds[i]
                    })
                    isOutdated = true
                } else {
                    const chatflowLastUpdated = assistant.updatedDate.getTime()
                    if (chatflowLastUpdated > evaluationRunDate) {
                        isOutdated = true
                        returnObj.chatflows.push({
                            chatflowName: chatflowNames[i],
                            chatflowId: chatflowIds[i],
                            chatflowType: 'Custom Assistant',
                            isOutdated: true
                        })
                    }
                }
            }
        }
        returnObj.isOutdated = isOutdated
        return returnObj
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: EvalsService.isOutdated - ${getErrorMessage(error)}`)
    }
}

const getEvaluation = async (id: string, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const queryBuilder = appServer.AppDataSource.getRepository(Evaluation).createQueryBuilder('ev').where('ev.id = :id', { id })
        if (tenantId) {
            queryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId })
        }
        const evaluation = await queryBuilder.getOne()
        if (!evaluation) throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Evaluation ${id} not found`)
        const versionCount = await appServer.AppDataSource.getRepository(Evaluation).countBy({
            name: evaluation.name,
            ...(tenantId ? { tenantId } : {})
        })
        const items = await appServer.AppDataSource.getRepository(EvaluationRun).find({
            where: { evaluationId: id }
        })
        const versions = (await getVersions(id, tenantId)).versions
        const versionNo = versions.findIndex((version) => version.id === id) + 1
        return {
            ...evaluation,
            versionCount: versionCount,
            versionNo: versionNo,
            rows: items
        }
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: EvalsService.getEvaluation - ${getErrorMessage(error)}`)
    }
}

const getVersions = async (id: string, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const queryBuilder = appServer.AppDataSource.getRepository(Evaluation).createQueryBuilder('ev').where('ev.id = :id', { id })
        if (tenantId) {
            queryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId })
        }
        const evaluation = await queryBuilder.getOne()
        if (!evaluation) throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Evaluation ${id} not found`)
        const versions = await appServer.AppDataSource.getRepository(Evaluation).find({
            where: {
                name: evaluation.name,
                ...(tenantId ? { tenantId } : {})
            },
            order: {
                runDate: 'ASC'
            }
        })
        const returnResults: { id: string; runDate: Date; version: number }[] = []
        versions.map((version, index) => {
            returnResults.push({
                id: version.id,
                runDate: version.runDate,
                version: index + 1
            })
        })
        return {
            versions: returnResults
        }
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: EvalsService.getEvaluation - ${getErrorMessage(error)}`)
    }
}

const patchDeleteEvaluations = async (ids: string[] = [], isDeleteAllVersion?: boolean, tenantId?: string) => {
    try {
        if (!ids.length) {
            return { deleted: true, count: 0 }
        }
        const appServer = getRunningExpressApp()
        const evaluationRepo = appServer.AppDataSource.getRepository(Evaluation)
        const evalsToBeDeleted = tenantId
            ? await evaluationRepo
                  .createQueryBuilder('ev')
                  .where('ev.id IN (:...ids)', { ids })
                  .andWhere('ev.tenantId = :tenantId', { tenantId })
                  .getMany()
            : await evaluationRepo.find({
                  where: { id: In(ids) }
              })

        const idsToDelete = evalsToBeDeleted.map((e) => e.id)

        if (!idsToDelete.length) {
            return { deleted: true, count: 0 }
        }

        await evaluationRepo.delete(idsToDelete)
        for (const evaluation of evalsToBeDeleted) {
            await appServer.AppDataSource.getRepository(EvaluationRun).delete({ evaluationId: evaluation.id })
        }

        if (isDeleteAllVersion) {
            for (const evaluation of evalsToBeDeleted) {
                const otherVersionEvals = await evaluationRepo.find({
                    where: { name: evaluation.name, ...(tenantId ? { tenantId } : {}) }
                })
                if (otherVersionEvals.length > 0) {
                    await evaluationRepo.delete(otherVersionEvals.map((e) => e.id))
                    for (const otherVersionEval of otherVersionEvals) {
                        await appServer.AppDataSource.getRepository(EvaluationRun).delete({ evaluationId: otherVersionEval.id })
                    }
                }
            }
        }

        return { deleted: true, count: idsToDelete.length }
    } catch (error) {
        throw new InternalTHubError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: EvalsService.patchDeleteEvaluations - ${getErrorMessage(error)}`
        )
    }
}
export default {
    createEvaluation,
    getAllEvaluations,
    deleteEvaluation,
    getEvaluation,
    isOutdated,
    runAgain,
    getVersions,
    patchDeleteEvaluations
}
