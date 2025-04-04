import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharableLink } from "../services/api";
import TweetList from "../components/TweetList";
import Footer from "../components/Footer";

const ShareableWallPage = () => {
  const { wallId, uniqueId } = useParams();
  const [wall, setWall] = useState(null);

  const handleWall = async () => {
    const wallResponse = await getSharableLink(wallId, uniqueId);
    setWall(wallResponse.data);
  };

  useEffect(() => {
    handleWall();
  }, [wallId]);

  if (!wall)
    return <p className="text-center mt-10 text-red-500">Wall not found.</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="mt-4 flex justify-center mt-4">
        {wall.logo && (
          <img
            src={wall.logo}
            alt="Wall Logo"
            className="size-20 rounded-full object-cover border-2 border-gray-400"
          />
        )}
      </div>
      <main className="flex-grow flex flex-col items-center p-6">
        <h1 className="text-4xl font-extrabold text-gray-900 md:text-5xl tracking-wide">
          {wall.title}
        </h1>
        <p
          className="text-lg mt-4 max-w-2xl mx-auto text-gray-700 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: wall.description }}
        ></p>

        {/* Tweets Section */}
        <div className="w-full">
          {wall.tweets.length > 0 ? (
            <TweetList tweets={wall.tweets} />
          ) : (
            <motion.div
              className="text-center py-12 bg-gray-50 rounded-lg shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <p className="text-xl text-gray-500">No tweets available</p>
              <p className="text-gray-400 mt-2">
                Tweets added to this wall will appear here
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer socialLinks={wall.social_links} />
    </div>
  );
};

export default ShareableWallPage;
