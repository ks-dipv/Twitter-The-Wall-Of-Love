import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ logo, wallId }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
