import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sentInvitation } from "../services/api";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function AddUser() {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState("viewer");
  const [loading, setLoading] = useState(false);

  const [assignedUsers, setAssignedUsers] = useState([]);

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

  const fetchAssignedUsers = async () => {
    try {
      const res = await api.get(`/wall/${id}/assigned-users`);
      setAssignedUsers(res.data);
    } catch (err) {
      console.error("Error fetching assigned users:", err);
      toast.error("Failed to load assigned users");
    }
  };

  const handleDelete = async (assignedUserId) => {
    try {
      await api.delete(`/wall/${id}/assigned-user/${assignedUserId}`);
      toast.success("User removed successfully");
      fetchAssignedUsers();
    } catch (error) {
      console.error("Error deleting assigned user:", error);
      toast.error("Failed to remove user");
    }
  };

  useEffect(() => {
    fetchAssignedUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg">
      <ToastContainer autoClose={2000} hideProgressBar />
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Invite User to Wall
      </h2>

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
            className="w-full bg-[#334155] text-white py-2 px-4 rounded-md hover:bg-[#94A3B8] transition duration-200"
          >
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </form>

      {/* Assigned Users Table */}
      <div className="mt-10">
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
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.access_type}</td>
                  <td className="px-4 py-2">
                    {new Date(user.assigned_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
