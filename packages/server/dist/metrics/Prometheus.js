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
exports.Prometheus = void 0;
const Interface_Metrics_1 = require("../Interface.Metrics");
const prom_client_1 = __importStar(require("prom-client"));
const thub_components_1 = require("thub-components");
class Prometheus {
    constructor(app) {
        this.app = app;
        this.register = new prom_client_1.default.Registry();
    }
    getName() {
        return 'Prometheus';
    }
    async initializeCounters() {
        const serviceName = process.env.METRICS_SERVICE_NAME || 'THub';
        this.register.setDefaultLabels({
            app: serviceName
        });
        // look at the THUB_COUNTER enum in Interface.Metrics.ts and get all values
        // for each counter in the enum, create a new promClient.Counter and add it to the registry
        this.counters = new Map();
        const enumEntries = Object.entries(Interface_Metrics_1.THUB_METRIC_COUNTERS);
        enumEntries.forEach(([name, value]) => {
            // derive proper counter name from the enum value (chatflow_created = Chatflow Created)
            const properCounterName = name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            this.counters.set(value, new prom_client_1.default.Counter({
                name: value,
                help: `Total number of ${properCounterName}`,
                labelNames: ['status']
            }));
        });
        // in addition to the enum counters, add a few more custom counters
        // version, http_request_duration_ms, http_requests_total
        const versionGaugeCounter = new prom_client_1.default.Gauge({
            name: 'thub_version_info',
            help: 'THub version info.',
            labelNames: ['version']
        });
        const { version } = await (0, thub_components_1.getVersion)();
        versionGaugeCounter.set({ version: 'v' + version }, 1);
        this.counters.set('thub_version', versionGaugeCounter);
        this.httpRequestDurationMicroseconds = new prom_client_1.default.Histogram({
            name: 'http_request_duration_ms',
            help: 'Duration of HTTP requests in ms',
            labelNames: ['method', 'route', 'code'],
            buckets: [1, 5, 15, 50, 100, 200, 300, 400, 500] // buckets for response time from 0.1ms to 500ms
        });
        this.counters.set('http_request_duration_ms', this.httpRequestDurationMicroseconds);
        this.requestCounter = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'path', 'status']
        });
        this.counters.set('http_requests_total', this.requestCounter);
        this.registerMetrics();
        await this.setupMetricsEndpoint();
    }
    async setupMetricsEndpoint() {
        // Add Prometheus middleware to the app
        this.app.use('/api/v1/metrics', async (req, res) => {
            res.set('Content-Type', this.register.contentType);
            const currentMetrics = await this.register.metrics();
            res.send(currentMetrics).end();
        });
        // Runs before each requests
        this.app.use((req, res, next) => {
            res.locals.startEpoch = Date.now();
            next();
        });
        // Runs after each requests
        this.app.use((req, res, next) => {
            res.on('finish', async () => {
                if (res.locals.startEpoch) {
                    this.requestCounter.inc();
                    const responseTimeInMs = Date.now() - res.locals.startEpoch;
                    this.httpRequestDurationMicroseconds
                        .labels(req.method, req.baseUrl, res.statusCode.toString())
                        .observe(responseTimeInMs);
                }
            });
            next();
        });
    }
    incrementCounter(counter, payload) {
        // increment the counter with the payload
        if (this.counters.has(counter)) {
            ;
            this.counters.get(counter).labels(payload).inc();
        }
    }
    registerMetrics() {
        if (process.env.METRICS_INCLUDE_NODE_METRICS !== 'false') {
            // enable default metrics like CPU usage, memory usage, etc.
            prom_client_1.default.collectDefaultMetrics({ register: this.register });
        }
        // Add our custom metrics to the registry
        for (const counter of this.counters.values()) {
            this.register.registerMetric(counter);
        }
    }
}
exports.Prometheus = Prometheus;
//# sourceMappingURL=Prometheus.js.map