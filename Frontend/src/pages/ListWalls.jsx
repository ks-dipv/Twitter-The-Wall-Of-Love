import React, { useEffect, useState, useCallback } from "react";
import { deleteWall, getAllWalls } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiEdit } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";

const ListWalls = () => {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWall, setSelectedWall] = useState(null);
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

  const handleDelete = useCallback(async () => {
    if (!selectedWall) return;
    try {
      await deleteWall(selectedWall.id);
      setWalls((prevWalls) =>
        prevWalls.filter((wall) => wall.id !== selectedWall.id)
      );
      toast.success("Wall deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete wall.");
    } finally {
      setSelectedWall(null);
    }
  }, [selectedWall]);

  if (loading) return <div className="text-center mt-10">Loading walls...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="min-h-screen">
      <ToastContainer autoClose={2000} hideProgressBar />
      <div className="p-6">
        <h1 className="text-4xl font-extrabold text-center mb-5">Your Walls</h1>

        {Array.isArray(walls) && walls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {walls.map((wall) => (
              <motion.div
                key={wall.id}
                className="bg-white p-4 rounded-lg shadow-md relative min-h-[350px] flex flex-col transition-all cursor-pointer hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1.1 }}
              >
                {/* Logo */}
                <img
                  src={wall.logo}
                  alt={wall.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                  onClick={() => navigate(`/admin/walls/${wall.id}`)}
                />

                {/* Content Section */}
                <div
                  className="relative flex-1"
                  onClick={() => navigate(`/admin/walls/${wall.id}`)}
                >
                  <h2 className="text-xl font-semibold">{wall.title}</h2>
                  <p className="text-gray-600 absolute top-10 left-0 right-0 h-[100px] overflow-hidden text-ellipsis p-2">
                    {wall.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={() => setSelectedWall(wall)}
                        className="flex items-center gap-2 text-black px-4 py-2 rounded-md shadow hover:bg-red-100 transition"
                      >
                        <FiTrash2 /> 
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-center">
                          Confirm Deletion
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogDescription className="text-center text-gray-600">
                        Are you sure you want to delete <b>"{wall.title}"</b>?
                      </AlertDialogDescription>
                      <AlertDialogFooter className="flex justify-center gap-4 mt-4">
                        <AlertDialogCancel className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                          onClick={handleDelete}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <button
                    onClick={() => navigate(`/admin/walls/${wall.id}/update`)}
                    className="flex items-center gap-2 text-blue-600 px-4 py-2 rounded-md shadow hover:bg-blue-100 transition"
                  >
                    <FiEdit /> 
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No walls found. Create a new one!
          </div>
        )}
      </div>
    </div>
  );
};

export default ListWalls;
