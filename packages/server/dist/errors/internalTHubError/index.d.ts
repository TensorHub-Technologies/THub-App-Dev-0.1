export declare class InternalTHubError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
