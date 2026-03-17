import React from "react";
import Skeleton from "../Skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
         <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-4">
               <Skeleton className="w-16 h-16 rounded-full" />
               <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
               </div>
            </div>
            <Skeleton className="h-10 w-32" />
         </div>
         <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-4 dark:border-gray-700 border-gray-100">
               <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4">
               <div className="flex gap-3 items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <Skeleton className="h-6 w-full mb-1" />
                        <Skeleton className="h-4 w-full" />
                     </div>
                  ))}
               </div>
               <Skeleton className="h-4 w-24 mb-2 mt-4" />
               <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                     <Skeleton key={i} className="h-6 w-16 rounded-full" />
                  ))}
               </div>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-4 dark:border-gray-700 border-gray-100">
               <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4 pt-2">
               <div className="flex flex-col items-center mb-4">
                  <Skeleton className="h-10 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
               </div>
               <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, i) => (
                     <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
               </div>
               <div className="grid grid-cols-2 gap-3 mt-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
