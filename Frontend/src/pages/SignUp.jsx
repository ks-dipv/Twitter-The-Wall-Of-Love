import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await registerUser(formData);
      signup(response.data)
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed, try again.");
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
  <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 w-full max-w-md">
    <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
      Create an account
    </h2>
    {error && (
      <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
    )}

    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter your full name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter email"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter password"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition"
      >
        Sign Up
      </button>
    </form>
    <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
      Already have an account?{" "}
      <Link to="/signin" className="text-blue-500 hover:underline">
        Sign In
      </Link>
    </p>
  </div>
</div>

  );
};

export default SignUp;
