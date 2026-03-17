import React from "react";
import Skeleton from "../Skeleton";

export default function TasksSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center space-x-4">
           <Skeleton className="h-10 w-48" />
           <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex justify-between items-start">
               <Skeleton className="h-6 w-2/3" />
               <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
