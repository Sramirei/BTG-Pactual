import { AppError } from "../errors/app-error.js";

export const encodeCursor = (key) =>
  Buffer.from(JSON.stringify(key), "utf8").toString("base64url");

export const decodeCursor = (cursor) => {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid cursor object");
    }

    return parsed;
  } catch {
    throw new AppError(400, "Cursor invalido");
  }
};
