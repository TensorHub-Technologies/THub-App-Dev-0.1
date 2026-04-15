import express from 'express'
import textToSpeechController from '../../controllers/text-to-speech.js'

const router = express.Router()

router.post('/generate', textToSpeechController.generateTextToSpeech)

router.post('/abort', textToSpeechController.abortTextToSpeech)

router.get('/voices', textToSpeechController.getVoices)

export default router
