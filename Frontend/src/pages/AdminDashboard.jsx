import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Profile from "./Profile";
import CreateWall from "./CreateWall";
import Dashboard from "./Dashboard";
import WallPage from "./WallPage";
import ListWalls from "./ListWalls";
import AddTweet from "./AddTweet";
import UpdateWallPage from "./UpdateWallPage";
import Home from "./Home";
import PublicWalls from "./PublicWalls";

const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 h-screen overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />{" "}
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="create-wall" element={<CreateWall />} />
          <Route path="walls/:id" element={<WallPage />} />
          <Route path="walls/:id/update" element={<UpdateWallPage />} />
          <Route path="list-walls" element={<ListWalls />} />
          <Route path="walls/:wallId/add-tweet" element={<AddTweet />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
