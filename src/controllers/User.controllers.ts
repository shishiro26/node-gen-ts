import bcrypt from "bcrypt";
import User from "../models/User.models";
import otpGenerator from "otp-generator";
import { sendMailer } from "../utils/SendMail";
import mongoose from "mongoose";
import OTP from "../models/OTP.models";
import { NextFunction, Request, Response } from "express";
import {
  AccessToken,
  RefreshToken,
  verifyRefreshToken,
} from "../utils/GenerateToken";

export const register = async (req: Request, res: Response) => {
  try {
    const { Username, email, password } = req.body;

    const duplicate = await User.findOne({ email }).exec();
    if (duplicate) {
      return res.status(409).json({
        message: "User already exists. Try signing up with a different email.",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashedPwd = await bcrypt.hash(password, salt);

    const otp = await otpGenerator.generate(6, {
      digits: true,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });

    if (!otp) {
      throw new Error("Failed to generate OTP");
    }

    const user = await User.create({
      Username,
      email,
      password: hashedPwd,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${Username}`,
      isVerified: false,
    });

    if (!user) {
      throw new Error("Failed to create user");
    }
    await OTP.create({ email, otp });

    sendMailer(email, otp, user.Username, "registration");
    const accessToken = await AccessToken(user._id);
    const refreshToken = await RefreshToken(user._id);

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
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = await AccessToken(user._id);
    const refreshToken = await RefreshToken(user._id);

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
  } catch (error: any) {
    console.error(error);

    let errorMessage = "Internal server error. Please try again later.";
    if (error.message === "User not found") {
      res.status(404);
      errorMessage = "User not found";
    } else if (error.message === "Invalid credentials") {
      res.status(401);
      errorMessage = "Invalid credentials";
    }
    res.json({ error: errorMessage });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userDetails = await User.findById(id);

    if (!userDetails) {
      throw new Error("User not found");
    }

    if (!userDetails.isVerified) {
      throw new Error("User is not verified");
    }

    const { oldPassword, newPassword } = req.body;

    const isPasswordMatch = await bcrypt.compareSync(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      throw new Error("Invalid old password");
    }

    const salt = await bcrypt.genSalt();
    const hashedPwd = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(id, { password: hashedPwd });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error(error);
    let errorMessage = "Internal server error. Please try again later.";
    if (error.message === "User not found") {
      res.status(404);
      errorMessage = "User not found";
    } else if (error.message === "User is not verified") {
      res.status(401);
      errorMessage = "User is not verified";
    } else if (error.message === "New passwords do not match") {
      res.status(400);
      errorMessage = "New passwords do not match";
    } else if (error.message === "Invalid old password") {
      res.status(401);
      errorMessage = "Invalid old password";
    }
    res.json({ error: errorMessage });
  }
};

export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID format");
    }

    const userDetails = await User.findById(id);

    if (!userDetails) {
      throw new Error("User not found");
    }

    if (!userDetails.isVerified) {
      throw new Error("User is not verified");
    }

    if (!req?.file) {
      throw new Error("No image file provided");
    }

    const base64Image = req?.file?.buffer.toString("base64");

    await User.findByIdAndUpdate(id, { image: base64Image });

    res.status(200).json({ message: "Image updated successfully" });
  } catch (error: any) {
    console.error(error);
    let errorMessage = "Internal server error. Please try again later.";
    if (error.message === "Invalid user ID format") {
      res.status(400);
      errorMessage = "Invalid user ID format";
    } else if (error.message === "User not found") {
      res.status(404);
      errorMessage = "User not found";
    } else if (error.message === "User is not verified") {
      res.status(401);
      errorMessage = "User is not verified";
    } else if (error.message === "No image file provided") {
      res.status(400);
      errorMessage = "No image file provided";
    }
    res.json({ error: errorMessage });
  }
};

/* Logout the user */
export const logout = (req: Request, res: Response) => {
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

/* Get the user Info */
export const userInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID format");
    }
    //@ts-expect-error
    if (req.payload.aud !== id) {
      throw new Error("Invalid access token");
    }

    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isVerified) {
      throw new Error("User is not verified");
    }

    res.status(200).json({ data: user });
  } catch (error: any) {
    console.error(error);
    let errorMessage = "Internal server error. Please try again later.";
    if (error.message === "Invalid user ID format") {
      res.status(400);
      errorMessage = "Invalid user ID format";
    } else if (error.message === "Invalid access token") {
      res.status(401);
      errorMessage = "Invalid access token";
    } else if (error.message === "User not found") {
      res.status(404);
      errorMessage = "User not found";
    } else if (error.message === "User is not verified") {
      res.status(401);
      errorMessage = "User is not verified";
    }
    res.json({ error: errorMessage });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.RefreshToken;
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await AccessToken(userId);
    const refToken = await RefreshToken(userId);

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
  } catch (error) {
    next(error);
  }
};
