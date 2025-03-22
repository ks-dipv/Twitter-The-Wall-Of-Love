import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaUserCircle, FaCopy, FaKey, FaCheck } from "react-icons/fa";
import { getUser, updateProfile, getApiToken } from "../services/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile_pic: "",
  });
  const [file, setFile] = useState(null);
  const [apiToken, setApiToken] = useState("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);

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
      if (response.data.api_token) {
        setApiToken(response.data.api_token);
      }
    } catch (error) {
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
      if (file) formDataObj.append("profileImage", file);

      await updateProfile(formDataObj);
      toast.success("Profile updated successfully");
      await fetchUser();
      setFile(null);
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleGenerateToken = async () => {
    try {
      setIsGeneratingToken(true);
      const response = await getApiToken();

      if (
        response.data &&
        (response.data.token || typeof response.data === "string")
      ) {
        const token =
          typeof response.data === "string"
            ? response.data
            : response.data.token;
        setApiToken(token);
        toast.success("API token generated successfully");
      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Generate token error:", error);
      toast.error("Failed to generate API token");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard
      .writeText(apiToken)
      .then(() => {
        toast.success("API token copied to clipboard");
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {
        toast.error("Failed to copy API token");
      });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer autoClose={4000} />

      <div className="max-w-6xl mx-auto flex justify-center items-center">
        <h1 className="text-4xl font-extrabold text-center mb-5">
          Your Profile
        </h1>
      </div>

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
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
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
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                >
                  Edit Profile
                </button>
              </>
            )}

            <div className="w-full mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaKey className="mr-2" /> API Token
              </h3>
              <div className="flex flex-col space-y-4">
                {apiToken ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={apiToken}
                      className="w-full p-2 pr-10 border rounded bg-gray-50"
                      readOnly
                    />
                    <button
                      onClick={handleCopyToken}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 focus:outline-none"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600 italic">
                    No API token generated yet
                  </p>
                )}
                <button
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                  className={`${
                    apiToken ? "bg-gray-500" : "bg-blue-500"
                  } text-white px-4 py-2 rounded flex items-center justify-center`}
                >
                  {isGeneratingToken
                    ? "Generating..."
                    : apiToken
                      ? "Regenerate Token"
                      : "Generate API Token"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center">Loading profile...</p>
        )}
      </div>
    </div>
  );
}
