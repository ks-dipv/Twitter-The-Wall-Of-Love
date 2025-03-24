import React, { useEffect, useState } from "react";
import { deleteWall, getAllWalls } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiEdit, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationDialog from "../components/ConfirmationDialog"; // Import the dialog component

const ListWalls = () => {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wallToDelete, setWallToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await getAllWalls();
        if (!response || !response.data)
          throw new Error("Invalid API response");
        setWalls(response.data);
      } catch (err) {
        console.error("API Error:", err);
        setWalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWalls();
  }, []);

  const openDeleteDialog = (id, title) => {
    setWallToDelete({ id, title });
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setWallToDelete(null);
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
      toast.error("Failed to delete wall.");
      closeDeleteDialog();
    }
  };

  if (loading) return <div className="text-center mt-10">Loading walls...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="min-h-screen">
      <ToastContainer autoClose={2000} hideProgressBar />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-center items-center mb-5">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center sm:text-left">
            Your Walls
          </h1>
        </div>

        {Array.isArray(walls) && walls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {walls.map((wall) => (
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
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {wall.title}
                  </h2>
                  <p className="text-gray-600 absolute top-10 left-0 right-0 h-[80px] sm:h-[100px] overflow-hidden text-ellipsis p-2">
                    {wall.description}
                  </p>
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
                      navigate(`/admin/walls/${wall.id}/update`);
                    }}
                    className="flex items-center justify-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 px-2 py-1 sm:px-3 sm:py-2 rounded-md bg-white border border-blue-200 hover:bg-blue-50 transition text-sm sm:text-base w-full sm:w-auto"
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
              onClick={() => navigate("/admin/walls/new")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus /> Create Wall
            </motion.button>
          </div>
        )}
      </div>

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
