import { NextFunction, Request, Response } from 'express';
import { InternalTHubError } from '../../errors/internalTHubError';
declare function errorHandlerMiddleware(err: InternalTHubError, req: Request, res: Response, next: NextFunction): Promise<void>;
export default errorHandlerMiddleware;
