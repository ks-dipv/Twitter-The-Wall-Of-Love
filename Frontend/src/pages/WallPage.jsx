import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWallById, getTweetsByWall } from "../services/api";
import TweetList from "../components/TweetList";
import Footer from "../components/Footer";
import Navbar from "../components/NavBar";

const WallPage = () => {
  const { id } = useParams();
  const [wall, setWall] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallData = async () => {
      try {
        const wallResponse = await getWallById(id);
        setWall(wallResponse.data);

        const tweetsResponse = await getTweetsByWall(id);
        setTweets(tweetsResponse.data);
      } catch (error) {
        console.error("Error fetching wall:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallData();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!wall)
    return <p className="text-center mt-10 text-red-500">Wall not found.</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={wall.logo} wallId={wall.id} />
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold">{wall.title}</h1>
        <p className="text-gray-600">{wall.description}</p>
        <TweetList tweets={tweets} />
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default WallPage;
