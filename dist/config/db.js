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
const mongoose_1 = __importDefault(require("mongoose"));
const process_1 = __importDefault(require("process"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process_1.default.env.MONGO_URI || "");
        if (mongoose_1.default.connection.readyState === 1) {
            console.log(`🫂  Successfully connected to ${mongoose_1.default.connection.db.databaseName}`);
        }
        else {
            console.log(`👎 Mongodb error: Unable to retrieve database name. Connection state: ${mongoose_1.default.connection.readyState}`);
        }
    }
    catch (err) {
        console.log(`👎 Mongodb error:`, err.message);
    }
});
mongoose_1.default.connection.on("connected", () => {
    console.log(`🔃 Mongoose connected to db`);
});
mongoose_1.default.connection.on("error", (error) => {
    console.log(`${error.message}`);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log(`Mongoose disconnected 😥`);
});
process_1.default.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
    process_1.default.exit(0);
}));
exports.default = connectDB;
