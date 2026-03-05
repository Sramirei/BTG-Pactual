import axios from "axios";

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, statusCode, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const buildHeaders = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const request = async (path, { method = "GET", token, body, params } = {}) => {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      headers: buildHeaders(token),
      ...(body ? { data: body } : {}),
      ...(params ? { params } : {}),
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const payload = error.response?.data;

      const message =
        (typeof payload === "object" && payload?.message) ||
        error.message ||
        "No fue posible completar la solicitud";

      const details = typeof payload === "object" ? payload?.details : undefined;

      throw new ApiError(message, statusCode, details);
    }

    throw new ApiError("No fue posible completar la solicitud", 500);
  }
};

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  getProfile: (token) => request("/auth/me", { token }),
  listFunds: (token) => request("/funds", { token }),
  createFund: (token, payload) => request("/funds", { method: "POST", token, body: payload }),
  listSubscriptions: (token) => request("/subscriptions", { token }),
  subscribe: (token, payload) =>
    request("/subscriptions", { method: "POST", token, body: payload }),
  cancelSubscription: (token, fundId) =>
    request(`/subscriptions/${encodeURIComponent(fundId)}`, { method: "DELETE", token }),
  topUpBalance: (token, payload) =>
    request("/transactions/top-up", { method: "POST", token, body: payload }),
  listTransactions: (token, { limit = 20, cursor } = {}) => {
    return request("/transactions", {
      token,
      params: {
        limit,
        ...(cursor ? { cursor } : {}),
      },
    });
  },
};
