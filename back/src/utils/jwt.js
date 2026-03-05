import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ISSUER = "btg-pactual-backend";
const AUDIENCE = "btg-pactual-clients";

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: ISSUER,
    audience: AUDIENCE,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwtSecret, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
