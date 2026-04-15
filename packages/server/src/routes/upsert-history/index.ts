import express from 'express'
import upsertHistoryController from '../../controllers/upsert-history.js'
const router = express.Router()

// CREATE

// READ
router.get(['/', '/:id'], upsertHistoryController.getAllUpsertHistory)

// PATCH
router.patch('/', upsertHistoryController.patchDeleteUpsertHistory)

// DELETE

export default router
