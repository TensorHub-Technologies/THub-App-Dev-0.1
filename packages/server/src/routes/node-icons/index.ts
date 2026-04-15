import express from 'express'
import nodesController from '../../controllers/nodes.js'
const router = express.Router()

// CREATE

// READ
router.get(['/', '/:name'], nodesController.getSingleNodeIcon)

// UPDATE

// DELETE

export default router
