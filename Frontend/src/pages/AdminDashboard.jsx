import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Profile from "./Profile";
import CreateWall from "./CreateWall";
import Dashboard from "./Dashboard";
import WallPage from "./WallPage";
// import UpdateWall from "./UpdateWall";

import ShareWall from "./ShareWall";
import ListWalls from "./ListWalls";
// import NewTweets from "./NewTweets";
// import AddTweet from "./AddTweet";
// import ListTweets from "./ListTweets";

const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 h-screen overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />{" "}
          {/* Dashboard as default route */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="create-wall" element={<CreateWall />} />
          <Route path="walls/:id" element={<WallPage />} />
          {/* <Route path="update-wall" element={<UpdateWall />} /> */}
          <Route path="share-wall" element={<ShareWall />} />
          <Route path="list-walls" element={<ListWalls />} />
          {/* <Route path="new-tweets" element={<NewTweets />} />
          <Route path="add-tweet" element={<AddTweet />} />
          <Route path="list-tweets" element={<ListTweets />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
