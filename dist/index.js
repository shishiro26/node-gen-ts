"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = require("./middleware/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const User_1 = __importDefault(require("./routes/User"));
const OTP_1 = __importDefault(require("./routes/OTP"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(logger_1.logger);
const server = http_1.default.createServer(app);
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/api/v1/auth", User_1.default);
app.use("/api/v1/auth/otp", OTP_1.default);
app.use(errorHandler_1.errorHandler);
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`🚀 server at http://localhost:${port}.`));
(0, db_1.default)();
