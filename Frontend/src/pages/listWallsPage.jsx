import { useEffect, useState } from "react";
import { getWalls } from "../services/api";

function ListWalls() {
  const [walls, setWalls] = useState([]);

  const fetchWalls = async () => {
    const response = await getWalls();
    setWalls(response.data);
  };

  useEffect(() => {
    fetchWalls();
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto py-6 px-4">
        {walls.length === 0 ? (
          <p className="text-gray-500"> No walls Available </p>
        ) : (
          <ul>
            {walls.map((wall) => {
              <li key={wall.id} className="mb-2"></li>;
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ListWalls;
