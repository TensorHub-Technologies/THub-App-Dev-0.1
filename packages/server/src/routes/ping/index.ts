import express from 'express'
import pingController from '../../controllers/ping.js'
const router = express.Router()

// GET
router.get('/', pingController.getPing)

export default router
