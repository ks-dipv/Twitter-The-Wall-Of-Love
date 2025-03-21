import React from "react";
import { cn } from "../lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-lg shadow-md bg-gray", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn("p-4", className)} {...props}>{children}</div>;
}
