"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.RefreshToken = exports.verifyAccessToken = exports.AccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.SECRET_KEY;
        const options = {
            expiresIn: "20m",
            issuer: "nodegen",
            audience: userId.toString(),
        };
        jsonwebtoken_1.default.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.error(err.message);
                reject(new Error("Could not generate access token"));
            }
            resolve(token);
        });
    });
};
exports.AccessToken = AccessToken;
const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.AccessToken;
    if (!token) {
        return next(new Error("Access token not found"));
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
            return next(new Error(message));
        }
        //@ts-expect-error
        req.payload = payload;
        next();
    });
};
exports.verifyAccessToken = verifyAccessToken;
const RefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.REFRESH_KEY;
        const options = {
            expiresIn: "1y",
            issuer: "nodegen",
            audience: userId.toString(),
        };
        jsonwebtoken_1.default.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.error(err.message);
                reject(new Error("Could not generate refresh token"));
            }
            resolve(token);
        });
    });
};
exports.RefreshToken = RefreshToken;
const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_KEY, (err, payload) => {
            if (err) {
                console.error(err.message);
                reject(new Error("Invalid refresh token"));
            }
            const userId = payload === null || payload === void 0 ? void 0 : payload.aud;
            if (!userId) {
                reject(new Error("Invalid payload in refresh token"));
            }
            resolve(userId);
        });
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
