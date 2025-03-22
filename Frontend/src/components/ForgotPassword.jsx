import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await requestPasswordReset(email);
      const successMessage =
        response.data.message || "Check your email for the reset link.";
      toast.success(successMessage);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to send reset email.";
      toast.error(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-vector/realistic-luxury-background_23-2149354608.jpg')",
      }}
    >
      <ToastContainer autoClose={2000} hideProgressBar />
      <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Reset Password
        </h2>

        {message && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
            {message}
          </div>
        )}
        

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          <Link to="/signin" className="text-blue-500 hover:underline">
            &larr; Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
