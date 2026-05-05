"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thub_components_1 = require("thub-components");
const getPathForUploads = async (req, res, next) => {
    try {
        const apiResponse = {
            storagePath: (0, thub_components_1.getStoragePath)()
        };
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getPathForUploads
};
//# sourceMappingURL=index.js.map