import React, { useEffect, useState } from "react";
import { deleteWall, getAllWalls } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { FiTrash2, FiEdit, FiPlus } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { FaShareAlt } from "react-icons/fa";
import ShareWallModal from "../components/ShareWallModal";

const ListWalls = () => {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wallToDelete, setWallToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [wallToShare, setWallToShare] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12,
    totalItems: 0,
    links: {
      first: "",
      last: "",
      next: "",
      previous: "",
      current: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get current page from URL query parameters if available
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get("page")) || 1;
    const limit = 12;

    const fetchWalls = async () => {
      try {
        setLoading(true);
        const response = await getAllWalls(page, limit);

        if (!response || !response.data) {
          throw new Error("Invalid API response");
        }

        setWalls(response.data.data);
        setPagination({
          currentPage: response.data.meta.currentPage,
          totalPages: response.data.meta.totalPages,
          itemsPerPage: response.data.meta.itemsPerPage,
          totalItems: response.data.meta.totalItems,
          links: response.data.links,
        });
      } catch (err) {
        console.error("API Error:", err);
        setWalls([]);
        setError(err.message || "Failed to fetch walls");
      } finally {
        setLoading(false);
      }
    };

    fetchWalls();
  }, [location.search]);

  const openDeleteDialog = (id, title) => {
    setWallToDelete({ id, title });
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setWallToDelete(null);
  };

  const openShareModal = (wall) => {
    setWallToShare(wall);
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setWallToShare(null);
    setShowShareModal(false);
  };

  const handleDelete = async () => {
    if (!wallToDelete) return;
    try {
      await deleteWall(wallToDelete.id);
      setWalls((prevWalls) =>
        prevWalls.filter((wall) => wall.id !== wallToDelete.id)
      );
      toast.success("Wall deleted successfully!");
      closeDeleteDialog();
    } catch (err) {
      setError(err.message || "Failed to delete wall");
      toast.error(err.message || "Failed to delete wall.");
      closeDeleteDialog();
    }
  };

  // Navigate to a specific page
  const goToPage = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.currentPage
    )
      return;
    navigate(`?page=${page}`);

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // First, filter for title matches, then for description matches (client-side filtering)
  const filteredWalls = walls
    .filter((wall) =>
      wall.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .concat(
      walls.filter(
        (wall) =>
          wall.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !wall.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  if (loading) return <div className="text-center mt-10">Loading walls...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  // Render pagination component
  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center mt-6 mb-6">
        <nav className="flex items-center">
          <button
            onClick={() => goToPage(1)}
            disabled={pagination.currentPage === 1}
            className={`mx-1 px-3 py-1 rounded ${
              pagination.currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            First
          </button>

          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`mx-1 p-1 rounded ${
              pagination.currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronLeft size={18} />
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => goToPage(number)}
              className={`mx-1 px-3 py-1 rounded ${
                pagination.currentPage === number
                  ? "bg-[#334155] text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`mx-1 p-1 rounded ${
              pagination.currentPage === pagination.totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() => goToPage(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`mx-1 px-3 py-1 rounded ${
              pagination.currentPage === pagination.totalPages
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

  return (
    <div className="min-h-screen">
      <ToastContainer autoClose={2000} hideProgressBar />
      <div className="p-4 md:p-6">
        <nav className="bg-gray-300 p-4 text-black flex justify-between mb-5">
          <h1 className="text-lg font-bold">Your walls</h1>
        </nav>
        {/* Search Box */}
        <div className="mb-5 flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or description..."
            className="w-96 p-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        {Array.isArray(filteredWalls) && filteredWalls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredWalls.map((wall) => (
              <motion.div
                key={wall.id}
                className="bg-white p-4 rounded-lg shadow-md relative min-h-[300px] sm:min-h-[350px] flex flex-col transition-all cursor-pointer hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 1.05 }}
              >
                {/* Logo */}
                <img
                  src={wall.logo}
                  alt={wall.title}
                  className="w-full h-24 sm:h-32 object-cover rounded-md mb-3"
                  onClick={() => navigate(`/admin/walls/${wall.id}`)}
                />
                {/* Content Section */}
                <div
                  className="relative flex-1"
                  onClick={() => navigate(`/admin/walls/${wall.id}`)}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-semibold truncate">
                      {wall.title}
                    </h2>
                    <span
                      className={`text-[11px] sm:text-sm font-medium px-3 py-1 rounded-full ${
                        wall.visibility === "public"
                          ? "bg-[#D1D5DB] text-black-800"
                          : "bg-[#D1D5DB] text-black-800"
                      }`}
                    >
                      {wall.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                  <p
                    className="text-gray-600 mt-2 h-[80px] sm:h-[100px] overflow-hidden text-ellipsis p-2"
                    dangerouslySetInnerHTML={{
                      __html:
                        wall.description.length > 160
                          ? `${wall.description.substring(0, 160)}...`
                          : wall.description,
                    }}
                  ></p>
                </div>
                {/* Action Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(wall.id, wall.title);
                    }}
                    className="flex items-center justify-center gap-1 sm:gap-2 text-red-600 hover:text-red-700 px-2 py-1 sm:px-3 sm:py-2 rounded-md bg-white border border-red-200 hover:bg-red-50 transition text-sm sm:text-base w-full sm:w-auto"
                    title="Delete this wall"
                  >
                    <FiTrash2 className="shrink-0" />
                    <span className="hidden xs:inline">Delete</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openShareModal(wall);
                    }}
                    className="flex items-center justify-center gap-1 sm:gap-2 bg-[#94A3B8]  hover:bg-[#D1D5DB] px-2 py-1 sm:px-3 sm:py-2 rounded-md bg-white border border-[#94A3B8] hover:bg-[#D1D5DB] transition text-sm sm:text-base w-full sm:w-auto"
                    title="Share this wall"
                  >
                    <FaShareAlt className="shrink-0" />
                    <span className="hidden xs:inline">Share</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/walls/${wall.id}/update`);
                    }}
                    className="flex items-center justify-center gap-1 sm:gap-2 bg-[#94A3B8] hover:bg-[#D1D5DB] px-2 py-1 sm:px-3 sm:py-2 rounded-md bg-white border border-[#94A3B8] hover:bg-[#94A3B8] transition text-sm sm:text-base w-full sm:w-auto"
                    title="Update this wall"
                  >
                    <FiEdit className="shrink-0" />
                    <span className="hidden xs:inline">Update</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10 p-8 bg-gray-50 rounded-lg shadow-sm">
            <p className="mb-4">No walls found. Create a new one!</p>
            <motion.button
              onClick={() => navigate("/admin/create-wall")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus /> Create Wall
            </motion.button>
          </div>
        )}

        {/* Pagination Component */}
        {renderPagination()}
      </div>

      <ShareWallModal
        wallId={wallToShare?.id}
        isOpen={showShareModal}
        onClose={closeShareModal}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={
          wallToDelete
            ? `Are you sure you want to delete ${wallToDelete.title}?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ListWalls;
