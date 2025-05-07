import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
import { RefreshCcw, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  // Pagination states
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);


  useEffect(() => {
    const fetchWallData = async () => {
      try {
        const wallResponse = await getWallById(id);
        setWall(wallResponse.data);
        fetchTweets(pageFromUrl); // fetch tweets for the page from URL
      } catch (error) {
        console.error("Error fetching wall:", error);
        setLoading(false);
      }
    };
  
    fetchWallData();
  }, [id, pageFromUrl]);
  

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);

    if (isDateFiltered) {
      handleFilter(page);
    } else {
      fetchTweets(page);
    }
  }, [searchParams]);

  const fetchTweets = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const tweetsResponse = await getTweetsByWall(id, page, limit);
      setTweets(tweetsResponse.data.data);
      setCurrentPage(tweetsResponse.data.meta.currentPage);
      setTotalPages(tweetsResponse.data.meta.totalPages);
      setTotalItems(tweetsResponse.data.meta.totalItems);
      setItemsPerPage(tweetsResponse.data.meta.itemsPerPage);
      setIsDateFiltered(false);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      toast.error("Failed to fetch tweets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tweetId) => {
    if (!tweetId) return;

    try {
      await deleteTweet(wall.id, tweetId);
      // After deleting, refresh the current page
      if (isDateFiltered) {
        handleFilter(currentPage);
      } else {
        fetchTweets(currentPage);
      }
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  };

  const handleReorder = async (startIndex, endIndex) => {
    if (startIndex === endIndex) return;

    // Only reorder within the current page
    const reorderedTweets = arrayMove(tweets, startIndex, endIndex);
    setTweets(reorderedTweets);

    setIsSaving(true);
    try {
      // First get all tweets to preserve the full ordering
      const allTweetsResponse = await getTweetsByWall(id, 1, totalItems);
      const allTweets = allTweetsResponse.data.data;

      // Calculate the offset in the full list based on current page
      const offset = (currentPage - 1) * itemsPerPage;

      // Create a map of all tweets by ID for quick lookup
      const tweetMap = new Map(allTweets.map((tweet) => [tweet.id, tweet]));

      // Replace the current page tweets in the full list
      for (let i = 0; i < reorderedTweets.length; i++) {
        const index = offset + i;
        if (index < allTweets.length) {
          allTweets[index] = reorderedTweets[i];
        }
      }

      // Send the full ordered list of IDs
      const orderedTweetIds = allTweets.map((tweet) => tweet.id);
      await reorderTweets(wall.id, orderedTweetIds);
    } catch (error) {
      console.error("Error reordering tweets:", error);
      toast.error("Error reordering tweets");
      // Refresh the current page if there's an error
      if (isDateFiltered) {
        handleFilter(currentPage);
      } else {
        fetchTweets(currentPage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShuffle = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // Get all tweets first
      const allTweetsResponse = await getTweetsByWall(id, 1, totalItems);
      const allTweets = allTweetsResponse.data.data;

      // Shuffle all tweets
      const shuffledTweets = [...allTweets];
      for (let i = shuffledTweets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTweets[i], shuffledTweets[j]] = [
          shuffledTweets[j],
          shuffledTweets[i],
        ];
      }

      // Send the full shuffled list of IDs to the backend
      const orderedTweetIds = shuffledTweets.map((tweet) => tweet.id);
      await reorderTweets(wall.id, orderedTweetIds);

      if (isDateFiltered) {
        handleFilter(currentPage);
      } else {
        fetchTweets(currentPage);
      }
    } catch (error) {
      console.error("Error shuffling tweets:", error);
      toast.error("Error updating shuffled tweets");
      if (isDateFiltered) {
        handleFilter(currentPage);
      } else {
        fetchTweets(currentPage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilter = async (page = 1) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const response = await getFilteredTweetsByWall(
        id,
        startDate,
        endDate,
        page,
        itemsPerPage
      );
      setTweets(response.data.data);
      setCurrentPage(response.data.meta.currentPage);
      setTotalPages(response.data.meta.totalPages);
      setTotalItems(response.data.meta.totalItems);
      setIsDateFiltered(true);
    } catch (error) {
      console.error("Error filtering tweets:", error);
      toast.error("Failed to fetch filtered tweets.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    setSearchParams({ page: newPage });
    setCurrentPage(newPage);

    if (isDateFiltered) {
      handleFilter(newPage);
    } else {
      fetchTweets(newPage);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 mb-6">
        <nav className="flex items-center">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            First
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`mx-1 p-1 rounded ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronLeft size={18} />
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === number
                  ? "bg-[#334155] text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`mx-1 p-1 rounded ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last
          </button>
        </nav>
      </div>
    );
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
              onClick={() => handleFilter(1)}
              className="p-2 bg-[#334155] text-white rounded transition-all duration-300 hover:bg-[#94A3B8]"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => {
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
                fetchTweets(1);
              }}
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

        {renderPagination()}
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default WallPage;
