import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  PlusCircle,
  List,
  LogOut,
  Menu,
  LayoutDashboard,
  X,
  CreditCard,
  History
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ConfirmationDialog from "./ConfirmationDialog";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      setLogoutDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      if (isMobile && isOpen && sidebar && !sidebar.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button - always visible on mobile */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-10 left-6 z-30 text-black p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`h-screen bg-gray-800 text-white transition-all duration-300 flex flex-col ${
          isOpen ? "w-64" : "w-0 md:w-20"
        } ${isMobile ? "fixed z-30" : ""} ${
          !isOpen && isMobile ? "hidden" : ""
        }`}
      >
        {/* Logo & Toggle Button */}
        <div
          className={`p-4 ${
            isOpen
              ? "flex items-center justify-between"
              : "flex flex-col items-center gap-4"
          }`}
        >
          {isOpen ? (
            <>
              {/* When sidebar is open: Logo on left, menu button on right */}
              <div className="flex items-center space-x-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/2297/2297921.png"
                  alt="Wall of Love Logo"
                  className="h-10 w-auto"
                />
                <h1 className="text-white text-2xl font-bold">Wall of Love</h1>
              </div>
              <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                {isMobile ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </>
          ) : (
            <>
              {/* When sidebar is collapsed: Menu button on top, logo below */}
              <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                <Menu className="w-6 h-6" />
              </button>
              <img
                src="https://cdn-icons-png.flaticon.com/128/2297/2297921.png"
                alt="Wall of Love Logo"
                className="h-10 w-auto"
              />
            </>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-grow overflow-y-auto">
          <ul className="space-y-4 p-4">
            <li>
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/dashboard")
                    ? "bg-gray-400"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">Dashboard</span>}
              </Link>
            </li>

            {/* Wall Management */}
            {isOpen && (
              <li className="font-bold mt-4 text-gray-400 text-sm uppercase">
                Wall Management
              </li>
            )}
            <li>
              <Link
                to="/admin/create-wall"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/create-wall")
                    ? "bg-gray-400"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <PlusCircle className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">Create Wall</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/list-walls"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/list-walls")
                    ? "bg-gray-400"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <List className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">List of Walls</span>}
              </Link>
            </li>
            {/* Subscription Menu Item */}
            <li>
              <Link
                to="/admin/subscription"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/subscription")
                    ? "bg-gray-400"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">Subscription</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/payment-history"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/payment-history")
                    ? "bg-gray-400"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <History className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">Payment History</span>}
              </Link>
            </li>
          </ul>
        </div>

        {/* Profile and Logout fixed at bottom */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <ul className="space-y-4">
            <li>
              <Link
                to="/admin/profile"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/profile")
                    ? "bg-gray-400"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">Profile</span>}
              </Link>
            </li>

            {/* Sign Out */}
            <li>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 p-2 rounded w-full hover:bg-red-700"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">LogOut</span>}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
};

export default Sidebar;
