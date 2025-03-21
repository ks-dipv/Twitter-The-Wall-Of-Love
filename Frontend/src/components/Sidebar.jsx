import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  PlusCircle,
  List,
  LogOut,
  Menu,
  LayoutDashboard,
  Share2,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deleteWall } from "../services/api";
import ShareWallModal from "./ShareWallModal";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Extract wallId from the URL
  const pathParts = location.pathname.split("/");
  const wallIdIndex = pathParts.findIndex((part) => part === "walls") + 1;
  const wallId = pathParts[wallIdIndex] || null;

  // Check if we're on a wall-specific page
  const isWallPage = location.pathname.includes("/admin/walls/") && wallId;

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    alert("Logout");
    await logout();
    setIsOpen(false);
    navigate("/");
  };

  // Handle Wall Deletion
  const handleDelete = async () => {
    if (!wallId) return;

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

  // Handle Share modal
  const handleOpenShareModal = () => {
    setShareModalOpen(true);
  };

  const renderDefaultSidebar = () => (
    <>
      <li>
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-2 p-2 rounded ${
            isActive("/admin/dashboard") ? "bg-gray-400" : "hover:bg-gray-700"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          {isOpen && "Dashboard"}
        </Link>
      </li>

      {/* Wall Management */}
      <li className="font-bold mt-4">{isOpen && "Wall Management"}</li>
      <li>
        <Link
          to="/admin/create-wall"
          className={`flex items-center gap-2 p-2 rounded ${
            isActive("/admin/create-wall") ? "bg-gray-400" : "hover:bg-gray-700"
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          {isOpen && "Create Wall"}
        </Link>
      </li>
      <li>
        <Link
          to="/admin/list-walls"
          className={`flex items-center gap-2 p-2 rounded ${
            isActive("/admin/list-walls") ? "bg-gray-400" : "hover:bg-gray-700"
          }`}
        >
          <List className="w-5 h-5" />
          {isOpen && "List of Walls"}
        </Link>
      </li>

      {/* Profile */}
      <li className="mt-4">
        <Link
          to="/admin/profile"
          className={`flex items-center gap-2 p-2 rounded ${
            isActive("/admin/profile") ? "bg-gray-400" : "hover:bg-gray-700"
          }`}
        >
          <User className="w-5 h-5" />
          {isOpen && "Profile"}
        </Link>
      </li>

      {/* Sign Out - Always visible */}
      <li className="mt-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 rounded hover:bg-red-700 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && "LogOut"}
        </button>
      </li>
    </>
  );

  const renderWallSidebar = () => (
    <>
      <li className="font-bold mt-4">{isOpen && "Wall Actions"}</li>

      <li>
        <Link
          to={`/admin/walls/${wallId}`}
          className={`flex items-center gap-2 p-2 rounded ${
            location.pathname === `/admin/walls/${wallId}`
              ? "bg-gray-400"
              : "hover:bg-gray-700"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          {isOpen && "Wall View"}
        </Link>
      </li>

      <li>
        <Link
          to={`/admin/walls/${wallId}/add-tweet`}
          className={`flex items-center gap-2 p-2 rounded ${
            location.pathname.includes(`/add-tweet`)
              ? "bg-gray-400"
              : "hover:bg-gray-700"
          }`}
        >
          <Plus className="w-5 h-5" />
          {isOpen && "Add Tweet"}
        </Link>
      </li>

      <li>
        <button
          onClick={handleOpenShareModal}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 w-full text-left"
        >
          <Share2 className="w-5 h-5" />
          {isOpen && "Share Wall"}
        </button>
      </li>

      <li>
        <Link
          to={`/admin/walls/${wallId}/update`}
          className={`flex items-center gap-2 p-2 rounded ${
            location.pathname.includes(`/update`)
              ? "bg-gray-400"
              : "hover:bg-gray-700"
          }`}
        >
          <Edit className="w-5 h-5" />
          {isOpen && "Update Wall"}
        </Link>
      </li>

      <li>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 w-full text-left"
        >
          <Trash2 className="w-5 h-5" />
          {isOpen && "Delete Wall"}
        </button>
      </li>

      <li className="mt-4">
        <Link
          to="/admin/list-walls"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
        >
          <List className="w-5 h-5" />
          {isOpen && "All Walls"}
        </Link>
      </li>
    </>
  );

  return (
    <div
      className={`h-screen bg-gray-800 text-white transition-all ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo & Toggle Button */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/128/2297/2297921.png"
            alt="Wall of Love Logo"
            className="h-10 w-auto"
          />
          {isOpen && (
            <h1 className="text-white text-2xl font-bold">Wall of Love</h1>
          )}
        </div>

        {/* Hamburger Icon for Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <ul className="space-y-4 p-4">
        {isWallPage ? renderWallSidebar() : renderDefaultSidebar()}
      </ul>

      {/* Share Wall Modal */}
      <ShareWallModal
        wallId={wallId}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
