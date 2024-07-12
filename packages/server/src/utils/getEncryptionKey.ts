import { StatusCodes } from 'http-status-codes'
import { User } from '../database/entities/user'
import { InternalFlowiseError } from '../errors/internalFlowiseError'
import { getRunningExpressApp } from '../utils/getRunningExpressApp'
import { getErrorMessage } from '../errors/utils'

export const getEncryptionKeyFromTenant = async (tenantId: any) => {
    console.log("getEncryptionKeyFromTenant.tenantId: ",tenantId);
    try {

        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(User).findOneBy({
            uid: tenantId
        })
        console.log("getEncryptionKey: ",dbResponse);
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: getEncryptionKeyFromTenant - ${getErrorMessage(error)}`)
    }
}
