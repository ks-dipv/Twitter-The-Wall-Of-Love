import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getWallById,
  getTweetsByWall,
  deleteTweet,
  reorderTweets,
} from "../services/api";
import TweetList from "../components/TweetList";
import Footer from "../components/Footer";
import Navbar from "../components/NavBar";

const WallPage = () => {
  const { id } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchWallData = async () => {
      try {
        const wallResponse = await getWallById(id);
        setWall(wallResponse.data);

        const tweetsResponse = await getTweetsByWall(id);
        setTweets(tweetsResponse.data);
      } catch (error) {
        console.error("Error fetching wall:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallData();
  }, [id]);

  const handleDelete = async (tweetId) => {
    if (!tweetId) return;

    try {
      await deleteTweet(wall.id, tweetId);
      setTweets((prevTweets) =>
        prevTweets.filter((tweet) => tweet.id !== tweetId)
      );
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  };

  const handleReorder = async (startIndex, endIndex) => {
    if (startIndex === endIndex) return;

    // Create a new array with the reordered items
    const reorderedTweets = arrayMove(tweets, startIndex, endIndex);

    // Update the state with the new order
    setTweets(reorderedTweets);

    // Save the new order to the server
    setIsSaving(true);
    try {
      const orderedTweetIds = reorderedTweets.map((tweet) => tweet.id);
      await reorderTweets(wall.id, orderedTweetIds);
    } catch (error) {
      console.error("Error reordering tweets:", error);
      // Optionally revert the order in case of error
      const tweetsResponse = await getTweetsByWall(id);
      setTweets(tweetsResponse.data);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShuffle = async () => {
    if (isSaving) return;

    // Shuffle tweets using Fisher-Yates algorithm
    const shuffledTweets = [...tweets];
    for (let i = shuffledTweets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTweets[i], shuffledTweets[j]] = [
        shuffledTweets[j],
        shuffledTweets[i],
      ];
    }

    setTweets(shuffledTweets);

    setIsSaving(true);
    try {
      const orderedTweetIds = shuffledTweets.map((tweet) => tweet.id);
      await reorderTweets(wall.id, orderedTweetIds);
    } catch (error) {
      console.error("Error updating shuffled tweets:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to move array items
  const arrayMove = (array, from, to) => {
    const newArray = [...array];
    const [movedItem] = newArray.splice(from, 1);
    newArray.splice(to, 0, movedItem);
    return newArray;
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!wall)
    return <p className="text-center mt-10 text-red-500">Wall not found.</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={wall.logo} wallId={wall.id} />
      <main className="flex-grow flex flex-col items-center p-6">
        {/* Header Section with Title and Description */}
        <div className="text-center mb-6 w-full">
          <h1 className="text-4xl font-extrabold text-gray-900 md:text-5xl">
            {wall.title}
          </h1>
          <p className="text-lg text-gray-700 mt-4 max-w-2xl mx-auto">
            {wall.description}
          </p>
        </div>

        {/* Action Section with Shuffle Button aligned to the right */}
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={handleShuffle}
            disabled={isSaving}
            className={`px-5 py-2 bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? "Updating..." : "🔀Shuffle Tweets"}
          </button>
        </div>

        {/* Tweets Section */}
        <div className="w-full">
          {tweets.length > 0 ? (
            <TweetList
              tweets={tweets}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg shadow-inner">
              <p className="text-xl text-gray-500">No tweets available</p>
              <p className="text-gray-400 mt-2">
                Tweets added to this wall will appear here
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default WallPage;
