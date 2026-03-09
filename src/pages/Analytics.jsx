import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import api from '../services/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/analytics');
                setData(response.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="flex h-full items-center justify-center text-gray-500">Loading Analytics Dashboard...</div>;
    }

    if (!data) {
        return <div className="flex h-full items-center justify-center text-red-500">Failed to map analytic constraints. Please retry.</div>;
    }

    const { overview, leetcodeStats, taskStats, projectStats, syllabusStats, recentActivity } = data;

    // Formatting chart data
    const taskChartData = [
        { name: 'Completed', value: taskStats.completed },
        { name: 'In Progress', value: taskStats.inProgress },
        { name: 'Pending', value: taskStats.pending },
    ].filter(d => d.value > 0);

    const projectChartData = [
        { name: 'Completed', value: projectStats.completed },
        { name: 'In Progress', value: projectStats.inProgress },
        { name: 'Planning', value: projectStats.planning },
    ].filter(d => d.value > 0);

    const genericBarStats = [
        { name: 'Leetcode', count: leetcodeStats.total },
        { name: 'Tasks', count: taskStats.total },
        { name: 'Projects', count: projectStats.total },
       { name: 'Syllabus Nodes', count: syllabusStats.total }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics Dashboard</h1>

            {/* Overview KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Study Hours</p>
                    <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overview.totalStudyTimeHours} hrs</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Coding Problems</p>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{overview.codingProblemsSolved}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Tasks</p>
                    <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{overview.pendingTasks}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Projects</p>
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overview.activeProjects}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes Created</p>
                    <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{overview.totalNotes}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                
                {/* Aggregate Entity Volume */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Content Volume Across Trackers</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={genericBarStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                                />
                                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                                    {genericBarStats.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Status Overview */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Task Completion Rate</h3>
                    <div className="h-64 flex justify-center items-center">
                        {taskChartData.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={taskChartData}
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {taskChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                              </PieChart>
                           </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400">No tasks tracked yet</p>
                        )}
                    </div>
                </div>

                {/* Project Status Overview */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Project States</h3>
                    <div className="h-64 flex justify-center items-center">
                        {projectChartData.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={projectChartData}
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {projectChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                              </PieChart>
                           </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400">No projects planned yet</p>
                        )}
                    </div>
                </div>

                {/* Syllabus Progress */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Syllabus Trajectory</h3>
                    <p className="text-sm text-gray-500 mb-6">Total mapped topics: {syllabusStats.total}</p>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-green-600 dark:text-green-400">Completed Nodes</span>
                                <span className="text-gray-600 dark:text-gray-300">{syllabusStats.completed}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(syllabusStats.completed / (syllabusStats.total || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-yellow-600 dark:text-yellow-400">In Progress Topics</span>
                                <span className="text-gray-600 dark:text-gray-300">{syllabusStats.inProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(syllabusStats.inProgress / (syllabusStats.total || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Extended list rendering: cross-platform recent activity mappings */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Latest Platform Activity</h3>
                {recentActivity && recentActivity.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded transition-colors">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                        activity.type === 'Leetcode' ? 'bg-yellow-100 text-yellow-800' :
                                        activity.type === 'Task' ? 'bg-blue-100 text-blue-800' :
                                        activity.type === 'Project' ? 'bg-purple-100 text-purple-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {activity.type}
                                    </span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">Added "{activity.title}"</span>
                                </div>
                                <span className="text-sm text-gray-400">
                                   {new Date(activity.date).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No recent activity logged across the tracker.</p>
                )}
            </div>
        </div>
    );
};

export default Analytics;
