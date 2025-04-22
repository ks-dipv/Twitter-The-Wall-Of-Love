import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userVerify, checkVerificationToken } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyEmail = () => {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // First check if the token exists
    if (!verificationToken) {
      setStatus("error");
      setMessage("Invalid verification link.");
      toast.error("Invalid verification link.");
      return;
    }

    // Check if the token is valid
    const validateToken = async () => {
      try {
        await checkVerificationToken(verificationToken);
        setStatus("valid"); // Token is valid and not yet used
      } catch (error) {
        setStatus("error");
        const errorMessage =
          error.response?.data?.message || "Invalid verification link.";

        // Check if the email has already been verified
        if (errorMessage.includes("already been verified")) {
          setMessage("Your email has already been verified. Please sign in.");
          toast.info("Your email has already been verified. Please sign in.");
        } else {
          setMessage(errorMessage);
          toast.error(errorMessage);
        }
      }
    };

    validateToken();
  }, [verificationToken]);

  const handleVerify = async () => {
    try {
      const response = await userVerify(verificationToken);
      setStatus("verified");
      setMessage(response.data.message || "Email verified successfully!");
      toast.success("Email verified successfully!");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error) {
      setStatus("error");
      const errorMessage =
        error.response?.data?.message || "Failed to verify email.";
      setMessage(errorMessage);

      if (errorMessage.includes("already been verified")) {
        toast.info("Your email has already been verified. Please sign in.");
      } else if (errorMessage.includes("expired")) {
        toast.error(
          "Your verification link has expired. Please request a new one."
        );
      } else {
        toast.error(errorMessage);
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
        <h2 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
          Verify Your Email
        </h2>

        {status === "loading" && (
          <div className="text-center my-6">
            <p>Checking verification link...</p>
          </div>
        )}

        {status === "valid" && (
          <>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              To activate your account, please verify your email by clicking the
              button below.
            </p>
            <button
              onClick={handleVerify}
              className="w-full bg-[#94A3B8] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#D1D5DB] transition"
            >
              Verify Email
            </button>
          </>
        )}

        {status === "verified" && (
          <>
            <div className="text-center mb-6">
              <p className="text-green-600 font-semibold">{message}</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                You will be redirected to the sign in page shortly.
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-center mb-6">
              <p className="text-red-600 font-semibold">{message}</p>
            </div>
            <button
              onClick={() => navigate("/signin")}
              className="w-full bg-[#94A3B8] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#D1D5DB] transition"
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
