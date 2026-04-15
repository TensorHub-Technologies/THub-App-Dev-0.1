import express from 'express'
import chatflowsController from '../../controllers/chatflows.js'
import authorizeResource from '../../middlewares/authorizeResource.js'
import { ChatFlow } from '../../database/entities/ChatFlow.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'

const router = express.Router()

const getChatflowByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({ id })
}

// READ
router.get(
    '/:id',
    authorizeResource((req) => getChatflowByIdFromDB(req.params.id), {
        notFoundMessage: 'Workflow not found',
        forbiddenMessage: 'You are not allowed to access this workflow'
    }),
    chatflowsController.checkIfChatflowIsValidForStreaming
)

export default router
