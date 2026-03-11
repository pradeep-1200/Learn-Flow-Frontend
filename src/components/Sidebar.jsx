import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-100 dark:border-gray-700 h-full flex flex-col transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">LearnFlow 🎓</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
        <Link to="/courses" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Courses</Link>
        <Link to="/tasks" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Tasks</Link>
        <Link to="/notes" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Notes</Link>
        <Link to="/knowledge-graph" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Knowledge Graph</Link>
        <Link to="/leetcode" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">LeetCode</Link>
        <Link to="/syllabus" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Syllabus</Link>
        <Link to="/timetable" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Timetable</Link>
        <Link to="/projects" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Projects</Link>
        <Link to="/analytics" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Analytics</Link>

      </nav>
    </div>
  );
};

export default Sidebar;
