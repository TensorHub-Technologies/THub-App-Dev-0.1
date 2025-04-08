import express from 'express'
import assistantsController from '../../controllers/assistants'

const router = express.Router()

// CREATE
router.post('/', assistantsController.createAssistant)

// READ
router.get('/:id', assistantsController.getAllAssistants)

router.get(['/', 'getAssistantById/:id'], assistantsController.getAssistantById)

// UPDATE
router.put(['/', '/:id'], assistantsController.updateAssistant)

// DELETE
router.delete(['/', '/:id'], assistantsController.deleteAssistant)

router.get('/components/chatmodels', assistantsController.getChatModels)
router.get('/components/docstores', assistantsController.getDocumentStores)
router.get('/components/tools', assistantsController.getTools)

// Generate Assistant Instruction
router.post('/generate/instruction', assistantsController.generateAssistantInstruction)

export default router
