import React from "react";
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

const SortableTweet = ({ tweet, onDelete }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white shadow-md rounded-lg p-4 flex flex-col h-full relative cursor-pointer"
    >
      {/* Delete Button */}
      {onDelete && tweet.id && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tweet.id);
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
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
    </div>
  );
};

const TweetList = ({ tweets, onDelete, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance required to start a drag
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
          {tweets.map((tweet) => (
            <SortableTweet key={tweet.id} tweet={tweet} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TweetList;
