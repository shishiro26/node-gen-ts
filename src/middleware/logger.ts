import { format } from "date-fns";
import * as path from "path";
import * as fs from "fs";
import { Response, Request, NextFunction } from "express";
const fsPromises = fs.promises;

export const logEvents = async (
  message: string,
  logFileName: string
): Promise<void> => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:MM:ss");
  const logItem = `${dateTime}\t${message}`;
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error: any) {
    console.log(error.message);
  }
};

export const logger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}\n`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};
