import React from 'react';
import TaskAnalytics from '../components/TaskAnalytics';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productivity Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Showing data for your tasks this week</p>
      </div>
      <TaskAnalytics />
    </div>
  );
};

export default Analytics;

