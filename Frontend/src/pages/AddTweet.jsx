import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addTweetToWall } from "../services/api";

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
    navigate(`/walls/${wallId}`);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to add tweet.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Add Tweet</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter Tweet URL"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Adding..." : "Add Tweet"}
        </button>
      </form>
    </div>
  );
};

export default AddTweet;
