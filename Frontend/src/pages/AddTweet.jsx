import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addTweetToWall, addHashtagTweetsToWall, addHandleTweetsToWall } from "../services/api"; 
import { Loader2, Hash, Link2 } from "lucide-react"; 
import { toast, ToastContainer } from "react-toastify";

const AddTweet = () => {
  const { wallId } = useParams();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("url"); 
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      toast.error("Input cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      if (selectedOption === "url") {
        await addTweetToWall(wallId, inputValue);
        toast.success("Tweet added successfully! 🚀");
      } else if (selectedOption === "hashtag") {
        await addHashtagTweetsToWall(wallId, inputValue);
        toast.success("Tweets added from hashtag successfully! 🚀");
      } else if (selectedOption === "handle") {
        await addHandleTweetsToWall(wallId, inputValue);
        toast.success("Tweets added from handle (profile URL) successfully! 🚀");
      }
      setTimeout(() => {
        navigate(`/admin/walls/${wallId}`);
      }, 1000);
    } catch (err) {
      console.error("API Error:", err.response?.data?.message || "Failed to add tweets.");
      toast.error(err.response?.data?.message || "Failed to add tweets.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer hideProgressBar />
      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-2xl space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Add Tweets to Your Wall
        </h2>

        {/* Options */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { setSelectedOption("url"); setInputValue(""); }}
            className={`px-4 py-2 rounded-full font-semibold ${
              selectedOption === "url" ? "bg-[#334155] text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            By URL
          </button>
          <button
            onClick={() => { setSelectedOption("hashtag"); setInputValue(""); }}
            className={`px-4 py-2 rounded-full font-semibold ${
              selectedOption === "hashtag" ? "bg-[#334155] text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            By Hashtag
          </button>
          <button
            onClick={() => { setSelectedOption("handle"); setInputValue(""); }}
            className={`px-4 py-2 rounded-full font-semibold ${
              selectedOption === "handle" ? "bg-[#334155] text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            By Handle
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {selectedOption === "hashtag" ? <Hash size={20} /> : <Link2 size={20} />}
            </span>
            <input
              type="text"
              placeholder={
                selectedOption === "url"
                  ? "Enter Tweet URL..."
                  : selectedOption === "hashtag"
                  ? "Enter Hashtag..."
                  : "Enter Twitter Profile URL..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#334155] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#94A3B8] transition"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              `+ Add Tweet${selectedOption !== "url" ? "s" : ""} by ${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTweet;
