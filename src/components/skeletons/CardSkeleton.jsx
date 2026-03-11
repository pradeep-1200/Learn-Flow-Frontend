import React from "react";
import Skeleton from "../Skeleton";

export default function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 fade-in flex flex-col items-center justify-center space-y-4">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-3 w-32 mt-2" />
    </div>
  );
}
