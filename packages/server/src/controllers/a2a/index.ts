import { NextFunction, Request, Response } from 'express'
import a2aService from '../../services/a2a'

//TODO enable agent card in ui, change
const saveAgentCard = async (req: Request, res: Response, next: NextFunction) => {
    const result = await a2aService.saveAgentCard(req)
    //once agent card is saved, create prompt file
    return res.send(result)
}

const getAgentCard = async (req: Request, res: Response, next: NextFunction) => {
    var workflowId = req.params.workflowId
    var agentCard = await a2aService.getAgentCard(workflowId)
    console.log('controller.getAgentCard workflowId:', workflowId)
    await a2aService.createPromptFile(workflowId)
    res.send(agentCard)
    //get request based on the workflow id
}

const getAgentResponse = async (req: Request, res: Response, next: NextFunction) => {
    var workflowId = req.params.workflowId
    //await a2aService.createPromptFile(req.body.workflow_id)
    console.log('controller.getAgentResponse workflowId:', workflowId)
    return await a2aService.getAgentResponse(workflowId, req, res)
}

export default {
    getAgentCard,
    getAgentResponse,
    saveAgentCard
}
