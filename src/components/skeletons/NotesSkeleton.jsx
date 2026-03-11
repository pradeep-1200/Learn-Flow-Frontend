import React from "react";
import Skeleton from "../Skeleton";

export default function NotesSkeleton() {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-4 fade-in">
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden hidden sm:flex">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>

      {/* Main Editor Skeleton */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <Skeleton className="h-12 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-4/6" />
          <Skeleton className="h-32 w-full mt-4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    </div>
  );
}
