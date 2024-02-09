"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtp = exports.verifyOtp = void 0;
const OTP_1 = __importDefault(require("../models/OTP"));
const User_1 = __importDefault(require("../models/User"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const SendMail_js_1 = require("../utils/SendMail.js");
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, email } = req.body;
        const verifyOTP = yield OTP_1.default.findOne({ email, otp });
        console.table({ otp, email });
        console.log(verifyOTP);
        if (!verifyOTP) {
            throw new Error("Invalid OTP or Email");
        }
        const user = yield User_1.default.findOneAndUpdate({ email }, { isVerified: true });
        if (!user) {
            throw new Error("User not found");
        }
        res.status(200).json({ message: "User verified successfully" });
    }
    catch (err) {
        console.error(err);
        if (err.message === "Invalid OTP or Email") {
            res.status(401).json({ error: err.message });
        }
        else if (err.message === "User not found") {
            res.status(404).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
exports.verifyOtp = verifyOtp;
/* Resending the OTP */
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield User_1.default.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        const otp = otp_generator_1.default.generate(6, { digits: true });
        const email = user.email;
        yield OTP_1.default.create({ otp, email });
        (0, SendMail_js_1.sendMailer)(email, otp, user.Username, "resendOTP");
        res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (err) {
        console.error(err);
        if (err.message === "User not found") {
            res.status(404).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Failed to resend OTP" });
        }
    }
});
exports.resendOtp = resendOtp;
