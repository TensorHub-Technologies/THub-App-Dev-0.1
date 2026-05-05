import { NextFunction, Request, Response } from 'express';
type MaybePromise<T> = T | Promise<T>;
export type ResourceFetcher<T> = (req: Request) => MaybePromise<T | null | undefined>;
interface AuthorizeResourceOptions<T> {
    getOwnerId?: (resource: T) => string | undefined | null;
    notFoundMessage?: string;
    forbiddenMessage?: string;
}
declare const authorizeResource: <T>(fetchResource: ResourceFetcher<T>, options?: AuthorizeResourceOptions<T>) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export default authorizeResource;
