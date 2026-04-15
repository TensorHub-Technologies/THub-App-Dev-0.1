import express from 'express'
import vectorsController from '../../controllers/vectors.js'
import { getMulterStorage } from '../../utils.js'

const router = express.Router()

// CREATE
router.post(
    ['/upsert/', '/upsert/:id'],
    getMulterStorage().array('files'),
    vectorsController.getRateLimiterMiddleware,
    vectorsController.upsertVectorMiddleware
)
router.post(['/internal-upsert/', '/internal-upsert/:id'], getMulterStorage().array('files'), vectorsController.createInternalUpsert)

export default router
