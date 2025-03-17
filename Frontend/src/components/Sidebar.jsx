import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, PlusCircle, List, Share2, LogOut, Twitter } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`h-screen bg-gray-800 text-white transition-all ${isOpen ? "w-64" : "w-20"}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-4 text-white">
        {isOpen ? "<<" : ">>"}
      </button>

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
