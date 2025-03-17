import React, { useState, useEffect } from "react";
import axios from "axios";
import { addWalls, deleteWall, getAllWalls, logoutUser } from "../services/api";

const WallsPage = () => {
  const [showCreateWall, setShowCreateWall] = useState(false);
  const [walls, setWalls] = useState([]);
  const [wallData, setWallData] = useState({
    title: "",
    logo: null,
    description: "",
    visibility: "public",
    socialLinks: [{ platform: "", url: "" }],
  });

  //  Fetch user walls when component mounts
  useEffect(() => {
    fetchUserWalls();
  }, []);

  // Fetch walls for the logged-in user
  const fetchUserWalls = async () => {
    try {
      const response = await getAllWalls();
      setWalls(response.data); // Store walls in state
    } catch (error) {
      console.error(
        "Error fetching user walls:",
        error.response?.data || error.message
      );
    }
  };

  // Toggle "Create Wall" form
  const handleCreateWallClick = () => setShowCreateWall(!showCreateWall);

  // Handle input change for creating a wall
  const handleChange = (e) => {
    setWallData({ ...wallData, [e.target.name]: e.target.value });
  };

  // Handle file upload for wall logo
  const handleFileChange = (e) => {
    setWallData({ ...wallData, logo: e.target.files[0] });
  };

  // Handle social links change
  const handleSocialChange = (index, e) => {
    const newSocialLinks = [...wallData.socialLinks];
    newSocialLinks[index][e.target.name] = e.target.value;
    setWallData({ ...wallData, socialLinks: newSocialLinks });
  };

  // Add new social link field
  const addSocialLink = () => {
    setWallData({
      ...wallData,
      socialLinks: [...wallData.socialLinks, { platform: "", url: "" }],
    });
  };

  // Handle form submission for creating a wall
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Construct the request body as JSON
      const requestBody = {
        title: wallData.title,
        description: wallData.description,
        visibility: wallData.visibility,
        socialLinks: wallData.socialLinks,
      };

      const response = await addWalls(requestBody);

      if (response.status === 201) {
        console.log("Wall Created:", response.data);
        setWalls([...walls, response.data]); // Add new wall to list
        setShowCreateWall(false); // Hide form
      }
    } catch (error) {
      console.error(
        "Error creating wall:",
        error.response?.data || error.message
      );
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      console.log("User logged out successfully");
      window.location.href = "/signin"; // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  // Handle wall deletion
  const handleDeleteWall = async (id) => {
    try {
      await deleteWall(id);
      setWalls(walls.filter((wall) => wall.id !== id)); // Remove deleted wall from UI
      console.log(`Wall ${id} deleted successfully`);
    } catch (error) {
      console.error(
        "Error deleting wall:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-vector/realistic-luxury-background_23-2149354608.jpg')",
      }}
    >
      {/* <div className="min-h-screen bg-black bg-opacity-60 p-6"> */}
      {/* Navbar */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow-md">
        <h2 className="text-2xl font-bold">Wall Management</h2>
        <div className="flex items-center space-x-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleCreateWallClick}
          >
            {showCreateWall ? "Close" : "Create Wall"}
          </button>

          {/* Logout Button */}
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Wall List (Grid Layout) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walls.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No walls created yet.
          </p>
        ) : (
          walls.map((wall) => (
            <div
              key={wall.id}
              className="relative bg-white p-4 rounded-lg shadow-md"
            >
              {/* Wall Logo */}
              {wall.logo && (
                <img
                  src={wall.logo}
                  alt={wall.title}
                  className="absolute top-2 left-2 w-12 h-12 rounded-full object-cover border"
                />
              )}

              {/* Title & Description */}
              <div className="pl-16">
                <h3 className="text-xl font-semibold">{wall.title}</h3>
                <p className="text-gray-600">{wall.description}</p>
                <p className="text-sm text-gray-500">
                  {" "}
                  {wall.visibility.toLowerCase()}
                </p>
              </div>

              {/* Delete Button */}
              <button
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
                onClick={() => handleDeleteWall(wall.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Wall Form */}
      {showCreateWall && (
        <div className="mt-6 bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Create Wall</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Title:</label>
              <input
                type="text"
                name="title"
                value={wallData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="block text-gray-700">Logo:</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700">Description:</label>
              <textarea
                name="description"
                value={wallData.description}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
                placeholder="Enter description"
              />
            </div>
            <div>
              <label className="block text-black-700">Visibility:</label>
              <select
                name="visibility"
                value={wallData.visibility}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-gray-700">Social Links:</label>
              {wallData.socialLinks.map((link, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  {/* Platform Dropdown */}
                  <select
                    name="platform"
                    value={link.platform}
                    onChange={(e) => handleSocialChange(index, e)}
                    className="w-1/3 p-2 border rounded"
                  >
                    <option value="">Select Platform</option>
                    <option value="Twitter">Twitter</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                  </select>

                  <input
                    type="text"
                    name="url"
                    value={link.url}
                    onChange={(e) => handleSocialChange(index, e)}
                    placeholder="URL"
                    className="w-2/3 p-2 border rounded"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                className="text-blue-500 hover:underline mt-2"
              >
                + Add Social Link
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
            >
              Create Wall
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WallsPage;
