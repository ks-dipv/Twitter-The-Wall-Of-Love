import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "react-scroll";
import { motion } from "framer-motion";
import { FaTwitter, FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
const Home = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    // Check if there's a hash in the URL
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-vector/realistic-luxury-background_23-2149354608.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 bg-black bg-opacity-60 w-full fixed top-0 flex-wrap">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/128/2297/2297921.png"
            alt="Wall of Love Logo"
            className="h-10 w-auto"
          />
          <h1 className="text-white text-2xl font-bold">Wall of Love</h1>
        </div>

        {/* Hamburger Icon for Mobile */}
        <button
          className="sm:hidden text-white text-3xl focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        {/* Links and Buttons - hidden on mobile unless toggled */}
        <div
          className={`${
            isMobileMenuOpen ? "flex flex-col" : "hidden"
          } w-full sm:flex sm:flex-row sm:w-auto sm:items-center sm:space-x-6 mt-4 sm:mt-0`}
        >
          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link
              to="about"
              smooth={true}
              duration={800}
              className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
            >
              About
              <span className="block h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 absolute bottom-0 left-0 right-0"></span>
            </Link>

            <Link
              to="features"
              smooth={true}
              duration={800}
              className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
            >
              Features
              <span className="block h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 absolute bottom-0 left-0 right-0"></span>
            </Link>

            <Link
              to="contact"
              smooth={true}
              duration={800}
              className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
            >
              Contact Us
              <span className="block h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 absolute bottom-0 left-0 right-0"></span>
            </Link>

            <RouterLink
              to="/public-walls"
              className="text-white font-semibold text-lg tracking-wide hover:text-blue-400 transition-all duration-300 relative"
            >
              Walls
              <span className="block h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 absolute bottom-0 left-0 right-0"></span>
            </RouterLink>
          </div>

          {/* Sign In & Sign Up Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
            <RouterLink
              to="/signin"
              className="relative px-6 py-2 text-white text-lg font-semibold rounded-lg overflow-hidden bg-gradient-to-r bg-[#334155] shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl"
            >
              Sign In
              <span className="absolute inset-0 bg-blue-600 opacity-0 transition-opacity duration-300 hover:opacity-20"></span>
            </RouterLink>

            <RouterLink
              to="/signup"
              className="relative px-6 py-2 text-white text-lg font-semibold rounded-lg overflow-hidden bg-gradient-to-r bg-[#334155] shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl"
            >
              Sign Up
              <span className="absolute inset-0 bg-green-600 opacity-0 transition-opacity duration-300 hover:opacity-20"></span>
            </RouterLink>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center justify-center text-center text-white p-10 mt-20"
      >
        {/* Background Gradient & Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 opacity-90 blur-md"></div>

        {/* Floating Emojis Effect */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="hidden sm:block absolute top-20 left-10 md:left-60"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/15047/15047578.png"
            alt="Floating Icon"
            className="w-14 h-14 object-contain"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.8 }}
          className="hidden sm:block absolute bottom-10 left-5 md:left-10"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/17540/17540879.png"
            alt="Floating Icon"
            className="w-14 h-14 object-contain"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          className="hidden sm:block absolute bottom-10 right-5 md:right-10"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/6711/6711626.png"
            alt="Floating Icon"
            className="w-14 h-14 object-contain"
          />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.8 }}
          className="hidden sm:block absolute top-20 right-10 md:right-60"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/11210/11210085.png"
            alt="Floating Icon"
            className="w-14 h-14 object-contain"
          />
        </motion.div>

        {/* Main Content */}
        <div className="relative z-20">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-6xl sm:text-4xl font-extrabold mb-4 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 dark:from-gray-100 dark:to-gray-400"
          >
            Twitter Wall of Love
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl sm:text-lg mb-6 text-gray-200 dark:text-gray-300 font-mono"
          >
            Showcase the best tweets about your brand, product, or service!
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate("/signin")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-[#334155] font-semibold rounded-full text-white hover:bg-[#94A3B8] hover:text-white transition-all duration-300 shadow-lg shadow-[#94A3B8]"
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.section
        id="about"
        name="about"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-12 mx-auto w-4/5 mt-20 shadow-2xl flex flex-col md:flex-row items-center"
      >
        {/* Image */}
        <div className="w-full md:w-1/2">
          <img
            src="https://cdn.prod.website-files.com/5f1175d8eef44a6c5d6661fb/64d0a537475d468c8b0237e0_engage%20atendees%20x-twitter.png"
            alt="About Wall of Love"
            className="w-full rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0 md:ml-10">
          <h2 className="text-5xl font-extrabold text-center md:text-left text-gray-800 dark:text-white tracking-tight font-serif">
            About <span className="text-blue-600">Wall of Love</span>
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mt-6 text-lg leading-relaxed font-mono">
            <span className="font-semibold text-blue-500 text-xl">
              Wall of Love
            </span>{" "}
            is an innovative platform that helps you{" "}
            <strong>curate and showcase</strong> the best tweets about your
            brand, product, or service. <strong>Highlight customer love</strong>{" "}
            and appreciation effortlessly. 🚀
          </p>

          {/* Key Points */}
          <ul className="mt-6 space-y-4 text-lg">
            <li className="flex items-center text-gray-800 dark:text-gray-200 font-semibold">
              *{" "}
              <span className="ml-3 font-sans">
                Showcase tweets in a{" "}
                <span className="text-[#cbd5e1]">stunning layout</span>
              </span>
            </li>
            <li className="flex items-center text-gray-800 dark:text-gray-200 font-semibold">
              *{" "}
              <span className="ml-3 font-sans">
                Fully <span className="text-[#cbd5e1]">customizable</span> to
                match your brand
              </span>
            </li>
            <li className="flex items-center text-gray-800 dark:text-gray-200 font-semibold">
              *{" "}
              <span className="ml-3 font-sans">
                Tweets{" "}
                <span className="text-[#cbd5e1]">update automatically</span> for
                fresh content
              </span>
            </li>
            <li className="flex items-center text-gray-800 dark:text-gray-200 font-semibold">
              *{" "}
              <span className="ml-3 font-sans">
                Easily <span className="text-">share anywhere</span> with an
                embed link
              </span>
            </li>
          </ul>
        </div>
      </motion.section>

      {/*feature section*/}
      <motion.section
        id="features"
        name="features"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-12 mx-auto w-4/5 mt-20 shadow-2xl dark:border-gray-700"
      >
        <h2 className="text-5xl font-extrabold text-center text-gray-900 dark:text-white tracking-wide font-serif">
          Features
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mt-4 text-lg font-mono">
          Everything you need to showcase tweets in a{" "}
          <strong className="text-blue-600 dark:text-blue-400">
            stylish & engaging way
          </strong>
          .
        </p>

        {/* Features Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-center">
          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: "📌",
                title: "Add Tweets Easily",
                desc: "Paste tweet URLs to instantly add them to your wall.",
              },
              {
                icon: "🎨",
                title: "Customize Your Wall",
                desc: "Adjust layout, colors, and branding to match your style.",
              },
              {
                icon: "🌍",
                title: "Share Anywhere",
                desc: "Embed on websites or use a direct link to share.",
              },
              {
                icon: "📊",
                title: "Track Engagement",
                desc: "See likes, retweets, and engagement in real time.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                className="p-8 rounded-xl shadow-lg text-center  border border-gray-300 dark:border-gray-700 backdrop-blur-lg transition-all duration-300 cursor-pointer"
              >
                <h3 className="text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                  {feature.icon} {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Image Right Side */}
          <div className="flex justify-center">
            <img
              src="https://cdn.prod.website-files.com/5f1175d8eef44a6c5d6661fb/64d0a53700efdc84fa2cbda3_user%20generated%20content%20x-twitter.png" // Replace with your image path
              alt="Features Illustration"
              className="max-w-full h-auto rounded-xl shadow-xl"
            />
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10  p-12 mx-auto w-3/4 mt-20 shadow-2xl border border-gray-300 dark:border-gray-700"
      >
        <h2 className="text-5xl font-extrabold text-center text-gray-900 dark:text-white tracking-wide font-serif">
          📩 Let's Connect!
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mt-3 text-lg font-mono">
          Got questions? We’d love to hear from you!
        </p>

        {/* Contact Details */}
        <div className="mt-8 flex flex-col items-center space-y-6">
          <div className="p-6 w-full max-w-lg text-center bg-white/90 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
            <p className="text-xl font-semibold text-gray-800 dark:text-white flex items-center justify-center">
              ✉️ Email us at
              <a
                href="mailto:support@walloflove.com"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold ml-2 transition-all duration-300"
              >
                support@walloflove.com
              </a>
            </p>
          </div>

          <div className="p-6 w-full max-w-lg text-center bg-white/90 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
            <p className="text-xl font-semibold text-gray-800 dark:text-white flex items-center justify-center">
              📞 Call us at
              <a
                href="tel:+1234567890"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold ml-2 transition-all duration-300"
              >
                +1 234 567 890
              </a>
            </p>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-80 text-white py-6 mt-10">
        <div className="container mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">Follow Us</h3>
          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mt-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 transition text-2xl"
            >
              <FaTwitter />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 transition text-2xl"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-red-600 transition text-2xl"
            >
              <FaYoutube />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-pink-500 transition text-2xl"
            >
              <FaInstagram />
            </a>
          </div>
          <p className="text-gray-400 mt-4">
            &copy; 2025 Wall of Love. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
