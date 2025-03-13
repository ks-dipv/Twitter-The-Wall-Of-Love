import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWallById, updateWall } from "../services/api";

const UpdateWallPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wallData, setWallData] = useState({
    title: "",
    description: "",
    visibility: "",
    social_links: [],
  });

  useEffect(() => {
    const fetchWall = async () => {
      try {
        const response = await getWallById(id);
        setWallData(response.data);
      } catch (error) {
        console.error("Failed to fetch wall:", error);
      }
    };

    fetchWall();
  }, [id]);

  const handleChange = (e) => {
    setWallData({ ...wallData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateWall(id, wallData);
      navigate(`/wall/${id}`);
    } catch (error) {
      console.error("Failed to update wall:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update Wall</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={wallData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded mb-2"
        />
        <textarea
          name="description"
          value={wallData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default UpdateWallPage;
