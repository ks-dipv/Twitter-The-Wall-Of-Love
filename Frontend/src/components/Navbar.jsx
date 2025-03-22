import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWall } from "../services/api";
import ShareWallModal from "./ShareWallModal";
import { FaShare, FaEdit, FaTrash, FaCog, FaPlus } from "react-icons/fa";

const Navbar = ({ logo, wallId }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle Wall Deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this wall?"
    );
    if (!confirmDelete) return;

    try {
      await deleteWall(wallId);
      alert("Wall deleted successfully!");
      navigate("/admin/list-walls");
    } catch (error) {
      console.error("Failed to delete wall:", error);
      alert("Error deleting wall. Please try again.");
    }
  };

  // Open share modal
  const handleOpenShareModal = () => {
    setShareModalOpen(true);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-gray-300 p-4 text-black flex items-center justify-between shadow-md">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {logo && (
            <img
              src={logo}
              alt="Wall Logo"
              className="h-12 w-12 rounded-full object-cover border-2 border-gray-400"
            />
          )}
          <h2 className="text-lg font-bold">Wall Management</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {/* Add Tweet Button */}
          <button
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            onClick={() => navigate(`/admin/walls/${wallId}/add-tweet`)}
          >
            <FaPlus /> Add Tweet
          </button>

            {/* Wall Settings Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <FaCog /> Wall Settings
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black shadow-lg rounded-lg border z-10">
                <button
                  onClick={handleOpenShareModal}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 font-medium hover:bg-gray-100 transition"
                >
                  <FaShare className="text-blue-500" /> Share Wall
                </button>
                <button
                  onClick={() => {
                    navigate(`/admin/walls/${wallId}/update`);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 font-medium hover:bg-gray-100 transition"
                >
                  <FaEdit className="text-gray-700" /> Update Wall
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-100 transition"
                >
                  <FaTrash /> Delete Wall
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Share Wall Modal */}
      <ShareWallModal
        wallId={wallId}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
