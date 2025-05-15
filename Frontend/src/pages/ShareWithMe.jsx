import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { getAssignedWalls } from "../services/api";

export default function ShareWithMe() {
  const [assignedWalls, setAssignedWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedWalls = async () => {
      try {
        const response = await getAssignedWalls();
        setAssignedWalls(response.data || []);
      } catch (error) {
        console.error("Error fetching assigned walls:", error);
        toast.error("Failed to load shared walls");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedWalls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <ToastContainer autoClose={2000} hideProgressBar />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Walls Shared With Me
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : assignedWalls.length === 0 ? (
          <p className="text-center text-gray-500">
            No walls have been shared with you yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {assignedWalls.map((item) => (
              <motion.div
                key={item.wall.id}
                className="bg-white p-4 rounded-lg shadow-md relative min-h-[300px] sm:min-h-[350px] flex flex-col transition-all cursor-pointer hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 1.05 }}
                onClick={() => navigate(`/admin/walls/${item.wall.id}`)}
              >
                {/* Logo */}
                <img
                  src={item.wall.logo}
                  alt={item.wall.title}
                  className="w-full h-24 sm:h-32 object-cover rounded-md mb-3"
                />

                {/* Content */}
                <div className="relative flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-semibold truncate">
                      {item.wall.name}
                    </h2>
                  </div>

                  <p
                    className="text-gray-600 mt-2 h-[80px] sm:h-[100px] overflow-hidden text-ellipsis p-2"
                    dangerouslySetInnerHTML={{
                      __html:
                        item.wall.description.length > 160
                          ? `${item.wall.description.substring(0, 160)}...`
                          : item.wall.description,
                    }}
                  />

                  {/* Details */}
                  <div className="mt-4 text-sm space-y-1 text-gray-600 border-t pt-3">
                    <p>
                      <span className="font-medium text-gray-700">Access:</span>{" "}
                      {item.access_type}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Assigned By:</span>{" "}
                      {item.assigned_me}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Assigned on:{" "}
                      {new Date(item.assigned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
