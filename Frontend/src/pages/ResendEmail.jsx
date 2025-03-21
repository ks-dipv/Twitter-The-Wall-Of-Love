import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ResendEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    let timer;
    if (isButtonDisabled) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setIsButtonDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isButtonDisabled]);

  const handleResend = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/verify-email/resend",
        { email }
      );
      setMessage(response.data.message || "Verification email sent successfully!");
      setIsButtonDisabled(true);
      setSeconds(30);
    } catch (error) {
      setMessage("Error resending email. Please try again later.");
      console.error("Resend email error:", error);
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
      <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Resend Verification Email
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          A verification email has been sent to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{email}</span>. 
          If you didn’t receive it, you can request a new one below.
        </p>

        <button
          onClick={handleResend}
          disabled={isButtonDisabled}
          className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition ${
            isButtonDisabled
              ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isButtonDisabled ? `Resend Email (${seconds}s)` : "Resend Email"}
        </button>

        {message && (
          <p className="mt-4 text-green-600 font-semibold">{message}</p>
        )}

        {/* Back to Home button */}
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          <span
            onClick={() => navigate("/signin")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
             &larr; Go to Signin
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResendEmail;
