import React from 'react';

const CourseCard = ({ course, onUpdate, onDelete }) => {
  const percentComplete = (course.completedModules / course.totalModules) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{course.platform} • {course.type}</p>
        </div>
        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs rounded-full font-medium">
          {course.skill}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress: {course.completedModules} / {course.totalModules} modules</span>
          <span className="text-gray-900 dark:text-white font-medium">{Math.round(percentComplete)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Time spent: <span className="font-semibold text-gray-900 dark:text-white">{course.timeSpent} hrs</span>
      </div>

      <div className="mt-5 flex space-x-2">
        <button 
          onClick={() => onUpdate(course)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-1.5 rounded transition-colors"
        >
          Update
        </button>
        <button 
          onClick={() => onDelete(course._id)}
          className="px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
