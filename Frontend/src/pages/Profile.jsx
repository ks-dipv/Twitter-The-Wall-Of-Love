import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import { getUser, updateProfile } from "../services/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile_pic: "",
  });
  const [file, setFile] = useState(null);

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      const response = await getUser();
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        profile_pic: response.data.profile_pic,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      if (file) formDataObj.append("profile_pic", file);

      await updateProfile(formDataObj);
      toast.success("Profile updated successfully");
      await fetchUser();
      setFile(null);
      setEditing(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer autoClose={2000} hideProgressBar />
      <nav className="bg-gray-300 p-4 text-black flex justify-between">
        <h1 className="text-lg font-bold">Your Profile</h1>
      </nav>
      <div className="max-w-6xl mx-auto flex justify-center items-center"></div>

      <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg">
        {user ? (
          <div className="flex flex-col items-center">
            {formData.profile_pic ? (
              <img
                src={formData.profile_pic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-500"
              />
            ) : (
              <FaUserCircle className="text-gray-400 w-32 h-32 mb-4" />
            )}
            {editing ? (
              <>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mb-2 border p-2 rounded w-full"
                />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  name="email"
                  value={formData.email}
                  placeholder="Email"
                  className="border p-2 rounded w-full mb-2"
                  disabled
                />
                <button
                  onClick={handleUpdate}
                  className="bg-[#334155] text-white px-4 py-2 rounded mt-2"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-[#334155] text-white px-4 py-2 rounded mt-4"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-center">Loading profile...</p>
        )}
      </div>
    </div>
  );
}
