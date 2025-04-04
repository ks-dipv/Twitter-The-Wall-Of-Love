import React, { useState, useEffect, useRef } from "react";
import { generateSharableLink } from "../services/api";
import { FaCopy, FaLink, FaCode } from "react-icons/fa";

const ShareWallModal = ({ wallId, isOpen, onClose }) => {
  const [links, setLinks] = useState({
    shareable_link: "",
    embed_link: "",
  });
  const [loading, setLoading] = useState({
    shareable: false,
    embed: false,
  });
  const [copied, setCopied] = useState({
    shareable: false,
    embed: false,
  });
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setLinks({ shareable_link: "", embed_link: "" });
      setCopied({ shareable: false, embed: false });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const handleGenerateShareableLink = async () => {
    setLoading({ ...loading, shareable: true });
    try {
      const response = await generateSharableLink(wallId);
      setLinks({ ...links, shareable_link: response.data.shareable_link });
    } catch (error) {
      console.error("Failed to generate shareable link:", error);
      alert("Error generating shareable link. Please try again.");
    } finally {
      setLoading({ ...loading, shareable: false });
    }
  };

  const handleGenerateEmbedLink = async () => {
    setLoading({ ...loading, embed: true });
    try {
      const response = await generateSharableLink(wallId);
      setLinks({ ...links, embed_link: response.data.embed_link });
    } catch (error) {
      console.error("Failed to generate embed link:", error);
      alert("Error generating embed link. Please try again.");
    } finally {
      setLoading({ ...loading, embed: false });
    }
  };

  const handleCopy = (type) => {
    const textToCopy =
      type === "shareable" ? links.shareable_link : links.embed_link;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied({ ...copied, [type]: true });
        setTimeout(() => {
          setCopied({ ...copied, [type]: false });
        }, 2000);
      },
      (err) => console.error("Could not copy text: ", err)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-0">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg sm:max-w-md p-6 transform transition-all duration-300 scale-100"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Share Wall</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Shareable Link Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaLink className="text-blue-500" />
              <span>Shareable Link</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={links.shareable_link}
                readOnly
                placeholder="Generate link to share this wall"
                className="flex-grow text-black border border-gray-300 rounded-lg p-2 text-sm bg-gray-50"
              />
              <button
                onClick={
                  links.shareable_link
                    ? () => handleCopy("shareable")
                    : handleGenerateShareableLink
                }
                disabled={loading.shareable}
                className={`px-3 py-2 rounded-lg text-white flex items-center justify-center transition-colors w-full sm:w-auto ${
                  links.shareable_link
                    ? copied.shareable
                      ? "bg-[#334155]"
                      : "bg-[#94A3B8]"
                    : "bg-[#334155] hover:bg-[#94A3B8]"
                }`}
              >
                {links.shareable_link ? <FaCopy className="mr-1" /> : null}
                {loading.shareable
                  ? "Generating..."
                  : copied.shareable
                  ? "Copied!"
                  : links.shareable_link
                  ? "Copy"
                  : "Generate"}
              </button>
            </div>
          </div>

          {/* Embed Link Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaCode className="text-blue-500" />
              <span>Embed Link</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={links.embed_link}
                readOnly
                placeholder="Generate code to embed this wall"
                className="flex-grow text-black border border-gray-300 rounded-lg p-2 text-sm bg-gray-50"
              />
              <button
                onClick={
                  links.embed_link
                    ? () => handleCopy("embed")
                    : handleGenerateEmbedLink
                }
                disabled={loading.embed}
                className={`px-3 py-2 rounded-lg text-white flex items-center justify-center transition-colors w-full sm:w-auto ${
                  links.embed_link
                    ? copied.embed
                      ? "bg-[#334155]"
                      : "bg-[#94A3B8]"
                    : "bg-[#334155] hover:bg-[#94A3B8]"
                }`}
              >
                {links.embed_link ? <FaCopy className="mr-1" /> : null}
                {loading.embed
                  ? "Generating..."
                  : copied.embed
                  ? "Copied!"
                  : links.embed_link
                  ? "Copy"
                  : "Generate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareWallModal;
