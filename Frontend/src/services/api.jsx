import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Register User (Sign Up)
export const registerUser = async (userData) => {
  return api.post("/auth/signup", userData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const loginWithGoogle = async (token) => {
  return api.post("auth/google-authentication", { token: token });
};

// Login Request (Sign In)
export const loginUser = async (userData) => {
  return api.post("/auth/signin", userData);
};

// Logout Request
export const logoutUser = async () => {
  return api.post("/auth/logout");
};

export const generateSharableLink = async (wallId) => {
  return api.post(`/walls/${wallId}/generate-link`, {}); // Send an empty object to match backend expectations
};

export const getSharableLink = async (wallId, uniqueId) => {
  return api.get(`/walls/${wallId}/link/${uniqueId}`);
};

export const getWallDetails = async (wallId) => {
  return api.get(`/walls/${wallId}`);
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
  return api.post("/walls", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteWall = async (id) => {
  return api.delete(`/walls/${id}`);
};

// Fetch Tweets for a Wall
export const getTweetsByWall = async (wallId) => {
  return api.get(`/walls/${wallId}/tweets`);
};

export const deleteTweet = async (wallId, tweetId) => {
  return api.delete(`/walls/${wallId}/tweets/${tweetId}`);
};

export const updateWall = async (wallId, formData) => {
  return api.put(`/walls/${wallId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const addTweetToWall = async (wallId, tweetUrl) => {
  return api.post(`/walls/${wallId}/tweets`, { tweetUrl });
};

export const reorderTweets = async (wallId, orderedTweetIds) => {
  return api.put(`/walls/${wallId}/tweets/reorder`, { orderedTweetIds });
};

export const userVerify = async (token) => {
  return api.post(`/auth/verify-email/${token}`, { token });
};

export const totalData = async () => {
  return api.post("/walls/total-data");
};

export const getUser = async () => {
  return api.get("user");
};

export const updateProfile = async (formDataObj) => {
  return api.put("user/profile", formDataObj, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getApiToken = async () => {
  return api.post("/developer/api-token");
};

export const searchTweets = async (wallId, query) => {
  return await axios.get(`/api/walls/${wallId}/tweet?search=${query}`);
};

export const getFilteredTweetsByWall = async (wallId, startDate, endDate) => {
  return await axios.get(
    `/api/walls/${wallId}/filter?startDate=${startDate}&endDate=${endDate}`
  );
};

export const getPublicWalls = async () => {
  return await api.get("/walls/public");
};

export const getCheckoutSessionUrl = async (planId) => {
  return api.post(`/subscription/checkout/${planId}`);
};

export const getAllPlan = async () => {
  return api.get("/plans");
};

export const getActiveSubscription = async () => {
  return await axios.get("/api/subscription/active"); 
};

export default api;
