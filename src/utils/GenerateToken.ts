import jwt, { VerifyErrors } from "jsonwebtoken";
import mongoose from "mongoose";
import { Response, Request, NextFunction } from "express";

type Payload = {
  [key: string]: any;
};

type Options = {
  expiresIn: string;
  issuer: string;
  audience: string;
};

export const AccessToken = (
  userId: mongoose.Types.ObjectId
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload: Payload = {};
    const secret = process.env.SECRET_KEY as string;
    const options: Options = {
      expiresIn: "20m",
      issuer: "nodgen.com",
      audience: userId.toString(),
    };

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error(err.message);
        reject(new Error("Could not generate access token"));
      }
      resolve(token as string);
    });
  });
};

export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.AccessToken;
  if (!token) {
    return next(new Error("Access token not found"));
  }
  jwt.verify(token, process.env.SECRET_KEY as string, (err: VerifyErrors | null , payload:any) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(new Error(message));
    }
    //@ts-expect-error
    req.payload = payload as Payload;
    next();
  });
};

export const RefreshToken = (
  userId: mongoose.Types.ObjectId
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload: Payload = {};
    const secret = process.env.REFRESH_KEY as string;
    const options: Options = {
      expiresIn: "1y",
      issuer: "nodgen.com",
      audience: userId.toString(),
    };

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error(err.message);
        reject(new Error("Could not generate refresh token"));
      }
      resolve(token as string);
    });
  });
};

export const verifyRefreshToken = (
  refreshToken: string
): Promise<mongoose.Types.ObjectId> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_KEY as string,
      (err, payload) => {
        if (err) {
          console.error(err.message);
          reject(new Error("Invalid refresh token"));
        }
        const userId = (payload as Payload)?.aud;
        if (!userId) {
          reject(new Error("Invalid payload in refresh token"));
        }
        resolve(userId as mongoose.Types.ObjectId);
      }
    );
  });
};
