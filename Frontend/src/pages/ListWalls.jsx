import React, { useEffect, useState } from "react";
import { getWalls, deleteWall } from "../services/api";
import { Link } from "react-router-dom";
import { FiEdit, FiShare2, FiTrash2 } from "react-icons/fi";
import { FaUserCircle, FaMoon, FaSun, FaBell, FaCog } from "react-icons/fa";
import { motion } from "framer-motion";

const ListWalls = () => {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedWall, setSelectedWall] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await getWalls();
        setWalls(response.data);
      } catch (err) {
        setError("Failed to fetch walls.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalls();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this wall?")) return;
    try {
      await deleteWall(id);
      setWalls(walls.filter((wall) => wall.id !== id));
    } catch (err) {
      console.error("Error deleting wall:", err);
      setError("Failed to delete wall.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading walls...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-gray-300 p-4 shadow-md">
        <h1 className="text-xl font-bold">Wall Manager</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun size={22} /> : <FaMoon size={22} />}
          </button>
          <FaBell size={22} className="cursor-pointer" />
          <FaCog size={22} className="cursor-pointer" />
          <FaUserCircle size={28} className="cursor-pointer" />
        </div>
      </nav>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Your Walls</h1>

        {walls.length === 0 ? (
          <div className="text-center text-gray-500">No walls found. Create a new one!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {walls.map((wall) => (
              <motion.div
                key={wall.id}
                className={`bg-white p-4 rounded-lg shadow-md relative min-h-[350px] flex flex-col transition-all ${
                  selectedWall === wall.id ? "scale-105 shadow-xl" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1.1 }}
                onClick={() => setSelectedWall(wall.id)}
              >
                {/* Logo */}
                <img 
                  src={wall.logo} 
                  alt={wall.title} 
                  className="w-full h-32 object-cover rounded-md mb-3"
                />

                {/* Content Section */}
                <div className="relative flex-1">
                  <h2 className="text-xl font-semibold">{wall.title}</h2>
                  <p className="text-gray-600 absolute top-10 left-0 right-0 h-[100px] overflow-hidden text-ellipsis p-2">
                    {wall.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <Link 
                    to={`/admin/update-wall/${wall.id}`} 
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
                  >
                    <FiEdit /> Edit
                  </Link>
                  
                  <Link 
                    to={`/admin/share-wall/${wall.id}`} 
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 transition"
                  >
                    <FiShare2 /> Share
                  </Link>

                  <button 
                    onClick={() => handleDelete(wall.id)} 
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600 transition"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListWalls;
