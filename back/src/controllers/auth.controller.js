import { login, register, getProfile } from "../services/auth.service.js";

export const registerController = async (req, res) => {
  const data = await register(req.body);
  res.status(201).json(data);
};

export const loginController = async (req, res) => {
  const data = await login(req.body);
  res.status(200).json(data);
};

export const meController = async (req, res) => {
  const profile = await getProfile(req.user.userId);
  res.status(200).json(profile);
};
