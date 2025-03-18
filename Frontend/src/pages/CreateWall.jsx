import React, { useState, useEffect } from "react";
import { addWalls } from "../services/api";
import { FaUserCircle, FaMoon, FaSun, FaBell, FaCog } from "react-icons/fa";

const CreateWall = () => {
  const [walls, setWalls] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown state
  const [wallData, setWallData] = useState({
    title: "",
    logo: null,
    description: "",
    visibility: "public",
    socialLinks: [{ platform: "", url: "" }],
  });

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
      const formData = new FormData();
      formData.append("title", wallData.title);
      formData.append("description", wallData.description);
      formData.append("visibility", wallData.visibility);
      if (wallData.logo) {
        formData.append("logo", wallData.logo);
      }
      formData.append("socialLinks", JSON.stringify(wallData.socialLinks));
  
      const response = await addWalls(formData);
  
      if (response.status === 201) {
        setWalls([...walls, response.data]);
      }
    } catch (error) {
      console.error("Error creating wall:", error.response?.data || error.message);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-gray-300 p-4 shadow-md relative">
        <h1 className="text-xl font-bold">Wall Creator</h1>
        <div className="flex items-center space-x-4 relative">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun size={22} /> : <FaMoon size={22} />}
          </button>
          <FaBell size={22} className="cursor-pointer" />
          <FaCog size={22} className="cursor-pointer" />

          {/* Profile Dropdown */}
          <div className="relative">
            <FaUserCircle 
              size={28} 
              className="cursor-pointer" 
              onClick={() => setShowDropdown(!showDropdown)} 
            />

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg text-black">
                <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left">Profile</button>
                <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left">Update Profile</button>
                <button className="block w-full px-4 py-2 hover:bg-red-100 text-left">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Create Wall Form - Full Width */}
      <div className="w-full p-6">
        <h5 className="text-4xl font-extrabold text-center mb-5 relative">Create Your Wall</h5>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Title:</label>
            <input
              type="text"
              name="title"
              value={wallData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />
          </div>
          <div>
            <label className="block">Logo:</label>
            <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block">Description:</label>
            <textarea
              name="description"
              value={wallData.description}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />
          </div>
          <div>
            <label className="block">Visibility:</label>
            <select
              name="visibility"
              value={wallData.visibility}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Social Links */}
          <div>
            <label className="block">Social Links:</label>
            {wallData.socialLinks.map((link, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <select
                  name="platform"
                  value={link.platform}
                  onChange={(e) => handleSocialChange(index, e)}
                  className="w-1/3 p-3 border rounded"
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
                  className="w-2/3 p-3 border rounded"
                />
              </div>
            ))}
            <button type="button" onClick={addSocialLink} className="text-blue-500 hover:underline mt-2">
              + Add Social Link
            </button>
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
            Create Wall
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWall;
