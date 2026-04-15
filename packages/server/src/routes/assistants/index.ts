import express from 'express'
import assistantsController from '../../controllers/assistants.js'
import authorizeResource from '../../middlewares/authorizeResource.js'
import { Assistant } from '../../database/entities/Assistant.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'

const router = express.Router()

const getAssistantByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Assistant).findOneBy({ id })
}

// CREATE
router.post('/', assistantsController.createAssistant)

// READ
router.get('/', assistantsController.getAllAssistants)
router.get('/:id', assistantsController.getAllAssistants)

router.get(
    '/getAssistantById/:id',
    authorizeResource((req) => getAssistantByIdFromDB(req.params.id), {
        notFoundMessage: 'Assistant not found',
        forbiddenMessage: 'You are not allowed to access this assistant'
    }),
    assistantsController.getAssistantById
)

// UPDATE
router.put(
    '/:id',
    authorizeResource((req) => getAssistantByIdFromDB(req.params.id), {
        notFoundMessage: 'Assistant not found',
        forbiddenMessage: 'You are not allowed to update this assistant'
    }),
    assistantsController.updateAssistant
)

// DELETE
router.delete(
    '/:id',
    authorizeResource((req) => getAssistantByIdFromDB(req.params.id), {
        notFoundMessage: 'Assistant not found',
        forbiddenMessage: 'You are not allowed to delete this assistant'
    }),
    assistantsController.deleteAssistant
)

router.get('/components/chatmodels', assistantsController.getChatModels)
router.get('/components/docstores', assistantsController.getDocumentStores)
router.get('/components/tools', assistantsController.getTools)

// Generate Assistant Instruction
router.post('/generate/instruction', assistantsController.generateAssistantInstruction)

export default router
