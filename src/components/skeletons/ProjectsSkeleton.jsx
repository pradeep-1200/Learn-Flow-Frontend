import React from "react";
import Skeleton from "../Skeleton";

export default function ProjectsSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="mb-4">
              <Skeleton className="h-2 w-full rounded-full mb-1" />
              <Skeleton className="h-3 w-10 ml-auto" />
            </div>
            <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
