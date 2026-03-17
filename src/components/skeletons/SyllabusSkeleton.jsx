import React from "react";
import Skeleton from "../Skeleton";

export default function SyllabusSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[...Array(3)].map((_, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <div className="flex justify-between mb-2">
                     <Skeleton className="h-4 w-24" />
                     <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <div className="p-4 space-y-3">
                 {[...Array(4)].map((_, j) => (
                    <div key={j} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                       <Skeleton className="h-5 w-3/4" />
                       <Skeleton className="h-6 w-20" />
                    </div>
                 ))}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
