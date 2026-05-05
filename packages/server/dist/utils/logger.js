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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressRequestLogger = expressRequestLogger;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const node_os_1 = require("node:os");
const config_1 = __importDefault(require("./config")); // should be replaced by node-config or similar
const winston_1 = require("winston");
const { S3StreamLogger } = require('s3-streamlogger');
const { combine, timestamp, printf, errors } = winston_1.format;
let s3ServerStream;
let s3ErrorStream;
let s3ServerReqStream;
if (process.env.STORAGE_TYPE === 's3') {
    const accessKeyId = process.env.S3_STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_STORAGE_SECRET_ACCESS_KEY;
    const region = process.env.S3_STORAGE_REGION;
    const s3Bucket = process.env.S3_STORAGE_BUCKET_NAME;
    const customURL = process.env.S3_ENDPOINT_URL;
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';
    if (!region || !s3Bucket) {
        throw new Error('S3 storage configuration is missing');
    }
    const s3Config = {
        region: region,
        endpoint: customURL,
        forcePathStyle: forcePathStyle
    };
    if (accessKeyId && secretAccessKey) {
        s3Config.credentials = {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        };
    }
    s3ServerStream = new S3StreamLogger({
        bucket: s3Bucket,
        folder: 'logs/server',
        name_format: `server-%Y-%m-%d-%H-%M-%S-%L-${(0, node_os_1.hostname)()}.log`,
        config: s3Config
    });
    s3ErrorStream = new S3StreamLogger({
        bucket: s3Bucket,
        folder: 'logs/error',
        name_format: `server-error-%Y-%m-%d-%H-%M-%S-%L-${(0, node_os_1.hostname)()}.log`,
        config: s3Config
    });
    s3ServerReqStream = new S3StreamLogger({
        bucket: s3Bucket,
        folder: 'logs/requests',
        name_format: `server-requests-%Y-%m-%d-%H-%M-%S-%L-${(0, node_os_1.hostname)()}.log.jsonl`,
        config: s3Config
    });
}
// expect the log dir be relative to the projects root
const logDir = config_1.default.logging.dir;
// Create the log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const logger = (0, winston_1.createLogger)({
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.json(), printf(({ level, message, timestamp, stack }) => {
        const text = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        return stack ? text + '\n' + stack : text;
    }), errors({ stack: true })),
    defaultMeta: {
        package: 'server'
    },
    transports: [
        new winston_1.transports.Console(),
        ...(!process.env.STORAGE_TYPE || process.env.STORAGE_TYPE === 'local'
            ? [
                new winston_1.transports.File({
                    filename: path.join(logDir, config_1.default.logging.server.filename ?? 'server.log'),
                    level: config_1.default.logging.server.level ?? 'info'
                }),
                new winston_1.transports.File({
                    filename: path.join(logDir, config_1.default.logging.server.errorFilename ?? 'server-error.log'),
                    level: 'error' // Log only errors to this file
                })
            ]
            : []),
        ...(process.env.STORAGE_TYPE === 's3'
            ? [
                new winston_1.transports.Stream({
                    stream: s3ServerStream
                })
            ]
            : [])
    ],
    exceptionHandlers: [
        ...(!process.env.STORAGE_TYPE || process.env.STORAGE_TYPE === 'local'
            ? [
                new winston_1.transports.File({
                    filename: path.join(logDir, config_1.default.logging.server.errorFilename ?? 'server-error.log')
                })
            ]
            : []),
        ...(process.env.STORAGE_TYPE === 's3'
            ? [
                new winston_1.transports.Stream({
                    stream: s3ErrorStream
                })
            ]
            : [])
    ],
    rejectionHandlers: [
        ...(!process.env.STORAGE_TYPE || process.env.STORAGE_TYPE === 'local'
            ? [
                new winston_1.transports.File({
                    filename: path.join(logDir, config_1.default.logging.server.errorFilename ?? 'server-error.log')
                })
            ]
            : []),
        ...(process.env.STORAGE_TYPE === 's3'
            ? [
                new winston_1.transports.Stream({
                    stream: s3ErrorStream
                })
            ]
            : [])
    ]
});
function expressRequestLogger(req, res, next) {
    const unwantedLogURLs = ['/api/v1/node-icon/', '/api/v1/components-credentials-icon/', '/api/v1/ping'];
    if (/\/api\/v1\//i.test(req.url) && !unwantedLogURLs.some((url) => new RegExp(url, 'i').test(req.url))) {
        const fileLogger = (0, winston_1.createLogger)({
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.json(), errors({ stack: true })),
            defaultMeta: {
                package: 'server',
                request: {
                    method: req.method,
                    url: req.url,
                    body: req.body,
                    query: req.query,
                    params: req.params,
                    headers: req.headers
                }
            },
            transports: [
                ...(!process.env.STORAGE_TYPE || process.env.STORAGE_TYPE === 'local'
                    ? [
                        new winston_1.transports.File({
                            filename: path.join(logDir, config_1.default.logging.express.filename ?? 'server-requests.log.jsonl'),
                            level: config_1.default.logging.express.level ?? 'debug'
                        })
                    ]
                    : []),
                ...(process.env.STORAGE_TYPE === 's3'
                    ? [
                        new winston_1.transports.Stream({
                            stream: s3ServerReqStream
                        })
                    ]
                    : [])
            ]
        });
        const getRequestEmoji = (method) => {
            const requetsEmojis = {
                GET: '⬇️',
                POST: '⬆️',
                PUT: '🖊',
                DELETE: '❌',
                OPTION: '🔗'
            };
            return requetsEmojis[method] || '?';
        };
        if (req.method !== 'GET') {
            fileLogger.info(`${getRequestEmoji(req.method)} ${req.method} ${req.url}`);
            logger.info(`${getRequestEmoji(req.method)} ${req.method} ${req.url}`);
        }
        else {
            fileLogger.http(`${getRequestEmoji(req.method)} ${req.method} ${req.url}`);
        }
    }
    next();
}
exports.default = logger;
//# sourceMappingURL=logger.js.map