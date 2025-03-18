import React, { useEffect, useState } from "react";
import { getWalls, generateSharableLink } from "../services/api";
import { FiCopy } from "react-icons/fi";
import {
  FaUserCircle,
  FaMoon,
  FaSun,
  FaBell,
  FaCog,
  FaShareAlt,
  FaCode,
} from "react-icons/fa";
import { motion } from "framer-motion";

const ShareWall = () => {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await getWalls();
        if (!response || !response.data)
          throw new Error("Invalid API response");
        setWalls(response.data.filter((wall) => wall.visibility === "public"));
      } catch (err) {
        setError("Failed to fetch walls.");
        console.error("API Error:", err);
        setWalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWalls();
  }, []);

  // Generate and copy shareable link
  const handleCopyShareLink = async (wallId) => {
    try {
      console.log("Generating shareable link for Wall ID:", wallId);

      const response = await generateSharableLink(wallId);
      console.log("Full API Response:", response.data); // Log API response

      if (!response || !response.data) {
        throw new Error("Invalid response format from API.");
      }

      const { shareable_link } = response.data;
      if (!shareable_link) {
        throw new Error("No 'shareLink' found in response.");
      }

      navigator.clipboard.writeText(shareable_link);
      alert(`Share Link copied: ${shareable_link}`);
    } catch (error) {
      console.error("Error generating shareable link:", error);
      alert("Failed to generate shareable link. Please try again.");
    }
  };

  // Generate embed link
  const handleCopyEmbedCode = async (wallId) => {
    try {
      console.log("Generating embed code for Wall ID:", wallId);

      const response = await generateSharableLink(wallId);
      console.log("Full API Response:", response.data); // Log API response

      if (!response || !response.data) {
        throw new Error("Invalid response format from API.");
      }

      const { embed_link } = response.data;
      if (!embed_link) {
        throw new Error("No 'embedCode' found in response.");
      }

      navigator.clipboard.writeText(embed_link);
      alert(`Embed link copied: ${embed_link}`);
    } catch (error) {
      console.error("Error generating embed code:", error);
      alert("Failed to generate embed code. Please try again.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading walls...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-gray-300 p-4 shadow-md">
        <h1 className="text-xl font-bold">Share Your Walls</h1>
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
        <h1 className="text-3xl font-bold text-center mb-6">Public Walls</h1>

        {Array.isArray(walls) && walls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {walls.map((wall) => (
              <motion.div
                key={wall.id}
                className="bg-white p-4 rounded-lg shadow-md relative flex flex-col transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={wall.logo}
                  alt={wall.title}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-gray-300 shadow-md"
                />

                <h2 className="text-xl font-semibold">{wall.title}</h2>
                <p className="text-gray-600 truncate">{wall.description}</p>

                {/* Buttons for Share & Embed */}
                {/* Buttons */}
                <div className="mt-4 flex gap-3">
                  <motion.button
                    onClick={() => handleCopyShareLink(wall.id)}
                    className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition transform hover:scale-105"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShareAlt /> Share
                  </motion.button>
                  <motion.button
                    onClick={() => handleCopyEmbedCode(wall.id)}
                    className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition transform hover:scale-105"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaCode /> Embed
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No public walls available.
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareWall;
