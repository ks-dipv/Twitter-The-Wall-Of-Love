import React from "react";

const Footer = ({ socialLinks }) => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4">
      <h3 className="text-lg font-bold mb-2">Follow Us</h3>
      <div className="flex justify-center space-x-4">
        {socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className="text-blue-400 hover:underline"
          >
            {link.platform}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
