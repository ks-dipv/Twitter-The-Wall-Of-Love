import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicWallsById, getFilteredTweetsByWall } from "../services/api";
import TweetList from "../components/TweetList";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { RefreshCcw, Search } from "lucide-react";

const PublicShareableWallPage = () => {
  const { wallId } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState("default");
  const [loading, setLoading] = useState(false);

  const handleWall = async () => {
    setLoading(true);
    try {
      const wallResponse = await getPublicWallsById(wallId);
      setWall(wallResponse.data);
      // Ensure tweets is an array; fallback to empty array if not
      const fetchedTweets = Array.isArray(wallResponse.data.tweets) ? wallResponse.data.tweets : [];
      setTweets(fetchedTweets);
    } catch (error) {
      console.error("Error fetching wall:", error);
      toast.error("Failed to fetch wall");
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleWall();
  }, [wallId]);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const response = await getFilteredTweetsByWall(wallId, startDate, endDate);
      // Ensure response.data is an array; fallback to empty array if not
      const filteredTweets = Array.isArray(response.data) ? response.data : [];
      setTweets(filteredTweets);
    } catch (error) {
      console.error("Error filtering tweets:", error);
      toast.error("Failed to fetch filtered tweets.");
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    await handleWall();
  };

  const filteredTweets = Array.isArray(tweets)
    ? tweets.filter((tweet) =>
        tweet.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (!wall)
    return <p className="text-center mt-10 text-red-500">Wall not found.</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="mt-4 flex justify-center">
        {wall.logo && (
          <img
            src={wall.logo}
            alt="Wall Logo"
            className="size-20 rounded-full object-cover border-2 border-gray-400"
          />
        )}
      </div>

      <main className="flex-grow flex flex-col items-center p-6">
        <motion.div
          className="text-center mb-6"
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

        {/* Search & Filter */}
        <div className="flex justify-center items-center flex-wrap gap-2 mt-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tweets..."
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
            disabled={loading}
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-2 border rounded-lg"
            disabled={loading}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-2 border rounded-lg"
            disabled={loading}
          />
          <button
            onClick={handleFilter}
            className="p-2 bg-[#334155] text-white rounded transition-all duration-300 hover:bg-[#94A3B8]"             disabled={loading}
          >
            <Search size={20} />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 bg-[#334155] rounded hover:bg-[#94A3B8] text-white disabled:opacity-50 flex items-center"
            disabled={loading}
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-gray-400 focus:border-gray-400"
            aria-label="Select tweet layout"
            disabled={loading}
          >
            <option value="default">Default</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="odd-even">Odd-Even</option>
          </select>
        </div>

        {/* Tweets Section */}
        <div className="w-full mt-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading tweets...</p>
          ) : filteredTweets.length > 0 ? (
            <TweetList tweets={filteredTweets} layout={layout} />
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

export default PublicShareableWallPage;