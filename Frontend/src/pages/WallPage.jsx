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
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { getFilteredTweetsByWall } from "../services/api";
const WallPage = () => {
  const { id } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    try {
      const response = await getFilteredTweetsByWall(id, startDate, endDate);
      setTweets(response.data);
    } catch (error) {
      console.error("Error filtering tweets:", error);
      toast.error("Failed to fetch filtered tweets.");
    }
  };

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
      toast.error("Error reordering tweets:", error);
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
      toast.error("Error updating shuffled tweets:", error);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar logo={wall.logo} wallId={wall.id} />

      <main className="flex-grow flex flex-col items-center p-6">
        {/* Header Section with Title and Animated Description */}
        <motion.div
          className="text-center mb-6 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 md:text-5xl tracking-wide">
            {wall.title}
          </h1>
          <motion.p
            className="text-lg mt-4 max-w-2xl mx-auto text-gray-700 font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            dangerouslySetInnerHTML={{ __html: wall.description }}
          ></motion.p>
        </motion.div>

        {/* Action Section with Shuffle Button */}
        <div className="w-full flex justify-end mb-4">
          <div className="flex flex-col items-end space-y-2">
            {/* Shuffle Button */}
            <button
              onClick={handleShuffle}
              disabled={isSaving}
              className="px-5 py-2 bg-[#334155] text-white font-medium rounded transition-all duration-300 hover:bg-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              🔀 Shuffle Tweets
            </button>

            {/* Filter Section - Small Box with 'From' & 'To' Labels */}
            <div className="flex flex-col items-end">
              <div className="bg-white p-3 -lg shadow-md flex items-center space-x-3 border border-gray-300">
                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 -md px-2 py-1 text-sm focus:ring focus:ring-blue-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 -md px-2 py-1 text-sm focus:ring focus:ring-blue-400"
                  />
                </div>
                <button
                  onClick={handleFilter}
                  className="p-2 bg-[#334155] text-white  rounded md transition-all duration-300 hover:bg-[#94A3B8] "
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
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
            <motion.div
              className="text-center py-12 bg-gray-50 rounded-lg shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <p className="text-xl text-gray-500">No tweets available</p>
              <p className="text-gray-400 mt-2">
                Tweets added to this wall will appear here
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default WallPage;
