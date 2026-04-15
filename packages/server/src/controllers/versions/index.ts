import { Request, Response, NextFunction } from 'express'
import versionsService from '../../services/versions.js'

const getVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await versionsService.getVersion()
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    getVersion
}
