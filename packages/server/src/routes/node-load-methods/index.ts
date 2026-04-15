import express from 'express'
import nodesRouter from '../../controllers/nodes.js'
const router = express.Router()

router.post(['/', '/:name'], nodesRouter.getSingleNodeAsyncOptions)

export default router
