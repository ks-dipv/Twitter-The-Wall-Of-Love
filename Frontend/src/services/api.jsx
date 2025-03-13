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

// Fetch Wall by ID
export const getWallById = async (wallId) => {
  return api.get(`/walls/fetch/${wallId}`);
};

// Fetch Tweets for a Wall
export const getTweetsByWall = async (wallId) => {
  return api.get(`/walls/${wallId}/tweets/list`);
};

export const deleteTweet = async (wallId, tweetId) => {
  return api.delete(`/walls/${wallId}/tweets/${tweetId}`);
};

export const updateWall = async (wallId, wallData) => {
  return api.put(`/walls/update/${wallId}`, wallData);
};



export default api;
