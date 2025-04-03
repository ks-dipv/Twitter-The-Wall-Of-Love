import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { getFilteredTweetsByWall } from "../services/api";

const SortableTweet = ({ tweet, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: tweet.id.toString(),
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const openDeleteDialog = (e) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(tweet.id);
    toast.success("Deleted Tweet successfully!");
    setShowDeleteDialog(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white shadow-md rounded-lg p-4 flex flex-col h-full relative cursor-pointer"
    >
      {onDelete && tweet.id && (
        <button
          onClick={openDeleteDialog}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
          title="Permanently Delete this tweet"
        >
          ❌
        </button>
      )}

      {/* Author Section */}
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
            onClick={(e) => e.stopPropagation()}
          >
            {tweet.author_name}
          </a>
        </div>
      </div>

      {/* Tweet Content */}
      <p
        className="text-gray-800 flex-grow"
        onClick={() => window.open(tweet.tweet_url, "_blank")}
      >
        {tweet.content}
      </p>

      {/* Tweet Stats */}
      <div className="flex justify-between text-gray-500 text-sm mt-4 pt-2">
        <span>❤️ {tweet.likes}</span>
        <span>💬 {tweet.comments}</span>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tweet"
        message={`Are you sure you want to delete this tweet?`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

const TweetList = ({ tweets, onDelete, onReorder }) => {
  const { id } = useParams();
  const isShare = !location.pathname.includes("/link");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredTweets, setFilteredTweets] = useState(tweets);

  const displayedTweets = filteredTweets.filter((tweet) =>
    tweet.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    try {
      const response = await getFilteredTweetsByWall(id, startDate, endDate);
      setFilteredTweets(response.data);
    } catch (error) {
      console.error("Error filtering tweets:", error);
      toast.error("Failed to fetch filtered tweets.");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = tweets.findIndex(
        (tweet) => tweet.id.toString() === active.id
      );
      const newIndex = tweets.findIndex(
        (tweet) => tweet.id.toString() === over.id
      );
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <div>
      {/* Toast Notifications */}
      <ToastContainer autoClose={1000} hideProgressBar />

      {/* Search & Date Filters */}
      <div className="w-full max-w-2xl mx-auto mb-8 flex space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tweets..."
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2 py-2 border rounded-lg"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-2 border rounded-lg"
        />
        <button
          onClick={handleFilter}
          className="p-2 bg-[#334155] text-white  rounded md transition-all duration-300 hover:bg-[#94A3B8] "
        >
          🔍
        </button>
      </div>

      {isShare ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tweets.map((tweet) => tweet.id.toString())}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {displayedTweets.length > 0 ? (
                displayedTweets.map((tweet) => (
                  <SortableTweet
                    key={tweet.id}
                    tweet={tweet}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 col-span-3">
                  No matching tweets found
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
          {filteredTweets.length > 0 ? (
            filteredTweets.map((tweet) => (
              <SortableTweet key={tweet.id} tweet={tweet} />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">
              No matching tweets found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TweetList;
