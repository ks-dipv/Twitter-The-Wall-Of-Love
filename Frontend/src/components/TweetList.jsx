import React, { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";

const SortableTweet = ({ tweet, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: tweet.id.toString(),
    });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this wall?")) return;
    onDelete(tweet.id);
    toast.success("Deleted Tweet successfully!");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white shadow-md rounded-lg p-4 flex flex-col h-full relative cursor-pointer"
    >
      {/* Delete Button with Confirmation Dialog */}
      {onDelete && tweet.id && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              ❌
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tweet?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this tweet?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              <AlertDialogCancel className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(tweet.id);
                  setIsDialogOpen(false);
                  toast.success("Deleted Tweet successfully!");
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
  const isShare = !location.pathname.includes("/link");
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
              {tweets.map((tweet) => (
                <SortableTweet
                  key={tweet.id}
                  tweet={tweet}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
          {tweets.map((tweet) => (
            <SortableTweet key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TweetList;
