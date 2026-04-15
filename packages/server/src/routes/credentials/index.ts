import express from 'express'
import credentialsController from '../../controllers/credentials.js'
import authorizeResource from '../../middlewares/authorizeResource.js'
import { Credential } from '../../database/entities/Credential.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
const router = express.Router()

const getCredentialByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Credential).findOneBy({ id })
}

// CREATE
router.post('/', credentialsController.createCredential)

// READ
router.get('/', credentialsController.getAllCredentials)
router.get(
    '/:id',
    authorizeResource((req) => getCredentialByIdFromDB(req.params.id), {
        notFoundMessage: 'Credential not found',
        forbiddenMessage: 'You are not allowed to access this credential'
    }),
    credentialsController.getCredentialById
)

// UPDATE
router.put(
    '/:id',
    authorizeResource((req) => getCredentialByIdFromDB(req.params.id), {
        notFoundMessage: 'Credential not found',
        forbiddenMessage: 'You are not allowed to update this credential'
    }),
    credentialsController.updateCredential
)

// DELETE
router.delete(
    '/:id',
    authorizeResource((req) => getCredentialByIdFromDB(req.params.id), {
        notFoundMessage: 'Credential not found',
        forbiddenMessage: 'You are not allowed to delete this credential'
    }),
    credentialsController.deleteCredentials
)

export default router
