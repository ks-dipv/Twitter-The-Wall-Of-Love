import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  deleteAssignUser,
  getAssignedUsers,
  sentInvitation,
  updateAssignedUserAccess,
} from "../services/api";
import { useParams } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";

export default function AddUser() {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateAccessType, setUpdateAccessType] = useState();

  useEffect(() => {
    fetchAssignedUsers();
  }, []);

  const fetchAssignedUsers = async () => {
    try {
      const res = await getAssignedUsers(id);
      setAssignedUsers(res.data);
    } catch (err) {
      console.error("Error fetching assigned users:", err);
      toast.error("Failed to load assigned users");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        email,
        accessType,
        wallId: id,
      };

      await sentInvitation(payload);
      toast.success("Invitation sent successfully");
      setEmail("");
      setAccessType("viewer");
      fetchAssignedUsers();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteAssignUser(id, userId);
      toast.success("User removed successfully");
      fetchAssignedUsers();
    } catch (error) {
      console.error("Error deleting assigned user:", error);
      toast.error(error.response?.data?.message || "Failed to remove user");
    }
  };

  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setUpdateAccessType(user.access_type);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAssignedUserAccess(id, selectedUser.userId, updateAccessType);
      toast.success("Access type updated successfully");
      setIsUpdateModalOpen(false);
      fetchAssignedUsers();
    } catch (error) {
      console.error("Error updating access type:", error);
      toast.error(
        error.response?.data?.message || "Failed to update access type"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer autoClose={2000} hideProgressBar />
      <nav className="bg-gray-300 p-4 text-black flex justify-between mb-5">
        <h1 className="text-lg font-bold">Add User to your wall</h1>
      </nav>

      <div className="max-w-4xl mx-auto mt-10  p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter user email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Access Type
            </label>
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#334155] text-white py-2 px-4 rounded-md hover:bg-[#94A3B8] transition"
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-4xl mx-auto mt-10  p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Assigned Users
          </h3>

          {assignedUsers.length === 0 ? (
            <p className="text-center text-gray-500">No users assigned yet.</p>
          ) : (
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Access Type</th>
                  <th className="px-4 py-2">Assigned At</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedUsers.map((user) => (
                  <tr key={user.userId} className="border-t">
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.access_type}</td>
                    <td className="px-4 py-2">
                      {new Date(user.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleUpdateClick(user)}
                        className="bg-[#334155] text-white px-2 py-1 rounded-md hover:bg-[#94A3B8] ml-2"
                      >
                        Update 
                      </button>
                      <span className="mx-2">|</span>
                      <button
                        onClick={() => handleDelete(user.userId)}
                        className=" px-2 py-2 rounded-md hover:bg-[#94A3B8] ml-2"
                      >
                        <FiTrash2 className="shrink-0" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {isUpdateModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Access Type</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Access Type
                </label>
                <select
                  value={updateAccessType}
                  onChange={(e) => setUpdateAccessType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#334155] text-white rounded-md hover:bg-[#94A3B8]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
