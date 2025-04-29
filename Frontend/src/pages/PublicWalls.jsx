import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getPublicWalls } from "../services/api";
import { FaTwitter, FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";

const PublicWalls = () => {
  const [walls, setWalls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await getPublicWalls();
        const sortedWalls = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setWalls(sortedWalls);
      } catch (error) {
        console.error("Failed to fetch walls:", error);
      }
    };

    fetchWalls();
  }, []);

  const navigateToHomeSection = (sectionId) => {
    navigate(`/#${sectionId}`);
  };

  // Filter walls by title and description
  const filteredWalls = walls
    .filter((wall) =>
      wall.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .concat(
      walls.filter(
        (wall) =>
          wall.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !wall.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

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
          <button
            onClick={() => navigateToHomeSection("about")}
            className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
          >
            About
            <span className="block h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 absolute bottom-0 left-0 right-0"></span>
          </button>

          <button
            onClick={() => navigateToHomeSection("features")}
            className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
          >
            Features
            <span className="block h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 absolute bottom-0 left-0 right-0"></span>
          </button>

          <button
            onClick={() => navigateToHomeSection("contact")}
            className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
          >
            Contact Us
            <span className="block h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 absolute bottom-0 left-0 right-0"></span>
          </button>

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
        {/* Search Box */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or description..."
            className="w-96 p-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
          />
        </div>
        {filteredWalls.length === 0 ? (
          <p className="text-center text-gray-500">No walls found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredWalls.map((wall) => (
              <div
                key={wall.id}
                className="bg-white p-4 rounded-xl shadow-lg border hover:scale-105 transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Wall Logo */}
                {wall.logo && (
                  <img
                    src={wall.logo}
                    alt={wall.title}
                    className="w-full h-24 sm:h-32 object-cover rounded-md mb-3"
                    onClick={() => 
                      navigate( 
                        `/walls/${wall.id}/public`
                      )
                    }
                  />
                )}

                <h2
                  className="text-xl font-semibold mb-2"
                  onClick={() => 
                    navigate(
                      `/walls/${wall.id}/public`
                    )
                  }
                >
                  {wall.title}
                </h2>
                <p
                  className="text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: wall.description }}
                  onClick={() =>
                    navigate(
                      `/walls/${wall.id}/link/71d0623b-013f-4bbb-8fe1-1f0168abd68a`
                    )
                  }
                ></p>
                {/* User Info */}
                {wall.user && (
                  <div className="flex flex-col items-center mt-auto gap-2">
                    <div className="flex items-center space-x-2 ">
                      <img
                        src={wall.user.profile_pic}
                        alt={wall.user.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <span className="text-gray-500 font-medium">
                        ~{wall.user.name}
                      </span>
                    </div>
                    {/* Show created_at date below user */}
                  </div>
                )}
                {/**views for walls  */}
                <div className="flex items-center justify-between w-full text-gray-400 text-sm mt-3">
                  {/* Date on left */}
                  <span>
                    {new Date(wall.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  {/* Views on right */}
                  <p className="flex items-center space-x-1 text-gray-600 text-sm font-medium">
                    <span className="text-black-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </span>
                    <span>{wall.views || 0}</span>
                  </p>
                </div>
                
              </div>
            ))}
          </div>
        )}
        {/* Footer */}
        <footer className="bg-white mt-10">
          {/* Top Border Line */}
          <div className="border-t border-gray-300"></div>

          <div className="container mx-auto text-center py-6">
            <h3 className="text-xl font-bold mb-2 text-black">Follow Us</h3>

            {/* Social Media Links */}
            <div className="flex justify-center space-x-6 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition text-2xl"
              >
                <FaTwitter />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition text-2xl"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition text-2xl"
              >
                <FaYoutube />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-500 transition text-2xl"
              >
                <FaInstagram />
              </a>
            </div>

            <p className="text-gray-500 mt-4">
              &copy; 2025 Wall of Love. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PublicWalls;
