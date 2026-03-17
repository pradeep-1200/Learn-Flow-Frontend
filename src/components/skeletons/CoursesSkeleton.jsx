import React from "react";
import Skeleton from "../Skeleton";

export default function CoursesSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between space-y-4">
            <div>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="mt-4">
               <Skeleton className="h-2 rounded-full w-full" />
            </div>
            <div className="flex justify-between items-center mt-2">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
