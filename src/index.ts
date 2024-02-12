import express, { NextFunction } from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

import connectDB from "./config/db.server";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import userRoutes from "./routes/User.routes";
import otpRoutes from "./routes/OTP.routes";
import { updateImage } from "./controllers/User.controllers";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(logger);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("WELCOME TO NODGEN");
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/auth/otp", otpRoutes);
app.post("/api/v1/auth/updateImage/:id", upload.single("image"), updateImage);

app.use(errorHandler);

const port = process.env.PORT || 5000;
server.listen(port, () =>
  console.log(`🚀 server at http://localhost:${port}.`)
);
connectDB();
