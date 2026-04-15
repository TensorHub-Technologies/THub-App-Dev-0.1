import express from 'express'
import nodeConfigsController from '../../controllers/node-configs.js'
const router = express.Router()

// CREATE
router.post('/', nodeConfigsController.getAllNodeConfigs)

export default router
