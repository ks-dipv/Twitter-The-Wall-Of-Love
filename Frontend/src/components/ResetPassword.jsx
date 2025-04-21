import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword, verifyResetToken } from "../services/api"; // Add a new API call to verify token
import { toast, ToastContainer } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify token validity when component mounts
    const checkToken = async () => {
      if (!token) {
        toast.error("Invalid or expired reset link.");
        setIsLoading(false);
        return;
      }

      try {
        // You'll need to implement this endpoint
        await verifyResetToken(token);
        setIsTokenValid(true);
      } catch (err) {
        toast.error(err.response?.data?.message || "Invalid or expired reset link.");
        setIsTokenValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isTokenValid) {
      toast.error("Cannot reset password with an invalid or expired link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword(token, newPassword);
      toast.success(response.data.message || "Password successfully reset.");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to reset password.";
      toast.error(errorMessage);
      
      // If token is invalid/expired, update state to hide form
      if (errorMessage.includes("invalid") || errorMessage.includes("expired") || errorMessage.includes("already been used")) {
        setIsTokenValid(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
        <div className="text-center">
          <p className="text-lg">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-vector/realistic-luxury-background_23-2149354608.jpg')",
      }}
    >
      <ToastContainer hideProgressBar />
      <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Reset Your Password
        </h2>

        {isTokenValid ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#94A3B8] text-white p-3 rounded hover:bg-[#D1D5DB] transition"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              This password reset link is invalid or has already been used.
            </div>
            <button
              onClick={() => navigate("/signin")}
              className="w-full bg-[#94A3B8] text-white p-3 rounded hover:bg-[#D1D5DB] transition"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;