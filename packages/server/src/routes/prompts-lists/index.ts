import express from 'express'
import promptsListController from '../../controllers/prompts-lists.js'
const router = express.Router()

// CREATE
router.post('/', promptsListController.createPromptsList)

export default router
