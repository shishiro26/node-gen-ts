import { logEvents } from "./logger.js";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}\n`,
    "errLog.log"
  );
  console.log(err.message);

  const status = res.statusCode ? res.statusCode : 500;

  res.status(status);

  res.json({ message: err.message });
  next();
};
