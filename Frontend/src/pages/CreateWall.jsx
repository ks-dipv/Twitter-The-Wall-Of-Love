import React, { useState } from "react";
import { addWalls } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CreateWallPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [wallData, setWallData] = useState({
    title: "",
    description: "",
    visibility: "public",
    socialLinks: [{ platform: "", url: "" }],
    logo: null,
  });

  const handleChange = (e) => {
    setWallData({ ...wallData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setWallData({ ...wallData, logo: e.target.files[0] });
  };

  const handleSocialChange = (index, e) => {
    setWallData((prevState) => {
      const newSocialLinks = [...prevState.socialLinks];
      newSocialLinks[index][e.target.name] = e.target.value;
      return { ...prevState, socialLinks: newSocialLinks };
    });
  };

  const addSocialLink = () => {
    setWallData((prevState) => ({
      ...prevState,
      socialLinks: [...prevState.socialLinks, { platform: "", url: "" }],
    }));
  };

  const removeSocialLink = (index) => {
    setWallData((prevState) => {
      const newSocialLinks = prevState.socialLinks.filter(
        (_, i) => i !== index
      );
      return { ...prevState, socialLinks: newSocialLinks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const requestBody = {
        title: wallData.title,
        description: wallData.description,
        visibility: wallData.visibility,
        social_links: wallData.socialLinks.filter(
          (link) => link.platform && link.url
        ),
        logo: wallData.logo,
      };

      const response = await addWalls(requestBody);

      if (response && (response.status === 200 || response.status === 201)) {
        toast.success("Wall created successfully! 🎉");
        setTimeout(() => {
          navigate("/admin/list-walls", { replace: true });
        }, 1000);
      } else {
        throw new Error(
          "Failed to create wall. Server returned unexpected response."
        );
      }
    } catch (error) {
      console.error(
        "Failed to create wall:",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create wall. Please try again."
      );
      toast.error("Error creating wall. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <ToastContainer hideProgressBar />
      <nav className="bg-gray-300 p-4 text-black flex justify-between">
        <h1 className="text-lg font-bold">Create your wall</h1>
      </nav>
      <div className="w-full p-6">
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Title:</label>
            <input
              type="text"
              name="title"
              value={wallData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
              placeholder="Enter wall title"
            />
          </div>
          <div>
            <label className="block">Logo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block">Description:</label>
            <ReactQuill
              theme="snow"
              value={wallData.description}
              onChange={(value) =>
                setWallData({ ...wallData, description: value })
              }
              className="w-full bg-white border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              {" "}
              Maximum 250 characters
            </p>
          </div>
          <div>
            <label className="block">Visibility:</label>
            <select
              name="visibility"
              value={wallData.visibility}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {wallData.visibility === "public"
                ? "Public walls can be viewed by anyone with the link"
                : "Private walls can only be viewed by you"}
            </p>
          </div>

          {/* Social Links */}
          <div>
            <label className="block">Social Links:</label>
            {wallData.socialLinks.map((link, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <select
                  name="platform"
                  value={link.platform}
                  onChange={(e) => handleSocialChange(index, e)}
                  className="w-1/3 p-3 border rounded"
                >
                  <option value="">Select Platform</option>
                  <option value="Twitter">Twitter</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                </select>
                <input
                  type="text"
                  name="url"
                  value={link.url}
                  onChange={(e) => handleSocialChange(index, e)}
                  placeholder="URL"
                  className="w-2/3 p-3 border rounded"
                />
                {wallData.socialLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialLink}
              className="text-blue-500 hover:underline mt-2"
            >
              + Add Social Link
            </button>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="w-full bg-[#334155] text-white p-3 rounded hover:bg-[#94A3B8]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Wall"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWallPage;
