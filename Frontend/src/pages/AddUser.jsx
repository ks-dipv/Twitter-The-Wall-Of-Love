import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../services/api";
export default function AddUser() {
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState("read");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        email,
        access_type: accessType,
      };

      await api.post("/user/wall/invitation", payload);

      toast.success("Invitation sent successfully");
      setEmail("");
      setAccessType("read");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg">
      <ToastContainer autoClose={2000} hideProgressBar />
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Add User to Wall
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            User Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
            placeholder="Enter user email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Access Type
          </label>
          <select
            value={accessType}
            onChange={(e) => setAccessType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
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
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
          >
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </form>
    </div>
  );
}
