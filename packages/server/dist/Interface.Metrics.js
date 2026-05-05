"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THUB_METRIC_COUNTERS = exports.THUB_COUNTER_STATUS = void 0;
var THUB_COUNTER_STATUS;
(function (THUB_COUNTER_STATUS) {
    THUB_COUNTER_STATUS["SUCCESS"] = "success";
    THUB_COUNTER_STATUS["FAILURE"] = "failure";
})(THUB_COUNTER_STATUS || (exports.THUB_COUNTER_STATUS = THUB_COUNTER_STATUS = {}));
var THUB_METRIC_COUNTERS;
(function (THUB_METRIC_COUNTERS) {
    THUB_METRIC_COUNTERS["CHATFLOW_CREATED"] = "chatflow_created";
    THUB_METRIC_COUNTERS["AGENTFLOW_CREATED"] = "agentflow_created";
    THUB_METRIC_COUNTERS["ASSISTANT_CREATED"] = "assistant_created";
    THUB_METRIC_COUNTERS["TOOL_CREATED"] = "tool_created";
    THUB_METRIC_COUNTERS["VECTORSTORE_UPSERT"] = "vector_upserted";
    THUB_METRIC_COUNTERS["CHATFLOW_PREDICTION_INTERNAL"] = "chatflow_prediction_internal";
    THUB_METRIC_COUNTERS["CHATFLOW_PREDICTION_EXTERNAL"] = "chatflow_prediction_external";
    THUB_METRIC_COUNTERS["AGENTFLOW_PREDICTION_INTERNAL"] = "agentflow_prediction_internal";
    THUB_METRIC_COUNTERS["AGENTFLOW_PREDICTION_EXTERNAL"] = "agentflow_prediction_external";
})(THUB_METRIC_COUNTERS || (exports.THUB_METRIC_COUNTERS = THUB_METRIC_COUNTERS = {}));
//# sourceMappingURL=Interface.Metrics.js.map