import { NextFunction, Request, Response } from 'express'
import a2aService from '../../services/a2a'

const getAgentCard = async (req: Request, res: Response, next: NextFunction) => {
    var workflowId = req.params.workflowId
    var agentCard = await a2aService.getAgentCard(workflowId)
    await a2aService.createPromptFile(workflowId)
    res.send(agentCard)
    //get request based on the workflow id
}

const getAgentResponse = async (req: Request, res: Response, next: NextFunction) => {
    var workflowId = req.params.workflowId
    console.log('controller.getAgentResponse workflowId:', workflowId)
    return await a2aService.getAgentResponse(workflowId, req, res)
}

export default {
    getAgentCard,
    getAgentResponse
}
