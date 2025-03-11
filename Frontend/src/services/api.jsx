import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const registerUser = async (userData) => {
  return api.post("user/auth/signup", userData);
};

// Login request
export const loginUser = async (userData) => {
  return api.post("user/auth/signin", userData);
};

// Logout request (clears cookies)
export const logoutUser = async () => {
  return api.post("user/auth/logout");
};

export const getWalls = async () => {
  return api.get("/walls/list");
};

export const resetPassword = async (token, newPassword) => {
  return api.post(`/user/auth/reset-password/${token}`, { password: newPassword });
};

export const requestPasswordReset = async (email) => {
  return api.post("/user/auth/reset-password/request", { email });
};


export default api;
