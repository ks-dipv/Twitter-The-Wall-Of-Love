import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../lib/utils";

const AlertDialog = DialogPrimitive.Root;
const AlertDialogTrigger = DialogPrimitive.Trigger;
const AlertDialogPortal = DialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-xl rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = DialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("text-center mb-4", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = DialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-gray-600", className)}
      {...props}
    />
  )
);
AlertDialogDescription.displayName = DialogPrimitive.Description.displayName;

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn("flex justify-end gap-3", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Action
    ref={ref}
    className={cn(
      "bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600",
      className
    )}
    {...props}
  />
));
AlertDialogAction.displayName = DialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300",
      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = DialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};
