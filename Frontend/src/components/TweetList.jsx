import React from "react";

const TweetList = ({ tweets, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {tweets.map((tweet) => (
        <div
          key={tweet.id}
          className="bg-white shadow-md rounded-lg p-4 flex flex-col h-full relative"
          onClick={() => window.open(tweet.tweet_url, "_blank")}
        >
          <button
            onClick={() => onDelete(tweet.id)}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
          >
            ❌
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <img
              src={tweet.author_profile_pic}
              alt={tweet.author_name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <a
                href={tweet.author_profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:underline"
              >
                {tweet.author_name}
              </a>
            </div>
          </div>

          <p className="text-gray-800 flex-grow">{tweet.content}</p>

          <div className="flex justify-between text-gray-500 text-sm mt-4 pt-2">
            <span>❤️ {tweet.likes}</span>
            <span>💬 {tweet.comments}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TweetList;
