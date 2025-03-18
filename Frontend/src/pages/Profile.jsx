import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="p-6 bg-white rounded-lg shadow-lg animate-pulse w-96 h-60"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center transform transition-all hover:scale-105">
        <div className="relative">
          <img
            src={user?.profilePic || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-24 h-24 mx-auto rounded-full border-4 border-pink-400 shadow-md"
          />
          <span className="absolute top-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{user?.name}</h2>
        <p className="text-gray-600">{user?.email}</p>
        <button
          onClick={() => navigate("/update-profile")}
          className="mt-5 bg-pink-500 text-white px-6 py-2 rounded-lg shadow-md transition-all hover:bg-pink-600 hover:shadow-lg"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
