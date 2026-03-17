import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CATEGORY_ICONS = {
  Study: '📘', Coding: '💻', Project: '📁',
  Revision: '🧠', Goals: '🎯', General: '📝'
};

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between`}>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-50').replace('-400', '-900/30')}`}>
      <span className="text-xl">{icon}</span>
    </div>
  </div>
);

const TaskAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/tasks/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err?.response?.data?.message || 'Failed to load analytics. Make sure you have tasks saved.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <span className="text-5xl">📊</span>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Analytics Unavailable</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  const {
    completedThisWeek = 0,
    focusTimeThisWeek = 0,
    mostProductiveDay = 'N/A',
    streakCount = 0,
    tasksChartData = [],
    categoryData = [],
  } = analytics;

  const pieDataFiltered = categoryData.filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Completed This Week"
          value={completedThisWeek}
          icon="✅"
          color="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Focus Time This Week"
          value={`${Math.round(focusTimeThisWeek)} min`}
          icon="⏱️"
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Most Productive Day"
          value={mostProductiveDay}
          icon="📅"
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label="Study Streak"
          value={`${streakCount} days 🔥`}
          icon="🔥"
          color="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Tasks Completed This Week</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Daily breakdown of completed tasks</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    color: '#F3F4F6',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                  {tasksChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Tasks by Category</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Distribution across all your task categories</p>
          {pieDataFiltered.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <span className="text-4xl">🗂️</span>
              <p className="text-sm">No category data yet</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataFiltered}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${CATEGORY_ICONS[name] || '📌'} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieDataFiltered.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      color: '#F3F4F6',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [`${val} tasks`, `${CATEGORY_ICONS[name] || ''} ${name}`]}
                  />
                  <Legend
                    formatter={(value) => `${CATEGORY_ICONS[value] || '📌'} ${value}`}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;
