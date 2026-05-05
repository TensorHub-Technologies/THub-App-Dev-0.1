import { Request } from 'express';
import { ChatFlow } from '../database/entities/ChatFlow';
/**
 * Validate Workflow API Key
 * @param {Request} req
 * @param {ChatFlow} chatflow
 */
export declare const validateChatflowAPIKey: (req: Request, chatflow: ChatFlow) => Promise<boolean>;
/**
 * Validate API Key
 * @param {Request} req
 */
export declare const validateAPIKey: (req: Request) => Promise<boolean>;
