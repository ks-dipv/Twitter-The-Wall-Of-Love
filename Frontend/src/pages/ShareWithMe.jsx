import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { getAssignedWalls } from "../services/api";
import { RiPushpin2Fill, RiPushpin2Line } from "react-icons/ri";

export default function ShareWithMe() {
  const [assignedWalls, setAssignedWalls] = useState([]);
  const [pinnedWalls, setPinnedWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPinnedWalls = JSON.parse(
      localStorage.getItem("pinnedWalls") || "[]"
    );
    setPinnedWalls(storedPinnedWalls);

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

  const handlePinToggle = (wallId) => {
    let updatedPinnedWalls;
    if (pinnedWalls.includes(wallId)) {
      updatedPinnedWalls = pinnedWalls.filter((id) => id !== wallId);
    } else {
      updatedPinnedWalls = [...pinnedWalls, wallId];
    }
    setPinnedWalls(updatedPinnedWalls);
    localStorage.setItem("pinnedWalls", JSON.stringify(updatedPinnedWalls));
  };

  const sortedWalls = [...assignedWalls].sort((a, b) => {
    const aPinned = pinnedWalls.includes(a.wall.id);
    const bPinned = pinnedWalls.includes(b.wall.id);
    return bPinned - aPinned;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <nav className="bg-gray-300 p-4 text-black flex justify-between">
        <h1 className="text-lg font-bold">Wall share with me</h1>
      </nav>

      <ToastContainer autoClose={2000} hideProgressBar />
      <div className="max-w-7xl mx-auto pt-10">

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : sortedWalls.length === 0 ? (
          <p className="text-center text-gray-500">
            No walls have been shared with you yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedWalls.map((item) => (
              <motion.div
                key={item.wall.id}
                className="bg-white p-4 rounded-lg shadow-md relative min-h-[300px] sm:min-h-[350px] flex flex-col transition-all cursor-pointer hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 1.05 }}
                onClick={(e) => {
                  if (e.target.closest(".pin-button")) return;
                  navigate(`/admin/walls/${item.wall.id}`);
                }}
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
                      <span className="font-medium text-gray-700">
                        Assigned By:
                      </span>{" "}
                      {item.assigned_me}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center">
                      Assigned on:{" "}
                      {new Date(item.assigned_at).toLocaleDateString()}
                      <button
                        className="pin-button ml-24 text-gray-600 hover:text-[#334155] transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinToggle(item.wall.id);
                        }}
                        title={
                          pinnedWalls.includes(item.wall.id)
                            ? "Unpin Wall"
                            : "Pin Wall"
                        }
                        aria-label={
                          pinnedWalls.includes(item.wall.id)
                            ? "Unpin Wall"
                            : "Pin Wall"
                        }
                      >
                        {pinnedWalls.includes(item.wall.id) ? (
                          <RiPushpin2Fill
                            size={20}
                            className="text-[#334155]"
                          />
                        ) : (
                          <RiPushpin2Line size={20} className="text-gray-600" />
                        )}
                      </button>
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
