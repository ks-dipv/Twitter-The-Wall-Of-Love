import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getPublicWalls } from "../services/api";

const PublicWalls = () => {
  const [walls, setWalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await getPublicWalls();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {walls.map((wall) => (
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
                        `/walls/${wall.id}/link/71d0623b-013f-4bbb-8fe1-1f0168abd68a`
                      )
                    }
                  />
                )}

                <h2
                  className="text-xl font-semibold mb-2"
                  onClick={() =>
                    navigate(
                      `/walls/${wall.id}/link/71d0623b-013f-4bbb-8fe1-1f0168abd68a`
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
                  <div className="flex items-center space-x-2 mt-auto gap-14 ">
                    <img
                      src={wall.user.profile_pic} 
                      alt={wall.user.name}
                      className="w-10 h-10  rounded-full object-cover border"
                    />
                    <span className="text-gray-500 font-medium">
                      ~{wall.user.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicWalls;
