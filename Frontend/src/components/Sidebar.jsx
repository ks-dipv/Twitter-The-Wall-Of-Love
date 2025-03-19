import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  PlusCircle,
  List,
  LogOut,
  Menu,
  LayoutDashboard,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation(); // Get current route

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

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
        <li className="font-bold mt-4">Wall Management</li>
        <li>
          <Link
            to="/admin/create-wall"
            className={`flex items-center gap-2 p-2 rounded ${
              isActive("/admin/create-wall")
                ? "bg-gray-400"
                : "hover:bg-gray-700"
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
              isActive("/admin/list-walls")
                ? "bg-gray-400"
                : "hover:bg-gray-700"
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

        {/* Sign Out */}
        <li className="mt-10">
          <button
            onClick={() => alert("Logged Out")}
            className="flex items-center gap-2 p-2 rounded hover:bg-red-700"
          >
            <LogOut className="w-5 h-5" />
            {isOpen && "LogOut"}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
