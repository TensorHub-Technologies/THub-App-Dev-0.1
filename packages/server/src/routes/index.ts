import express from 'express'
import apikeyRouter from './apikey.js'
import assistantsRouter from './assistants.js'
import attachmentsRouter from './attachments.js'
import chatMessageRouter from './chat-messages.js'
import chatflowsRouter from './chatflows.js'
import chatflowsApiKeyRouter from './chatflows-apikey.js'
import chatflowsStreamingRouter from './chatflows-streaming.js'
import chatflowsUploadsRouter from './chatflows-uploads.js'
import componentsCredentialsRouter from './components-credentials.js'
import componentsCredentialsIconRouter from './components-credentials-icon.js'
import credentialsRouter from './credentials.js'
import datasetRouter from './dataset.js'
import documentStoreRouter from './documentstore.js'
import evaluationsRouter from './evaluations.js'
import evaluatorsRouter from './evaluator.js'
import exportImportRouter from './export-import.js'
import feedbackRouter from './feedback.js'
import fetchLinksRouter from './fetch-links.js'
import flowConfigRouter from './flow-config.js'
import getUploadFileRouter from './get-upload-file.js'
import internalChatmessagesRouter from './internal-chat-messages.js'
import internalPredictionRouter from './internal-predictions.js'
import leadsRouter from './leads.js'
import loadPromptRouter from './load-prompts.js'
import marketplacesRouter from './marketplaces.js'
import nodeConfigRouter from './node-configs.js'
import nodeCustomFunctionRouter from './node-custom-functions.js'
import nodeIconRouter from './node-icons.js'
import nodeLoadMethodRouter from './node-load-methods.js'
import nodesRouter from './nodes.js'
import oauth2Router from './oauth2.js'
import openaiAssistantsRouter from './openai-assistants.js'
import openaiAssistantsFileRouter from './openai-assistants-files.js'
import openaiAssistantsVectorStoreRouter from './openai-assistants-vector-store.js'
import openaiRealtimeRouter from './openai-realtime.js'
import pingRouter from './ping.js'
import predictionRouter from './predictions.js'
import promptListsRouter from './prompts-lists.js'
import publicChatbotRouter from './public-chatbots.js'
import publicChatflowsRouter from './public-chatflows.js'
import publicExecutionsRouter from './public-executions.js'
import statsRouter from './stats.js'
import toolsRouter from './tools.js'
import upsertHistoryRouter from './upsert-history.js'
import variablesRouter from './variables.js'
import vectorRouter from './vectors.js'
import verifyRouter from './verify.js'
import versionRouter from './versions.js'
import nvidiaNimRouter from './nvidia-nim.js'
import executionsRouter from './executions.js'
import validationRouter from './validation.js'
import agentflowv2GeneratorRouter from './agentflowv2-generator.js'
import textToSpeechRouter from './text-to-speech.js'
import authRouter from './auth.js'
import subscriptionRouter from './subscription.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import { bindAuthenticatedTenant } from '../middlewares/tenantScope.js'

const router = express.Router()

router.use('/ping', pingRouter)
router.use('/apikey', authMiddleware, bindAuthenticatedTenant, apikeyRouter)
router.use('/assistants', authMiddleware, bindAuthenticatedTenant, assistantsRouter)
router.use('/attachments', attachmentsRouter)
router.use('/chatflows/apikey', chatflowsApiKeyRouter)
router.use('/chatflows', authMiddleware, bindAuthenticatedTenant, chatflowsRouter)
router.use('/chatflows-streaming', authMiddleware, bindAuthenticatedTenant, chatflowsStreamingRouter)
router.use('/chatmessage', chatMessageRouter)
router.use('/chatflows-uploads', authMiddleware, bindAuthenticatedTenant, chatflowsUploadsRouter)
router.use('/components-credentials', componentsCredentialsRouter)
router.use('/components-credentials-icon', componentsCredentialsIconRouter)
router.use('/credentials', authMiddleware, bindAuthenticatedTenant, credentialsRouter)
router.use('/datasets', authMiddleware, bindAuthenticatedTenant, datasetRouter)
router.use('/document-store', authMiddleware, bindAuthenticatedTenant, documentStoreRouter)
router.use('/evaluations', authMiddleware, bindAuthenticatedTenant, evaluationsRouter)
router.use('/evaluators', authMiddleware, bindAuthenticatedTenant, evaluatorsRouter)
router.use('/export-import', authMiddleware, bindAuthenticatedTenant, exportImportRouter)
router.use('/feedback', feedbackRouter)
router.use('/fetch-links', fetchLinksRouter)
router.use('/flow-config', flowConfigRouter)
router.use('/internal-chatmessage', internalChatmessagesRouter)
router.use('/internal-prediction', internalPredictionRouter)
router.use('/get-upload-file', getUploadFileRouter)
router.use('/leads', leadsRouter)
router.use('/load-prompt', loadPromptRouter)
router.use('/marketplaces', marketplacesRouter)
router.use('/node-config', nodeConfigRouter)
router.use('/node-custom-function', nodeCustomFunctionRouter)
router.use('/node-icon', nodeIconRouter)
router.use('/node-load-method', nodeLoadMethodRouter)
router.use('/nodes', nodesRouter)
router.use('/oauth2-credential', oauth2Router)
router.use('/openai-assistants', openaiAssistantsRouter)
router.use('/openai-assistants-file', openaiAssistantsFileRouter)
router.use('/openai-assistants-vector-store', openaiAssistantsVectorStoreRouter)
router.use('/openai-realtime', openaiRealtimeRouter)
router.use('/prediction', predictionRouter)
router.use('/prompts-list', promptListsRouter)
router.use('/public-chatbotConfig', publicChatbotRouter)
router.use('/public-chatflows', publicChatflowsRouter)
router.use('/public-executions', publicExecutionsRouter)
router.use('/stats', statsRouter)
router.use('/tools', authMiddleware, bindAuthenticatedTenant, toolsRouter)
router.use('/variables', authMiddleware, bindAuthenticatedTenant, variablesRouter)
router.use('/vector', vectorRouter)
router.use('/verify', verifyRouter)
router.use('/version', versionRouter)
router.use('/upsert-history', upsertHistoryRouter)

router.use('/nvidia-nim', nvidiaNimRouter)
router.use('/executions', authMiddleware, bindAuthenticatedTenant, executionsRouter)
router.use('/validation', validationRouter)
router.use('/agentflowv2-generator', agentflowv2GeneratorRouter)
router.use('/text-to-speech', textToSpeechRouter)
router.use('/auth', authRouter)
router.use('/subscription', subscriptionRouter)

export default router
