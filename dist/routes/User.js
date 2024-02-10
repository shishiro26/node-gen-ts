"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const User_controllers_1 = require("../controllers/User.controllers");
const GenerateToken_1 = require("../utils/GenerateToken");
router.post("/register", User_controllers_1.register);
router.post("/login", User_controllers_1.login);
router.post("/logout", User_controllers_1.logout);
router.patch("/updatePwd/:id", GenerateToken_1.verifyAccessToken, User_controllers_1.updatePassword);
router.get("/userInfo/:id", GenerateToken_1.verifyAccessToken, User_controllers_1.userInfo);
router.post("/refresh-token", User_controllers_1.refreshToken);
exports.default = router;
