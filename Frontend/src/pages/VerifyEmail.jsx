import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:3000/api"; 

const VerifyEmail = () => {
  const { verificationToken } = useParams(); // Extract token from the URL path
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!verificationToken) {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [verificationToken]);

  const handleVerify = async () => {
    if (!verificationToken) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/verify-email/${verificationToken}`, { verificationToken});
      setStatus("success");
      setMessage(response.data.message || "Email verified successfully!");
      setTimeout(() => navigate("/signin"),3000); // Redirect to sign-in after 3 seconds
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Failed to verify email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center w-96">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h2>

        {status === "pending" && verificationToken && (
          <>
            <p className="text-gray-600 mb-4">Click the button below to verify your email.</p>
            <button
              onClick={handleVerify}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Verify Email
            </button>
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-green-600 mb-4">{message}</p>
            <p className="text-gray-500 text-sm">Redirecting to sign in...</p>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
