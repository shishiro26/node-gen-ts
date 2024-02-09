"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const userSchema = new mongoose_1.default.Schema({
    Username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: [2, "Username must be at least 2 characters"],
        maxlength: [50, "Username must not exceed 50 characters"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, "Please provide a valid email"],
        maxlength: [50, "Email must not exceed 50 characters"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
    },
    image: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    },
    markedForDeletion: {
        type: Boolean,
        default: false,
        required: true,
    },
    expiresIn: {
        type: Date,
    },
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
