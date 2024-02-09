"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_js_1 = require("./logger.js");
const errorHandler = (err, req, res, next) => {
    (0, logger_js_1.logEvents)(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errLog.log");
    console.log(err.message);
    const status = res.statusCode ? res.statusCode : 500;
    res.status(status);
    res.json({ message: err.message });
    next();
};
exports.errorHandler = errorHandler;
