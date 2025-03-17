import React, { useState } from "react";
import axios from "axios";

const CreateWall = () => {
  const [wallData, setWallData] = useState({
    title: "",
    description: "",
    logo: null,
    visibility: "public",
  });

  const handleChange = (e) => {
    setWallData({ ...wallData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setWallData({ ...wallData, logo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(wallData).forEach((key) => {
      formData.append(key, wallData[key]);
    });

    try {
      await axios.post("http://localhost:3000/api/walls/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Wall created successfully!");
      setWallData({ title: "", description: "", logo: null, visibility: "public" });
    } catch (error) {
      console.error("Error creating wall:", error.response?.data || error.message);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Create Wall</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" value={wallData.title} onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Enter title" />
        <textarea name="description" value={wallData.description} onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Enter description"></textarea>
        <input type="file" onChange={handleFileChange} className="w-full" />
        <select name="visibility" value={wallData.visibility} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Create Wall</button>
      </form>
    </div>
  );
};

export default CreateWall;
