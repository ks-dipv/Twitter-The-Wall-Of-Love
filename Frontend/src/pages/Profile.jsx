import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', profile_pic: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await axios.get('http://localhost:3000/api/user', { withCredentials: true });
        setUser(response.data);
        setFormData({ name: response.data.name, email: response.data.email, profile_pic: response.data.profile_pic });
      } catch (error) {
        toast.error('Failed to load profile');
      }
    }
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
      formDataObj.append('name', formData.name);
      if (file) formDataObj.append('profileImage', file);
      
      await axios.put('http://localhost:3000/api/user/profile', formDataObj, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white-600 p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-black text-xl font-bold">Your Profile</h1>
          {/* <button className="text-white font-semibold">Logout</button> */}
        </div>
      </nav>

      {/* Profile Section */}
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
                <input type="file" onChange={handleFileChange} className="mb-2 border p-2 rounded w-full" />
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
                <button onClick={handleUpdate} className="bg-green-500 text-white px-4 py-2 rounded mt-2">Save Changes</button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <button onClick={() => setEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Edit Profile</button>
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
