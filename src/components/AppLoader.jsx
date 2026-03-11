import React from "react";

export default function AppLoader() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 absolute inset-0 z-[100]">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          LearnFlow 🎓
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 font-medium">
          Preparing your workspace...
        </p>

        <div className="flex gap-2 mt-8">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
