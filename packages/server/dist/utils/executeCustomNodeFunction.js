"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCustomNodeFunction = void 0;
const thub_components_1 = require("thub-components");
const _1 = require(".");
const internalTHubError_1 = require("../errors/internalTHubError");
const http_status_codes_1 = require("http-status-codes");
const utils_1 = require("../errors/utils");
const executeCustomNodeFunction = async ({ appDataSource, componentNodes, data }) => {
    try {
        const body = data;
        const jsFunction = typeof body?.javascriptFunction === 'string' ? body.javascriptFunction : '';
        const matches = jsFunction.matchAll(/\$([a-zA-Z0-9_]+)/g);
        const matchesArray = Array.from(matches);
        const functionInputVariables = Object.fromEntries(matchesArray.map((g) => [g[1], undefined]));
        if (functionInputVariables && Object.keys(functionInputVariables).length) {
            for (const key in functionInputVariables) {
                if (key.includes('vars')) {
                    delete functionInputVariables[key];
                }
            }
        }
        const nodeData = { inputs: { functionInputVariables, ...body } };
        if (Object.prototype.hasOwnProperty.call(componentNodes, 'customFunction')) {
            try {
                const nodeInstanceFilePath = componentNodes['customFunction'].filePath;
                const nodeModule = await Promise.resolve(`${nodeInstanceFilePath}`).then(s => __importStar(require(s)));
                const newNodeInstance = new nodeModule.nodeClass();
                const options = {
                    appDataSource,
                    databaseEntities: _1.databaseEntities
                };
                const returnData = await newNodeInstance.init(nodeData, '', options);
                const dbResponse = typeof returnData === 'string' ? (0, thub_components_1.handleEscapeCharacters)(returnData, true) : returnData;
                return dbResponse;
            }
            catch (error) {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error running custom function: ${error}`);
            }
        }
        else {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Node customFunction not found`);
        }
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: nodesService.executeCustomFunction - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
exports.executeCustomNodeFunction = executeCustomNodeFunction;
//# sourceMappingURL=executeCustomNodeFunction.js.map