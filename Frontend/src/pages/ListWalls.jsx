import React, { useState, useEffect } from "react";
import axios from "axios";

const ListWalls = () => {
  const [walls, setWalls] = useState([]);

//   useEffect(() => {
//     fetchWalls();
//   }, []);

//   const fetchWalls = async () => {
//     try {
//       const response = await axios.get("http://localhost:3000/api/walls");
//       setWalls(response.data);
//     } catch (error) {
//       console.error("Error fetching walls:", error);
//     }
//   };

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

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">List of Walls</h2>
      <ul>
        {walls.map((wall) => (
          <li key={wall.id} className="p-2 border-b">{wall.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ListWalls;
