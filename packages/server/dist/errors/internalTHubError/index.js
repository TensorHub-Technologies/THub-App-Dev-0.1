"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalTHubError = void 0;
class InternalTHubError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        // capture the stack trace of the error from anywhere in the application
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.InternalTHubError = InternalTHubError;
//# sourceMappingURL=index.js.map