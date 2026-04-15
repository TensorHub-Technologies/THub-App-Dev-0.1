import express from 'express'
import nodesRouter from '../../controllers/nodes.js'
const router = express.Router()

// CREATE

// READ
router.post('/', nodesRouter.executeCustomFunction)

// UPDATE

// DELETE

export default router
