import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWallById, getTweetsByWall, deleteTweet } from "../services/api";
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

  const handleDelete = async (tweetId) => {
    if (!tweetId) {
      return;
    }
  
    try {
      await deleteTweet(wall.id, tweetId);
      setTweets((prevTweets) => prevTweets.filter((tweet) => tweet.id !== tweetId));
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  };
  

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!wall)
    return <p className="text-center mt-10 text-red-500">Wall not found.</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={wall.logo} wallId={wall.id} />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-extrabold text-gray-900 md:text-5xl">
          {wall.title}
        </h1>
        <p className="text-lg text-gray-700 mt-4 max-w-2xl">
          {wall.description}
        </p>
        <div className="w-full mt-6">
          <TweetList tweets={tweets} onDelete={handleDelete} />
        </div>
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default WallPage;
