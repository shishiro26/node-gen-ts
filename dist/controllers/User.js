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
exports.refreshToken = exports.userInfo = exports.logout = exports.updateImage = exports.updatePassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const SendMail_1 = require("../utils/SendMail");
const mongoose_1 = __importDefault(require("mongoose"));
const OTP_1 = __importDefault(require("../models/OTP"));
const GenerateToken_js_1 = require("../utils/GenerateToken.js");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Username, email, password } = req.body;
        const duplicate = yield User_1.default.findOne({ email }).exec();
        if (duplicate) {
            return res.status(409).json({
                message: "User already exists. Try signing up with a different email.",
            });
        }
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPwd = yield bcrypt_1.default.hash(password, salt);
        const otp = yield otp_generator_1.default.generate(6, {
            digits: true,
            specialChars: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
        });
        if (!otp) {
            throw new Error("Failed to generate OTP");
        }
        const user = yield User_1.default.create({
            Username,
            email,
            password: hashedPwd,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${Username}`,
            isVerified: false,
        });
        if (!user) {
            throw new Error("Failed to create user");
        }
        yield OTP_1.default.create({ email, otp });
        (0, SendMail_1.sendMailer)(email, otp, user.Username, "registration");
        const accessToken = yield (0, GenerateToken_js_1.AccessToken)(user._id);
        const refreshToken = yield (0, GenerateToken_js_1.RefreshToken)(user._id);
        res.cookie("AccessToken", accessToken, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 20 * 60 * 1000,
        });
        res.cookie("RefreshToken", refreshToken, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: "User registered successfully",
        });
    }
    catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        const accessToken = yield (0, GenerateToken_js_1.AccessToken)(user._id);
        const refreshToken = yield (0, GenerateToken_js_1.RefreshToken)(user._id);
        res.cookie("AccessToken", accessToken, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 20 * 60 * 1000,
        });
        res.cookie("RefreshToken", refreshToken, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: "Logged in successfully",
        });
    }
    catch (error) {
        console.error(error);
        let errorMessage = "Internal server error. Please try again later.";
        if (error.message === "User not found") {
            res.status(404);
            errorMessage = "User not found";
        }
        else if (error.message === "Invalid credentials") {
            res.status(401);
            errorMessage = "Invalid credentials";
        }
        res.json({ error: errorMessage });
    }
});
exports.login = login;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userDetails = yield User_1.default.findById(id);
        if (!userDetails) {
            throw new Error("User not found");
        }
        if (!userDetails.isVerified) {
            throw new Error("User is not verified");
        }
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword) {
            throw new Error("New passwords do not match");
        }
        const isPasswordMatch = yield bcrypt_1.default.compare(oldPassword, userDetails.password);
        if (!isPasswordMatch) {
            throw new Error("Invalid old password");
        }
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPwd = yield bcrypt_1.default.hash(newPassword, salt);
        yield User_1.default.findByIdAndUpdate(id, { password: hashedPwd });
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error(error);
        let errorMessage = "Internal server error. Please try again later.";
        if (error.message === "User not found") {
            res.status(404);
            errorMessage = "User not found";
        }
        else if (error.message === "User is not verified") {
            res.status(401);
            errorMessage = "User is not verified";
        }
        else if (error.message === "New passwords do not match") {
            res.status(400);
            errorMessage = "New passwords do not match";
        }
        else if (error.message === "Invalid old password") {
            res.status(401);
            errorMessage = "Invalid old password";
        }
        res.json({ error: errorMessage });
    }
});
exports.updatePassword = updatePassword;
const updateImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid user ID format");
        }
        const userDetails = yield User_1.default.findById(id);
        if (!userDetails) {
            throw new Error("User not found");
        }
        if (!userDetails.isVerified) {
            throw new Error("User is not verified");
        }
        if (!(req === null || req === void 0 ? void 0 : req.file)) {
            throw new Error("No image file provided");
        }
        const base64Image = (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.buffer.toString("base64");
        yield User_1.default.findByIdAndUpdate(id, { image: base64Image });
        res.status(200).json({ message: "Image updated successfully" });
    }
    catch (error) {
        console.error(error);
        let errorMessage = "Internal server error. Please try again later.";
        if (error.message === "Invalid user ID format") {
            res.status(400);
            errorMessage = "Invalid user ID format";
        }
        else if (error.message === "User not found") {
            res.status(404);
            errorMessage = "User not found";
        }
        else if (error.message === "User is not verified") {
            res.status(401);
            errorMessage = "User is not verified";
        }
        else if (error.message === "No image file provided") {
            res.status(400);
            errorMessage = "No image file provided";
        }
        res.json({ error: errorMessage });
    }
});
exports.updateImage = updateImage;
/* Logout the user */
const logout = (req, res) => {
    res.cookie("AccessToken", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.cookie("RefreshToken", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "user logged out successfully" });
};
exports.logout = logout;
/* Get the user Info */
const userInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid user ID format");
        }
        if (req.payload.aud !== id) {
            throw new Error("Invalid access token");
        }
        const user = yield User_1.default.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.isVerified) {
            throw new Error("User is not verified");
        }
        res.status(200).json({ data: user });
    }
    catch (error) {
        console.error(error);
        let errorMessage = "Internal server error. Please try again later.";
        if (error.message === "Invalid user ID format") {
            res.status(400);
            errorMessage = "Invalid user ID format";
        }
        else if (error.message === "Invalid access token") {
            res.status(401);
            errorMessage = "Invalid access token";
        }
        else if (error.message === "User not found") {
            res.status(404);
            errorMessage = "User not found";
        }
        else if (error.message === "User is not verified") {
            res.status(401);
            errorMessage = "User is not verified";
        }
        res.json({ error: errorMessage });
    }
});
exports.userInfo = userInfo;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.RefreshToken;
        if (!refreshToken) {
            throw new Error("Refresh token not found");
        }
        const userId = yield (0, GenerateToken_js_1.verifyRefreshToken)(refreshToken);
        const accessToken = yield (0, GenerateToken_js_1.AccessToken)(userId);
        const refToken = yield (0, GenerateToken_js_1.RefreshToken)(userId);
        res.cookie("AccessToken", accessToken, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 20 * 60 * 1000,
        });
        res.cookie("RefreshToken", refToken, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ accessToken: accessToken, refreshToken: refToken });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
