import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 2,
    },
  },
  { timestamps: true }
);
const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
