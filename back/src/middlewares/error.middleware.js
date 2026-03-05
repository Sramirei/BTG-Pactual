import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Error interno del servidor",
    ...(env.nodeEnv !== "production" ? { error: err.message } : {}),
  });
};
