import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWall } from "../services/api";
import ShareWallModal from "./ShareWallModal";
import ConfirmationDialog from "./ConfirmationDialog";
import {
  FaShare,
  FaEdit,
  FaTrash,
  FaCog,
} from "react-icons/fa";

const Navbar = ({ logo, wallId }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle Wall Deletion
  const handleDelete = async () => {
    setDeleteDialogOpen(true);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    try {
      await deleteWall(wallId);
      setDeleteDialogOpen(false);
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
    setMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-gray-300 shadow-md p-4 flex justify-between items-center relative">
        {/* Logo */}
        {logo && (
          <img
            src={logo}
            alt="Wall Logo"
            className="h-10 w-10 ml-4 md:h-12 md:w-12 rounded-full object-cover border-2 border-gray-400"
          />
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4">
          {/* Add Tweet Button */}
          <button
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
            onClick={() => navigate(`/admin/walls/${wallId}/add-tweet`)}
          >
            + Add Tweet
          </button>

          {/* Wall Settings Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <FaCog className="inline mr-2" />Wall Settings
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-md rounded-lg border z-20">
                <button
                  onClick={handleOpenShareModal}
                  className="block w-full text-left px-4 py-3 font-medium hover:bg-gray-100 transition flex items-center"
                >
                  <FaShare className="mr-2 text-blue-500" /> Share Wall
                </button>
                <button
                  onClick={() => {
                    navigate(`/admin/walls/${wallId}/update`);
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 font-medium hover:bg-gray-100 transition flex items-center"
                >
                  <FaEdit className="mr-2 text-gray-700" /> Update Wall
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-gray-100 transition flex items-center"
                >
                  <FaTrash className="mr-2" /> Delete Wall
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex gap-2">
          {/* Mobile Add Tweet Button - Always visible */}
          <button
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={() => navigate(`/admin/walls/${wallId}/add-tweet`)}
            aria-label="Add Tweet"
          >
            + Add Tweet
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setDropdownOpen((prev) => !prev);
            }}
            aria-label="Menu"
          >
            <FaCog className="inline mr-2" />
            Wall Settings
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute top-full right-0 mt-1 w-48 bg-white shadow-lg rounded-lg border z-20 md:hidden"
          >
            <button
              onClick={handleOpenShareModal}
              className="block w-full text-left px-4 py-3 font-medium hover:bg-gray-100 transition flex items-center"
            >
              <FaShare className="mr-2 text-blue-500" /> Share Wall
            </button>
            <button
              onClick={() => {
                navigate(`/admin/walls/${wallId}/update`);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 font-medium hover:bg-gray-100 transition flex items-center"
            >
              <FaEdit className="mr-2 text-gray-700" /> Update Wall
            </button>
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-gray-100 transition flex items-center"
            >
              <FaTrash className="mr-2" /> Delete Wall
            </button>
          </div>
        )}
      </nav>

      {/* Share Wall Modal */}
      <ShareWallModal
        wallId={wallId}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Wall"
        message="Are you sure you want to delete this wall?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
};

export default Navbar;