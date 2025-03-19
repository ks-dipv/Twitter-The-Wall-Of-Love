import React from "react";
import { FaTwitter, FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa";

const socialIcons = {
  twitter: (
    <FaTwitter className="w-6 h-6 text-blue-400 hover:text-blue-500 transition duration-300" />
  ),
  linkedin: (
    <FaLinkedin className="w-6 h-6 text-blue-600 hover:text-blue-700 transition duration-300" />
  ),
  youtube: (
    <FaYoutube className="w-6 h-6 text-blue-500 hover:text-blue-600 transition duration-300" />
  ),
  facebook: (
    <FaFacebook className="w-6 h-6 text-blue-500 hover:text-blue-600 transition duration-300" />
  ),
};

const Footer = ({ socialLinks }) => {
  return (
    <>
      {/* Line Above Footer */}
      <div className="border-t border-gray-300 my-8"></div>

      <footer className="text-gray-900 py-10 text-center">
        <div className="max-w-6xl mx-auto px-6">
          {/* Social Media Links */}
          <h2 className="text-xl font-bold mb-3">Join Our Community</h2>
          <div className="flex justify-center space-x-6">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-1 hover:underline"
              >
                {socialIcons[link.platform.toLowerCase()]}
                <span className="capitalize text-gray-600 hover:text-gray-900">
                  {link.platform}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-4 text-gray-500 text-sm">
          © {new Date().getFullYear()} Wall of Love. All Rights Reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
