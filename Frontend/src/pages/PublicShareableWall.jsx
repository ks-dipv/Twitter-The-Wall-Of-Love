import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPublicWallsById, getFilteredTweetsByWall } from "../services/api";
import TweetList from "../components/TweetList";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { RefreshCcw, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PublicShareableWallPage = () => {
  const { wallId } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState("default");
  const [loading, setLoading] = useState(true);
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  
  // Pagination states
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWallData = async (page = 1) => {
    setLoading(true);
    try {
      const wallResponse = await getPublicWallsById(wallId, page, itemsPerPage);
      setWall(wallResponse.data.wall);
      setTweets(wallResponse.data.paginatedTweets.data || []);
      
      // Set pagination metadata
      setCurrentPage(wallResponse.data.paginatedTweets.meta.currentPage);
      setTotalPages(wallResponse.data.paginatedTweets.meta.totalPages);
      setTotalItems(wallResponse.data.paginatedTweets.meta.totalItems);
      setItemsPerPage(wallResponse.data.paginatedTweets.meta.itemsPerPage);
      setIsDateFiltered(false);
    } catch (error) {
      console.error("Error fetching wall:", error);
      toast.error("Failed to fetch wall data");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallData(pageFromUrl);
  }, [wallId, pageFromUrl]);

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);

    if (isDateFiltered) {
      handleFilter(page);
    } else {
      fetchWallData(page);
    }
  }, [searchParams]);

  const handleFilter = async (page = 1) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const response = await getFilteredTweetsByWall(
        wallId, 
        startDate, 
        endDate,
        page,
        itemsPerPage
      );
      setTweets(response.data.data);
      
      // Update pagination metadata for filtered results
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
      fetchWallData(newPage);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredTweets = tweets.filter((tweet) =>
    tweet.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              setSearchParams({ page: 1 });
              fetchWallData(1);
            }}
            className="p-2 bg-[#334155] rounded hover:bg-[#94A3B8] text-white"
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

        {totalPages > 1 && renderPagination()}
      </main>

      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default PublicShareableWallPage;