import { useEffect, useState } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";

const PublicWalls = () => {
  const [walls, setWalls] = useState([]);

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await axios.get("/api/public-walls");
        setWalls(response.data);
      } catch (error) {
        console.error("Failed to fetch walls:", error);
      }
    };

    fetchWalls();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}

      <nav
        className="flex justify-between items-center p-6 w-full fixed top-0 z-10"
        style={{ backgroundColor: "oklch(27.8% 0.033 256.848)" }}
      >
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/128/2297/2297921.png"
            alt="Wall of Love Logo"
            className="h-10 w-auto"
          />
          <h1 className="text-white text-2xl font-bold">Wall of Love</h1>
        </div>

        <div className="space-x-6">
          <RouterLink
            to="/"
            className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
          >
            Home
          </RouterLink>

          <RouterLink
            to="/public-walls"
            className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
          >
            Walls
          </RouterLink>
        </div>

        <div className="space-x-4">
          <RouterLink
            to="/signin"
            className="px-6 py-2 text-white text-lg font-semibold rounded-lg bg-gray-700 hover:bg-[#D1D5DB] transition-all"
          >
            Sign In
          </RouterLink>

          <RouterLink
            to="/signup"
            className="px-6 py-2 text-white text-lg font-semibold rounded-lg bg-gray-700 hover:bg-[#D1D5DB] transition-all"
          >
            Sign Up
          </RouterLink>
        </div>
      </nav>

      {/* Public Walls Content */}
      <div className="max-w-7xl mx-auto px-4 py-32">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
          Explore Public Walls
        </h1>

        {walls.length === 0 ? (
          <p className="text-center text-gray-500">No walls found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {walls.map((wall) => (
              <WallCard key={wall.id} wall={wall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicWalls;
