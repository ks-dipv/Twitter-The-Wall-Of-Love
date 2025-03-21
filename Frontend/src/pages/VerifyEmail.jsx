import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userVerify } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyEmail = () => {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!verificationToken) {
      toast.error("Invalid verification link.");
    }
  }, [verificationToken]);

  const handleVerify = async () => {
    if (!verificationToken) {
      toast.error("Invalid verification link.");
      return;
    }

    try {
      const response = await userVerify(verificationToken);
      setStatus("success");
      toast.success("Email verified successfully!");
      setTimeout(() => navigate("/signin"), 4000);
    } catch (error) {
      setStatus("error");
      const errorMsg =
        error.response?.data?.message || "Failed to verify email.";

      toast.error(errorMsg);
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
      <ToastContainer />
      <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
          Verify Your Email
        </h2>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          To activate your account, please verify your email by clicking the
          button below. If the verification link has expired, request a new one
          from your email.
        </p>

        {status === "pending" && verificationToken && (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Click the button below to verify your email.
            </p>
            <button
              onClick={handleVerify}
              className="w-full bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Verify Email
            </button>
          </>
        )}

        {status === "success" && (
          <p className="text-green-600 font-semibold mb-4">{message}</p>
        )}

        {status === "error" && (
          <>
            <p className="text-red-600 font-semibold mb-4">{message}</p>
            <button
              onClick={() => navigate("/signin")}
              className="w-full bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
