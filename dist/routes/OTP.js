"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OTP_controllers_1 = require("../controllers/OTP.controllers");
const router = express_1.default.Router();
router.post("/verifymail", OTP_controllers_1.verifyOtp);
router.post("/resend/:id", OTP_controllers_1.resendOtp);
exports.default = router;
