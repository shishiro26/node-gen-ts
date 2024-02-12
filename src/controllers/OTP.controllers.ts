import OTP from "../models/OTP.models";
import User from "../models/User.models";
import otpGenerator from "otp-generator";
import { sendMailer } from "../utils/SendMail";
import { Request, Response } from "express";

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp, email } = req.body;

    const verifyOTP = await OTP.findOne({ email, otp });
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

    const otp = await otpGenerator.generate(6, {
      digits: true,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });
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
