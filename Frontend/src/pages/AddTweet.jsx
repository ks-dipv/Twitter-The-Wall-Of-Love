import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addTweetToWall, addHashtagTweetsToWall } from "../services/api"; // new service
import { Loader2, Hash } from "lucide-react"; // Import # icon
import { toast, ToastContainer } from "react-toastify";

const AddTweet = () => {
  const { wallId } = useParams();
  const navigate = useNavigate();
  const [tweetUrl, setTweetUrl] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!tweetUrl.trim()) {
      toast.error("Tweet URL cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      await addTweetToWall(wallId, tweetUrl);
      toast.success("Tweet added successfully! 🚀");
      setTimeout(() => {
        navigate(`/admin/walls/${wallId}`);
      }, 1000);
    } catch (err) {
      console.error("API Error:",err.response?.data?.message || "Failed to add tweet.");
      toast.error(err.response?.data?.message || "Failed to add tweet.");
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!hashtag.trim()) {
      toast.error("Hashtag cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      await addHashtagTweetsToWall(wallId, hashtag);
      toast.success("Tweets added from hashtag successfully! 🚀");
      setTimeout(() => {
        navigate(`/admin/walls/${wallId}`);
      }, 1000);
    } catch (err) {
      console.error("API Error:", err.response?.data?.message || "Failed to add hashtag tweets.");
      toast.error(err.response?.data?.message || "Failed to add hashtag tweets.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer hideProgressBar />
      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-2xl space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
           Add Tweet to Your Wall
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Add Tweet by URL */}
        <form onSubmit={handleTweetSubmit} className="space-y-4">
          <input
            type="url"
            placeholder="Enter Tweet URL..."
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#334155] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#94A3B8] transition"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "+ Add Tweet by URL"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="text-center text-gray-400">OR</div>

        {/* Add Tweets by Hashtag */}
        <form onSubmit={handleHashtagSubmit} className="space-y-4 relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Hash size={20} />
            </span>
            <input
              type="text"
              placeholder="Enter Hashtag..."
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
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
              "+ Add Tweets by Hashtag"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTweet;
