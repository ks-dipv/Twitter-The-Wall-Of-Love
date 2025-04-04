import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { loginWithGoogle } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(credentials);
      toast.success("Login successful! 🚀");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed, try again.");
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const googleToken = response.credential; // Google ID token
      const result = await loginWithGoogle(googleToken); // Call backend API
      login(result.data); // Store authentication data
      toast.success("Logged in successfully! 🎉");
      navigate("/admin/dashboard"); // Redirect user
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Google login failed, try again.");
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
      <ToastContainer hideProgressBar />

      <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Sign In
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#94A3B8] text-white p-3 rounded hover:bg-[#D1D5DB] transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center my-4 text-white">OR</p>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google Sign-In failed")}
        />

        <p className="text-center mt-4">
          <Link to="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </p>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
        <p className="text-center mt-4">
          <Link to="/" className="text-blue-500 hover:underline">
            &larr; Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
