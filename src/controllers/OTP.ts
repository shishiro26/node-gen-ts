import OTP from "../models/OTP";
import User from "../models/User";
import otpGenerator from "otp-generator";
import { sendMailer } from "../utils/SendMail.js";
import { Request, Response } from "express";

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp, email } = req.body;

    const verifyOTP = await OTP.findOne({ email, otp });
    console.table({ otp, email });
    console.log(verifyOTP);
    if (!verifyOTP) {
      throw new Error("Invalid OTP or Email");
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true });
    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).json({ message: "User verified successfully" });
  } catch (err: any) {
    console.error(err);
    if (err.message === "Invalid OTP or Email") {
      res.status(401).json({ error: err.message });
    } else if (err.message === "User not found") {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

/* Resending the OTP */
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const otp = otpGenerator.generate(6, { digits: true });
    const email = user.email;

    await OTP.create({ otp, email });
    sendMailer(email, otp, user.Username, "resendOTP");

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err: any) {
    console.error(err);
    if (err.message === "User not found") {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to resend OTP" });
    }
  }
};
