import express from "express";
import { resendOtp, verifyOtp } from "../controllers/OTP.controllers";
import { verifyAccessToken } from "../utils/GenerateToken";
const router = express.Router();

router.post("/verifymail", verifyAccessToken, verifyOtp);
router.post("/resend/:id", verifyAccessToken, resendOtp);

export default router;
