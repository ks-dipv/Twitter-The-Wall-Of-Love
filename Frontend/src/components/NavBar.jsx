import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWall } from "../services/api"; // Import delete API function

const Navbar = ({ logo, wallId }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle Wall Deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this wall?");
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

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      {/* Logo */}
      <img src={logo} alt="Wall Logo" className="h-10" />

      <div className="flex gap-4">
        {/* Add Tweet Button */}
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => navigate(`/wall/${wallId}/add-tweet`)}
        >
          Add Tweet
        </button>

        {/* Wall Settings Button */}
        <div className="relative">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Wall Settings
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded">
              <button
                onClick={() => navigate(`/wall/${wallId}/update`)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Update Wall
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                Delete Wall
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
