import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getWallById,
  getTweetsByWall,
  deleteTweet,
  reorderTweets,
  getFilteredTweetsByWall,
} from "../services/api";
import TweetList from "../components/TweetList";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { RefreshCcw, Search } from "lucide-react";

const WallPage = () => {
  const { id } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [layout, setLayout] = useState("default");

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

    const reorderedTweets = arrayMove(tweets, startIndex, endIndex);
    setTweets(reorderedTweets);

    setIsSaving(true);
    try {
      const orderedTweetIds = reorderedTweets.map((tweet) => tweet.id);
      await reorderTweets(wall.id, orderedTweetIds);
    } catch (error) {
      toast.error("Error reordering tweets:", error);
      const tweetsResponse = await getTweetsByWall(id);
      setTweets(tweetsResponse.data);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShuffle = async () => {
    if (isSaving) return;

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

  const filteredTweets = tweets.filter((tweet) =>
    tweet.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex justify-center items-center flex-grow space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tweets..."
              className="px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-2 border rounded-lg"
            />
            <button
              onClick={handleFilter}
              className="p-2 bg-[#334155] text-white rounded transition-all duration-300 hover:bg-[#94A3B8]"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-[#334155] rounded hover:bg-[#94A3B8] text-white"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="px-4 py-2 border rounded-lg shadow-sm focus:ring-gray-400 focus:border-gray-400"
              aria-label="Select tweet layout"
            >
              <option value="default">Default</option>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="odd-even">Odd-Even</option>
            </select>
            <button
              onClick={handleShuffle}
              disabled={isSaving}
              className="px-5 py-2 bg-[#334155] text-white font-medium rounded transition-all duration-300 hover:bg-[#94A3B8] flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faShuffle} /> Shuffle Tweets
            </button>
          </div>
        </div>

        <div className="w-full">
          <TweetList
            tweets={filteredTweets}
            onDelete={handleDelete}
            onReorder={handleReorder}
            layout={layout}
          />
        </div>
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default WallPage;
