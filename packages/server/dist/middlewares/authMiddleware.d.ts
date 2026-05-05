import { NextFunction, Request, Response } from 'express';
export interface AuthenticatedUser {
    uid: string;
    email: string;
    role?: string;
    login_type?: string;
}
declare global {
    namespace Express {
        interface User {
            id: string;
            email?: string;
            role?: string;
            login_type?: string;
        }
        interface Request {
            authUser?: AuthenticatedUser;
            authorizedResource?: unknown;
        }
    }
}
declare const authMiddleware: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export default authMiddleware;
