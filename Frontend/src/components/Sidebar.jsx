import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, PlusCircle, List, Share2, LogOut, Menu } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`h-screen bg-gray-800 text-white transition-all ${isOpen ? "w-64" : "w-20"}`}>
      {/* Logo & Toggle Button */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/128/2297/2297921.png"
            alt="Wall of Love Logo"
            className="h-10 w-auto"
          />
          {isOpen && <h1 className="text-white text-2xl font-bold">Wall of Love</h1>}
        </div>

        {/* Hamburger Icon for Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <ul className="space-y-4 p-4">
        <li>
          <Link to="/admin/profile" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <User className="w-5 h-5" />
            {isOpen && "Profile"}
          </Link>
        </li>

        {/* Wall Management */}
        <li className="font-bold mt-4">Wall Management</li>
        <li>
          <Link to="/admin/create-wall" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <PlusCircle className="w-5 h-5" />
            {isOpen && "Create Wall"}
          </Link>
        </li>
        <li>
          <Link to="/admin/update-wall" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <List className="w-5 h-5" />
            {isOpen && "Update Wall"}
          </Link>
        </li>
        <li>
          <Link to="/admin/share-wall" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <Share2 className="w-5 h-5" />
            {isOpen && "Share Wall"}
          </Link>
        </li>
        <li>
          <Link to="/admin/list-walls" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <List className="w-5 h-5" />
            {isOpen && "List of Walls"}
          </Link>
        </li>

        {/* Tweet Management */}
        <li className="font-bold mt-4">Tweet Management</li>
        <li>
          <Link to="/admin/add-tweet" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <PlusCircle className="w-5 h-5" />
            {isOpen && "Add Tweet"}
          </Link>
        </li>
        <li>
          <Link to="/admin/list-tweets" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
            <List className="w-5 h-5" />
            {isOpen && "List of Tweets"}
          </Link>
        </li>

        {/* Sign Out */}
        <li className="mt-10">
          <button onClick={() => alert("Logged Out")} className="flex items-center gap-2 hover:bg-red-700 p-2 rounded">
            <LogOut className="w-5 h-5" />
            {isOpen && "Sign Out"}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
