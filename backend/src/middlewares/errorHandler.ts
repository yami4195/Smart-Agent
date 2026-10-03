import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
}

/**
 * Centralized express error handler middleware.
 * Ensures consistent JSON responses across the entire API.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  console.error(`[Error] ${statusCode} - ${message}`);
  if (process.env.NODE_ENV === "development" && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
