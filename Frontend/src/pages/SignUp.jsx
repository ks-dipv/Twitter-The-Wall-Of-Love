import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: null,
  });

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [emailError, setEmailError] = useState("");

  const validatePassword = (password) => {
    const errors = [];

    // Check minimum length
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    // Check for at least one letter
    if (!/[A-Za-z]/.test(password)) {
      errors.push("Password must include at least one letter");
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      errors.push("Password must include at least one number");
    }

    // Check for at least one special character
    if (!/[@$!%*#?&]/.test(password)) {
      errors.push("Password must include at least one special character");
    }

    return errors;
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Reset email error when email changes
    if (name === "email") {
      setEmailError("");
    }

    // Special handling for password validation
    if (name === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_pic: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setEmailError("");
    setPasswordErrors([]);

    // Validate all fields
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required.");
      return;
    }

    // Check password validation before submission
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      passwordValidationErrors.forEach((error) => toast.error(error));
      return;
    }

    try {
      const requestBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profile_pic: formData.profile_pic,
      };
      const response = await registerUser(requestBody);
      signup(response.data);

      toast.success("Verification email sent! Please check your inbox 📩.");

      setTimeout(() => {
        navigate("/resend-email", { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      // Handle specific email-related errors
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.message;

        // Check for email-specific error messages
        if (
          errorMessage.includes("Invalid email address") ||
          errorMessage.includes("Email already exists") ||
          errorMessage.includes("Email is not valid")
        ) {
          setEmailError(errorMessage);
        } else {
          toast.error(errorMessage || "Signup failed, try again.");
        }
      } else {
        toast.error("Signup failed, try again.");
      }
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
          Create an account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span className="text-red-500">*</span>
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
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                emailError ? "border-red-500" : ""
              }`}
              placeholder="Enter email"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-2">{emailError}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
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
            {passwordErrors.length > 0 && (
              <div className="mt-2 text-red-500 text-sm">
                <ul className="list-disc list-inside">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border text-white rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#94A3B8] text-white p-3 mt-4 rounded hover:bg-[#94A3B8] transition"
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
        <p className="text-center mt-4">
          <Link to="/" className="text-blue-500 hover:underline">
            &larr; Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
