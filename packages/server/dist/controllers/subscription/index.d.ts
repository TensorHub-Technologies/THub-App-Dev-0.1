import { Request, Response, NextFunction } from 'express';
declare const _default: {
    createSubscription: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    validateSubscription: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    activateFreeSubscription: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    submitEnterpriseMail: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    enterpriseMailStatus: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
