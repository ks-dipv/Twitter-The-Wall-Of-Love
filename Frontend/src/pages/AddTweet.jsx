import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addTweetToWall } from "../services/api";
import { Loader2 } from "lucide-react";

const AddTweet = () => {
  const { wallId } = useParams();
  const navigate = useNavigate();
  const [tweetUrl, setTweetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!tweetUrl.trim()) {
      setError("Tweet URL cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      await addTweetToWall(wallId, tweetUrl);
      alert("Tweet added successfully!");
      navigate(`/admin/walls/${wallId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add tweet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          ✨ Add a Tweet to Your Wall
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "+ Add Tweet"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTweet;
