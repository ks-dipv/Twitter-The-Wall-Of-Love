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
  return api.post("/auth/signup", userData);
};

// Login request
export const loginUser = async (userData) => {
  return api.post("/auth/signin", userData);
};

// Logout request (clears cookies)
export const logoutUser = async () => {
  return api.post("/auth/logout");
};

export const getWalls = async () => {
  return api.get("/walls");
};

export const resetPassword = async (token, newPassword) => {
  return api.post(`/auth/reset-password/${token}`, { password: newPassword });
};

export const requestPasswordReset = async (email) => {
  return api.post("/auth/reset-password/request", { email });
};

export const getAllWalls = async () => {
  return api.get("/walls");
};

// Fetch Wall by ID
export const getWallById = async (wallId) => {
  return api.get(`/walls/${wallId}`);
};

export const addWalls = async (data) => {
  return api.post("/walls", data);
};

// Fetch Tweets for a Wall
export const getTweetsByWall = async (wallId) => {
  return api.get(`/walls/${wallId}/tweets`);
};

export const deleteTweet = async (wallId, tweetId) => {
  return api.delete(`/walls/${wallId}/tweets/${tweetId}`);
};

export const updateWall = async (wallId, wallData) => {
  return api.put(`/walls/${wallId}`, wallData);
};

export default api;
