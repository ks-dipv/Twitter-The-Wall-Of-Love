import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharableLink, getFilteredTweetsByWall } from "../services/api";
import TweetList from "../components/TweetList";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ShareableWallPage = () => {
  const { wallId, uniqueId } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleWall = async () => {
    try {
      const wallResponse = await getSharableLink(wallId, uniqueId);
      setWall(wallResponse.data);
      setTweets(wallResponse.data.tweets || []);
    } catch (error) {
      console.error("Error fetching wall:", error);
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

    try {
      const response = await getFilteredTweetsByWall(
        wallId,
        startDate,
        endDate
      );
      setTweets(response.data);
    } catch (error) {
      console.error("Error filtering tweets:", error);
      toast.error("Failed to fetch filtered tweets.");
    }
  };

  const filteredTweets = tweets.filter((tweet) =>
    tweet.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-4xl font-extrabold text-gray-900 md:text-5xl tracking-wide">
          {wall.title}
        </h1>

        <p
          className="text-lg mt-4 max-w-2xl mx-auto text-gray-700 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: wall.description }}
        ></p>

        {/* Search & Filter */}
        <div className="flex justify-center items-center flex-grow space-x-2 mt-6">
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

        {/* Tweets Section */}
        <div className="w-full mt-6">
          {filteredTweets.length > 0 ? (
            <TweetList tweets={filteredTweets} />
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

export default ShareableWallPage;
