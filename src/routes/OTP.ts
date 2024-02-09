import express from "express";
import { resendOtp, verifyOtp } from "../controllers/OTP";
const router = express.Router();

router.post("/verifymail", verifyOtp);
router.post("/resend/:id", resendOtp);

export default router;
