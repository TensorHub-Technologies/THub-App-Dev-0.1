"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetry = void 0;
const Interface_Metrics_1 = require("../Interface.Metrics");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
const api_1 = require("@opentelemetry/api");
const thub_components_1 = require("thub-components");
class OpenTelemetry {
    constructor(app) {
        // Map to hold all counters and histograms
        this.counters = new Map();
        this.app = app;
        if (!process.env.METRICS_OPEN_TELEMETRY_METRIC_ENDPOINT) {
            throw new Error('METRICS_OPEN_TELEMETRY_METRIC_ENDPOINT is not defined');
        }
        if (process.env.METRICS_OPEN_TELEMETRY_DEBUG === 'true') {
            api_1.diag.setLogger(new api_1.DiagConsoleLogger(), api_1.DiagLogLevel.DEBUG);
        }
    }
    getName() {
        return 'OpenTelemetry';
    }
    async initializeCounters() {
        // Define the resource with the service name for trace grouping
        const thubVersion = await (0, thub_components_1.getVersion)();
        this.resource = new resources_1.Resource({
            [semantic_conventions_1.ATTR_SERVICE_NAME]: process.env.METRICS_SERVICE_NAME || 'THub',
            [semantic_conventions_1.ATTR_SERVICE_VERSION]: thubVersion.version // Version as a label
        });
        const metricProtocol = process.env.METRICS_OPEN_TELEMETRY_PROTOCOL || 'http'; // Default to 'http'
        // Conditionally import the correct OTLP exporters based on protocol
        let OTLPMetricExporter;
        if (metricProtocol === 'http') {
            OTLPMetricExporter = require('@opentelemetry/exporter-metrics-otlp-http').OTLPMetricExporter;
        }
        else if (metricProtocol === 'grpc') {
            OTLPMetricExporter = require('@opentelemetry/exporter-metrics-otlp-grpc').OTLPMetricExporter;
        }
        else if (metricProtocol === 'proto') {
            OTLPMetricExporter = require('@opentelemetry/exporter-metrics-otlp-proto').OTLPMetricExporter;
        }
        else {
            console.error('Invalid METRICS_OPEN_TELEMETRY_PROTOCOL specified. Please set it to "http", "grpc", or "proto".');
            process.exit(1); // Exit if invalid protocol type is specified
        }
        this.otlpMetricExporter = new OTLPMetricExporter({
            url: process.env.METRICS_OPEN_TELEMETRY_METRIC_ENDPOINT // OTLP endpoint for metrics
        });
        this.metricReader = new sdk_metrics_1.PeriodicExportingMetricReader({
            exporter: this.otlpMetricExporter,
            exportIntervalMillis: 5000 // Export metrics every 5 seconds
        });
        this.meterProvider = new sdk_metrics_1.MeterProvider({ resource: this.resource, readers: [this.metricReader] });
        const meter = this.meterProvider.getMeter('thub-metrics');
        // look at the THUB_COUNTER enum in Interface.Metrics.ts and get all values
        // for each counter in the enum, create a new promClient.Counter and add it to the registry
        const enumEntries = Object.entries(Interface_Metrics_1.THUB_METRIC_COUNTERS);
        enumEntries.forEach(([name, value]) => {
            // derive proper counter name from the enum value (chatflow_created = Chatflow Created)
            const properCounterName = name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            this.counters.set(value, meter.createCounter(value, {
                description: properCounterName
            }));
        });
        // in addition to the enum counters, add a few more custom counters
        const versionGuage = meter.createGauge('thub_version', {
            description: 'THub version'
        });
        // remove the last dot from the version string, e.g. 2.1.3 -> 2.13 (guage needs a number - float)
        const formattedVersion = thubVersion.version.replace(/\.(\d+)$/, '$1');
        versionGuage.record(parseFloat(formattedVersion));
        // Counter for HTTP requests with method, path, and status as labels
        this.httpRequestCounter = meter.createCounter('http_requests_total', {
            description: 'Counts the number of HTTP requests received'
        });
        // Histogram to measure HTTP request duration in milliseconds
        this.httpRequestDuration = meter.createHistogram('http_request_duration_ms', {
            description: 'Records the duration of HTTP requests in ms'
        });
    }
    // Function to record HTTP request duration
    recordHttpRequestDuration(durationMs, method, path, status) {
        this.httpRequestDuration.record(durationMs, {
            method,
            path,
            status: status.toString()
        });
    }
    // Function to record HTTP requests with specific labels
    recordHttpRequest(method, path, status) {
        this.httpRequestCounter.add(1, {
            method,
            path,
            status: status.toString()
        });
    }
    async setupMetricsEndpoint() {
        // Graceful shutdown for telemetry data flushing
        process.on('SIGTERM', async () => {
            await this.metricReader.shutdown();
            await this.meterProvider.shutdown();
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
                    const responseTimeInMs = Date.now() - res.locals.startEpoch;
                    this.recordHttpRequest(req.method, req.path, res.statusCode);
                    this.recordHttpRequestDuration(responseTimeInMs, req.method, req.path, res.statusCode);
                }
            });
            next();
        });
    }
    async incrementCounter(counter, payload) {
        // Increment OpenTelemetry counter with the payload
        if (this.counters.has(counter)) {
            ;
            this.counters.get(counter).add(1, payload);
        }
    }
}
exports.OpenTelemetry = OpenTelemetry;
//# sourceMappingURL=OpenTelemetry.js.map