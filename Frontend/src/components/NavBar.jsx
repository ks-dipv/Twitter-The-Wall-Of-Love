import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWall } from "../services/api";

const Navbar = ({ logo, wallId }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <nav className="bg-gray-300 shadow-md p-4 flex justify-between items-center">
      {/* Logo */}
      {logo && (
        <img
          src={logo}
          alt="Wall Logo"
          className="h-12 w-12 rounded-full object-cover border-2 border-gray-400"
        />
      )}

      <div className="flex gap-4">
        {/* Add Tweet Button */}
        <button
          className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg"
          onClick={() => navigate(`/admin/walls/${wallId}/add-tweet`)}
        >
          + Add Tweet
        </button>

        {/* Wall Settings Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-105"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            ⚙ Wall Settings
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white shadow-md rounded-lg border">
              <button
                onClick={() => {
                  navigate(`/wall/${wallId}/update`);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-3 font-medium hover:bg-gray-100 transition"
              >
                ✏ Update Wall
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-100 transition"
              >
                🗑 Delete Wall
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
