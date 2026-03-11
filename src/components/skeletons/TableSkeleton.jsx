import React from "react";
import Skeleton from "../Skeleton";

export default function TableSkeleton() {
  return (
    <div className="space-y-4 fade-in w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-100 dark:border-gray-700">
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="p-3 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
