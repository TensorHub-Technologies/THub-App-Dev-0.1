import { StatusCodes } from 'http-status-codes'
import { Readable } from 'stream'
import { In } from 'typeorm'
import { Dataset } from '../../database/entities/Dataset.js'
import { DatasetRow } from '../../database/entities/DatasetRow.js'
import { InternalFlowiseError } from '../../errors/internalFlowiseError.js'
import { getErrorMessage } from '../../errors/utils.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
import csv from 'csv-parser'

// ─── getAllDatasets ────────────────────────────────────────────────────────────

const getAllDatasets = async (page: number = -1, limit: number = -1, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()
        const queryBuilder = appServer.AppDataSource.getRepository(Dataset).createQueryBuilder('ds').orderBy('ds.updatedDate', 'DESC')

        // ✅ Filter by tenantId
        if (tenantId) {
            queryBuilder.andWhere('ds.tenantId = :tenantId', { tenantId })
        }

        if (page > 0 && limit > 0) {
            queryBuilder.skip((page - 1) * limit)
            queryBuilder.take(limit)
        }

        const [data, total] = await queryBuilder.getManyAndCount()

        const returnObj: Dataset[] = []
        for (const dataset of data) {
            ;(dataset as any).rowCount = await appServer.AppDataSource.getRepository(DatasetRow).count({
                where: { datasetId: dataset.id }
            })
            returnObj.push(dataset)
        }

        if (page > 0 && limit > 0) {
            return { total, data: returnObj }
        } else {
            return returnObj
        }
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: datasetService.getAllDatasets - ${getErrorMessage(error)}`
        )
    }
}

// ─── getDataset ───────────────────────────────────────────────────────────────

const getDataset = async (id: string, page: number = -1, limit: number = -1, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()

        // ✅ Verify dataset belongs to the tenant
        const datasetQueryBuilder = appServer.AppDataSource.getRepository(Dataset).createQueryBuilder('ds').where('ds.id = :id', { id })

        if (tenantId) {
            datasetQueryBuilder.andWhere('ds.tenantId = :tenantId', { tenantId })
        }

        const dataset = await datasetQueryBuilder.getOne()
        if (!dataset) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Dataset ${id} not found`)

        const queryBuilder = appServer.AppDataSource.getRepository(DatasetRow)
            .createQueryBuilder('dsr')
            .orderBy('dsr.sequenceNo', 'ASC')
            .andWhere('dsr.datasetId = :datasetId', { datasetId: id })

        if (page > 0 && limit > 0) {
            queryBuilder.skip((page - 1) * limit)
            queryBuilder.take(limit)
        }

        let [data, total] = await queryBuilder.getManyAndCount()

        // Handle missing sequence numbers (unchanged)
        const missingSequenceNumbers = data.filter((item) => item.sequenceNo === -1)
        if (missingSequenceNumbers.length > 0) {
            const maxSequenceNumber = data.reduce((prev, current) => (prev.sequenceNo > current.sequenceNo ? prev : current))
            let sequenceNo = maxSequenceNumber.sequenceNo + 1
            for (const zeroSequenceNumber of missingSequenceNumbers) {
                zeroSequenceNumber.sequenceNo = sequenceNo++
            }
            await appServer.AppDataSource.getRepository(DatasetRow).save(missingSequenceNumbers)

            const queryBuilder2 = appServer.AppDataSource.getRepository(DatasetRow)
                .createQueryBuilder('dsr')
                .orderBy('dsr.sequenceNo', 'ASC')
                .andWhere('dsr.datasetId = :datasetId', { datasetId: id })

            if (page > 0 && limit > 0) {
                queryBuilder2.skip((page - 1) * limit)
                queryBuilder2.take(limit)
            }
            ;[data, total] = await queryBuilder2.getManyAndCount()
        }

        return { ...dataset, rows: data, total }
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.getDataset - ${getErrorMessage(error)}`)
    }
}

// ─── deleteDataset ────────────────────────────────────────────────────────────

const deleteDataset = async (id: string, tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()

        // ✅ Verify ownership before deleting
        if (tenantId) {
            const dataset = await appServer.AppDataSource.getRepository(Dataset)
                .createQueryBuilder('ds')
                .where('ds.id = :id', { id })
                .andWhere('ds.tenantId = :tenantId', { tenantId })
                .getOne()

            if (!dataset) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Dataset ${id} not found`)
        }

        const result = await appServer.AppDataSource.getRepository(Dataset).delete({ id })
        await appServer.AppDataSource.getRepository(DatasetRow).delete({ datasetId: id })
        return result
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.deleteDataset - ${getErrorMessage(error)}`)
    }
}

// ─── patchDeleteRows ──────────────────────────────────────────────────────────

const patchDeleteRows = async (ids: string[] = [], tenantId?: string) => {
    try {
        const appServer = getRunningExpressApp()

        const datasetItemsToBeDeleted = await appServer.AppDataSource.getRepository(DatasetRow).find({
            where: { id: In(ids) }
        })

        // ✅ If tenantId provided, verify all rows belong to datasets of this tenant
        if (tenantId) {
            const datasetIds = [...new Set(datasetItemsToBeDeleted.map((item) => item.datasetId))]
            const validDatasets = await appServer.AppDataSource.getRepository(Dataset)
                .createQueryBuilder('ds')
                .where('ds.id IN (:...datasetIds)', { datasetIds })
                .andWhere('ds.tenantId = :tenantId', { tenantId })
                .getMany()

            const validDatasetIds = new Set(validDatasets.map((d) => d.id))
            const allValid = datasetItemsToBeDeleted.every((item) => validDatasetIds.has(item.datasetId))
            if (!allValid) throw new InternalFlowiseError(StatusCodes.FORBIDDEN, `Unauthorized: some rows do not belong to this tenant`)
        }

        const dbResponse = await appServer.AppDataSource.getRepository(DatasetRow).delete(ids)

        const datasetIds = [...new Set(datasetItemsToBeDeleted.map((item) => item.datasetId))]
        for (const datasetId of datasetIds) {
            await changeUpdateOnDataset(datasetId)
        }

        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: datasetService.patchDeleteRows - ${getErrorMessage(error)}`
        )
    }
}

const reorderDatasetRow = async (datasetId: string, rows: any[]) => {
    try {
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (entityManager) => {
            for (const row of rows) {
                const item = await entityManager.getRepository(DatasetRow).findOneBy({ id: row.id })
                if (!item) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Dataset Row ${row.id} not found`)
                item.sequenceNo = row.sequenceNo
                await entityManager.getRepository(DatasetRow).save(item)
            }
            await changeUpdateOnDataset(datasetId, entityManager)
        })
        return { message: 'Dataset row reordered successfully' }
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: datasetService.reorderDatasetRow - ${getErrorMessage(error)}`
        )
    }
}

const _readCSV = async (stream: Readable, results: any[]) => {
    return new Promise((resolve, reject) => {
        stream
            .pipe(csv({ headers: false }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject)
    })
}

const _csvToDatasetRows = async (datasetId: string, csvString: string, firstRowHeaders: boolean) => {
    try {
        const appServer = getRunningExpressApp()
        const maxValueEntity = await appServer.AppDataSource.getRepository(DatasetRow).find({
            order: { sequenceNo: 'DESC' },
            take: 1
        })
        let sequenceNo = maxValueEntity?.length > 0 ? maxValueEntity[0].sequenceNo + 1 : 0

        const results: any[] = []
        const files: string[] = csvString.startsWith('[') && csvString.endsWith(']') ? JSON.parse(csvString) : [csvString]

        for (const file of files) {
            const splitDataURI = file.split(',')
            splitDataURI.pop()
            const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
            const stream = Readable.from(bf.toString('utf8'))
            const rows: any[] = []
            await _readCSV(stream, rows)
            results.push(...rows)
        }

        for (let r = 0; r < results.length; r++) {
            if (firstRowHeaders && r === 0) continue
            const row = results[r]
            const newRow = appServer.AppDataSource.getRepository(DatasetRow).create(new DatasetRow())
            newRow.datasetId = datasetId
            newRow.input = row['0']
            newRow.output = row['1']
            newRow.sequenceNo = sequenceNo++
            await appServer.AppDataSource.getRepository(DatasetRow).save(newRow)
        }
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: datasetService._csvToDatasetRows - ${getErrorMessage(error)}`
        )
    }
}

const createDataset = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const newDs = new Dataset()
        Object.assign(newDs, body)
        const dataset = appServer.AppDataSource.getRepository(Dataset).create(newDs)
        const result = await appServer.AppDataSource.getRepository(Dataset).save(dataset)
        if (body.csvFile) {
            await _csvToDatasetRows(result.id, body.csvFile, body.firstRowHeaders)
        }
        return result
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.createDataset - ${getErrorMessage(error)}`)
    }
}

const updateDataset = async (id: string, body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const dataset = await appServer.AppDataSource.getRepository(Dataset).findOneBy({ id })
        if (!dataset) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Dataset ${id} not found`)

        const updateDs = new Dataset()
        Object.assign(updateDs, body)
        appServer.AppDataSource.getRepository(Dataset).merge(dataset, updateDs)
        return await appServer.AppDataSource.getRepository(Dataset).save(dataset)
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.updateDataset - ${getErrorMessage(error)}`)
    }
}

const addDatasetRow = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        if (body.csvFile) {
            await _csvToDatasetRows(body.datasetId, body.csvFile, body.firstRowHeaders)
            await changeUpdateOnDataset(body.datasetId)
            return { message: 'Dataset rows added successfully' }
        }
        const maxValueEntity = await appServer.AppDataSource.getRepository(DatasetRow).find({
            where: { datasetId: body.datasetId },
            order: { sequenceNo: 'DESC' },
            take: 1
        })
        let sequenceNo = maxValueEntity?.length > 0 ? maxValueEntity[0].sequenceNo : 0
        const newDs = new DatasetRow()
        Object.assign(newDs, body)
        newDs.sequenceNo = sequenceNo === 0 ? sequenceNo : sequenceNo + 1
        const row = appServer.AppDataSource.getRepository(DatasetRow).create(newDs)
        const result = await appServer.AppDataSource.getRepository(DatasetRow).save(row)
        await changeUpdateOnDataset(body.datasetId)
        return result
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: datasetService.createDatasetRow - ${getErrorMessage(error)}`
        )
    }
}

const changeUpdateOnDataset = async (id: string, entityManager?: any) => {
    const appServer = getRunningExpressApp()
    const dataset = await appServer.AppDataSource.getRepository(Dataset).findOneBy({ id })
    if (!dataset) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Dataset ${id} not found`)
    dataset.updatedDate = new Date()
    if (entityManager) {
        await entityManager.getRepository(Dataset).save(dataset)
    } else {
        await appServer.AppDataSource.getRepository(Dataset).save(dataset)
    }
}

const updateDatasetRow = async (id: string, body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const item = await appServer.AppDataSource.getRepository(DatasetRow).findOneBy({ id })
        if (!item) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Dataset Row ${id} not found`)
        const updateItem = new DatasetRow()
        Object.assign(updateItem, body)
        appServer.AppDataSource.getRepository(DatasetRow).merge(item, updateItem)
        const result = await appServer.AppDataSource.getRepository(DatasetRow).save(item)
        await changeUpdateOnDataset(body.datasetId)
        return result
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: datasetService.updateDatasetRow - ${getErrorMessage(error)}`
        )
    }
}

const deleteDatasetRow = async (id: string) => {
    try {
        const appServer = getRunningExpressApp()
        return await appServer.AppDataSource.transaction(async (entityManager) => {
            const item = await entityManager.getRepository(DatasetRow).findOneBy({ id })
            if (!item) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Dataset Row ${id} not found`)
            const result = await entityManager.getRepository(DatasetRow).delete({ id })
            await changeUpdateOnDataset(item.datasetId, entityManager)
            return result
        })
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: datasetService.deleteDatasetRow - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getAllDatasets,
    getDataset,
    createDataset,
    updateDataset,
    deleteDataset,
    addDatasetRow,
    updateDatasetRow,
    deleteDatasetRow,
    patchDeleteRows,
    reorderDatasetRow
}
