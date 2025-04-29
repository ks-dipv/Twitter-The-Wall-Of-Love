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

const WallPage = () => {
  const { id } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [layout, setLayout] = useState("default"); // Default to grid layout

  useEffect(() => {
    const fetchWallData = async () => {
      setLoading(true);
      try {
        const wallResponse = await getWallById(id);
        setWall(wallResponse.data);

        const tweetsResponse = await getTweetsByWall(id, page, limit);
        const tweetsData = tweetsResponse.data?.tweets || [];
        setTweets(Array.isArray(tweetsData) ? tweetsData : []);
        setTotal(tweetsResponse.data?.total || 0);
        setTotalPages(tweetsResponse.data?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching wall:", error);
        toast.error("Failed to fetch wall data.");
        setTweets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWallData();
  }, [id, page, limit]);

  const handleDelete = async (tweetId) => {
    if (!tweetId || !wall?.id) return;

    try {
      await deleteTweet(wall.id, tweetId);
      setTweets((prevTweets) =>
        Array.isArray(prevTweets)
          ? prevTweets.filter((tweet) => tweet.id !== tweetId)
          : []
      );
      setTotal((prevTotal) => prevTotal - 1);
      toast.success("Deleted Tweet successfully!");
    } catch (error) {
      console.error("Error deleting tweet:", error);
      toast.error("Failed to delete tweet.");
    }
  };

  const handleReorder = async (startIndex, endIndex) => {
    if (startIndex === endIndex || !wall?.id) return;

    const reorderedTweets = arrayMove(tweets, startIndex, endIndex);
    setTweets(reorderedTweets);

    setIsSaving(true);
    try {
      // Fetch all tweets for the wall
      const allTweetsResponse = await getTweetsByWall(id, 1, limit, true); // Use all=true to fetch all 
      const allTweets = allTweetsResponse.data?.tweets || [];
      if (!Array.isArray(allTweets) || allTweets.length === 0) {
        throw new Error("No tweets found for this wall");
      }

      // Create a map of reordered tweets (visible tweets only)
      const reorderedIdsMap = new Map(
        reorderedTweets.map((tweet, index) => [tweet.id, index])
      );

       // Sort all tweets based on the reordered indices
      const orderedTweets = [...allTweets].sort((a, b) => {
        const aIndex = reorderedIdsMap.has(a.id)
          ? reorderedIdsMap.get(a.id)
          : allTweets.findIndex((t) => t.id === a.id);
        const bIndex = reorderedIdsMap.has(b.id)
          ? reorderedIdsMap.get(b.id)
          : allTweets.findIndex((t) => t.id === b.id);
        return aIndex - bIndex;
      });

      // Generate orderedTweetIds with all tweet IDs in the new order
      const orderedTweetIds = orderedTweets.map((tweet) => tweet.id);

      if (orderedTweetIds.length !== allTweets.length) {
        throw new Error("Invalid tweet order data: length mismatch");
      }

      const response = await reorderTweets(wall.id, orderedTweetIds);
      console.log("Reorder response:", response.data);
    } catch (error) {
      console.error("Error reordering tweets:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      const tweetsResponse = await getTweetsByWall(id, page, limit);
      const tweetsData = tweetsResponse.data?.tweets || [];
      setTweets(Array.isArray(tweetsData) ? tweetsData : []);
      toast.error("Error reordering tweets, reverting to server state.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShuffle = async () => {
    if (isSaving || !wall?.id) return;

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
      const allTweetsResponse = await getTweetsByWall(id, 1, limit, true);
      const allTweets = allTweetsResponse.data?.tweets || [];
      if (!Array.isArray(allTweets) || allTweets.length === 0) {
        throw new Error("No tweets found for this wall");
      }

      // Create a map of shuffled tweets (visible tweets only)
      const shuffledIdsMap = new Map(
        shuffledTweets.map((tweet, index) => [tweet.id, index])
      );

      // Sort all tweets based on the shuffled indices
      const orderedTweets = [...allTweets].sort((a, b) => {
        const aIndex = shuffledIdsMap.has(a.id)
          ? shuffledIdsMap.get(a.id)
          : allTweets.findIndex((t) => t.id === a.id);
        const bIndex = shuffledIdsMap.has(b.id)
          ? shuffledIdsMap.get(b.id)
          : allTweets.findIndex((t) => t.id === b.id);
        return aIndex - bIndex;
      });

      const orderedTweetIds = orderedTweets.map((tweet) => tweet.id);

      if (orderedTweetIds.length !== allTweets.length) {
        throw new Error("Invalid tweet order data: incomplete list");
      }

      const response = await reorderTweets(wall.id, orderedTweetIds);
      console.log("Shuffle response:", response.data);
    } catch (error) {
      console.error("Error updating shuffled tweets:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      const tweetsResponse = await getTweetsByWall(id, page, limit);
      const tweetsData = tweetsResponse.data?.tweets || [];
      setTweets(Array.isArray(tweetsData) ? tweetsData : []);
      toast.error("Error shuffling tweets, reverting to server state.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const response = await getFilteredTweetsByWall(id, startDate, endDate);
      const filteredData = response.data || [];
      setTweets(Array.isArray(filteredData) ? filteredData : []);
      setPage(1);
    } catch (error) {
      console.error("Error filtering tweets:", error);
      toast.error("Failed to fetch filtered tweets.");
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTweets = Array.isArray(tweets)
    ? tweets.filter((tweet) =>
        tweet?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const arrayMove = (array, from, to) => {
    const newArray = [...array];
    const [movedItem] = newArray.splice(from, 1);
    newArray.splice(to, 0, movedItem);
    return newArray;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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
              🔍
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
            wallId={wall.id}
            tweets={filteredTweets}
            onDelete={handleDelete}
            onReorder={handleReorder}
            page={page}
            total={total}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            layout={layout}
          />
          {/*  Pagination added here */}
          <div className="flex justify-center mt-6 gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default WallPage;
