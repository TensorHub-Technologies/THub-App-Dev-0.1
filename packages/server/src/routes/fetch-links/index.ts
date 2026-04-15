import express from 'express'
import fetchLinksController from '../../controllers/fetch-links.js'
const router = express.Router()

// READ
router.get('/', fetchLinksController.getAllLinks)

export default router
