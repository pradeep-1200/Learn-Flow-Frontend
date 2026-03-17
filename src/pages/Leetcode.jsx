import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { Link } from 'react-router-dom';
import LeetcodeHeatmap from '../components/LeetcodeHeatmap';
import LeetcodeSkeleton from '../components/skeletons/LeetcodeSkeleton';

const Leetcode = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeetcodeData = async () => {
      if (!user?.leetcodeUsername) return;
      
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/leetcode/${user.leetcodeUsername}`);
        setProfileData(response.data);
      } catch (err) {
        console.error('Error fetching LeetCode data:', err);
        setError('Failed to fetch LeetCode data. Please verify your username in your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeetcodeData();
  }, [user?.leetcodeUsername]);

  // Generate Recharts Data
  const getDifficultyData = () => {
    if (!profileData) return [];
    return [
      { name: 'Easy', value: profileData.solved.easy || 0, fill: '#10B981' },
      { name: 'Medium', value: profileData.solved.medium || 0, fill: '#F59E0B' },
      { name: 'Hard', value: profileData.solved.hard || 0, fill: '#EF4444' }
    ];
  };

  const difficultyData = getDifficultyData();
  const totalSolved = profileData ? (profileData.solved.easy + profileData.solved.medium + profileData.solved.hard) : 0;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} className="font-semibold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  if (!user?.leetcodeUsername) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center dark:bg-yellow-900/30">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect Your LeetCode</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You haven't linked a LeetCode account yet. Add your LeetCode username to your profile to sync your problem-solving stats automatically.
          </p>
        </div>
        <Link 
          to="/profile" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Go to Profile Settings
        </Link>
      </div>
    );
  }

  if (loading) return <LeetcodeSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center bg-yellow-500 text-white rounded-full text-xl font-bold">
            {user.leetcodeUsername.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LeetCode Stats</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Linked as <span className="font-semibold text-gray-700 dark:text-gray-300">@{user.leetcodeUsername}</span></p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : profileData ? (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Solved Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Total Solved</h3>
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{totalSolved}</span>
              <p className="text-sm text-gray-400 mt-2">Problems completed</p>
            </div>

            {/* Ranking / Rating Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-4">
              <div className="text-center w-full">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Global Ranking</h3>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {profileData.ranking ? profileData.ranking.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
              <div className="text-center w-full">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contest Rating</h3>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {profileData.contestRating ? Math.round(profileData.contestRating) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Difficulty Chart Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 md:col-span-1">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Difficulty Breakdown</h3>
              {totalSolved > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [value, 'Solved']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                   <p className="text-gray-500 text-sm">No data to chart yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Heatmap Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 overflow-hidden">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Submission Heatmap</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last 365 days of activity</p>
            {profileData.calendar ? (
               <LeetcodeHeatmap calendarData={profileData.calendar} />
            ) : (
                <p className="text-gray-500 text-sm">No calendar data found.</p>
            )}
          </div>

          {/* List of Recent Problems */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Submissions</h3>
            </div>
            
            {!profileData.recentProblems || profileData.recentProblems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No recent submissions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {profileData.recentProblems.slice(0, 10).map((prob) => (
                      <tr key={prob.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <a href={`https://leetcode.com/problems/${prob.titleSlug}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                            {prob.title}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(prob.timestamp * 1000).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Leetcode;
