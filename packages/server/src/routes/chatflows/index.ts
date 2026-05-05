import express from 'express'
import chatflowsController from '../../controllers/chatflows'
import authorizeResource from '../../middlewares/authorizeResource'
import { ChatFlow } from '../../database/entities/ChatFlow'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
const router = express.Router()

const getChatflowByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({ id })
}

// CREATE
router.post('/', chatflowsController.saveChatflow)
router.post('/importchatflows', chatflowsController.importChatflows)

// READ
router.get('/', chatflowsController.getAllChatflows)
router.get(
    '/:id',
    authorizeResource((req) => getChatflowByIdFromDB(req.params.id), {
        notFoundMessage: 'Workflow not found',
        forbiddenMessage: 'You are not allowed to access this workflow'
    }),
    chatflowsController.getChatflowById
)

// UPDATE
router.put(
    '/:id',
    authorizeResource((req) => getChatflowByIdFromDB(req.params.id), {
        notFoundMessage: 'Workflow not found',
        forbiddenMessage: 'You are not allowed to update this workflow'
    }),
    chatflowsController.updateChatflow
)

// DELETE
router.delete(
    '/:id',
    authorizeResource((req) => getChatflowByIdFromDB(req.params.id), {
        notFoundMessage: 'Workflow not found',
        forbiddenMessage: 'You are not allowed to delete this workflow'
    }),
    chatflowsController.deleteChatflow
)

export default router
