import express from "express";
const router = express.Router();
import {
  login,
  logout,
  updatePassword,
  register,
  userInfo,
  refreshToken,
} from "../controllers/User";
import { verifyAccessToken, verifyRefreshToken } from "../utils/GenerateToken";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.patch("/updatePwd/:id", verifyAccessToken, updatePassword);
router.get("/userInfo/:id", verifyAccessToken, userInfo);
router.post("/refresh-token", refreshToken);

export default router;
