import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
  </svg>
);

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
  Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
  HTML: '#e34c26', CSS: '#563d7c', Swift: '#ffac45', Kotlin: '#F18E33',
};

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    githubUsername: user?.githubUsername || '',
    leetcodeUsername: user?.leetcodeUsername || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Stats state
  const [githubStats, setGithubStats] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubErrorMsg, setGithubErrorMsg] = useState('');
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [leetcodeLoading, setLeetcodeLoading] = useState(false);

  // Fetch GitHub stats
  useEffect(() => {
    if (!user?.githubUsername) return;
    const fetchGitHub = async () => {
      setGithubLoading(true);
      setGithubErrorMsg('');
      try {
        const res = await api.get(`/github/${user.githubUsername}`);
        setGithubStats(res.data);
      } catch (e) {
        setGithubErrorMsg(e.response?.data?.message || 'Could not load GitHub data');
      } finally {
        setGithubLoading(false);
      }
    };
    fetchGitHub();
  }, [user?.githubUsername]);

  // Fetch LeetCode stats
  useEffect(() => {
    if (!user?.leetcodeUsername) return;
    const fetchLeetCode = async () => {
      setLeetcodeLoading(true);
      try {
        const res = await api.get(`/leetcode/${user.leetcodeUsername}`);
        setLeetcodeStats(res.data);
      } catch (e) {
        console.error('LeetCode fetch error:', e);
      } finally {
        setLeetcodeLoading(false);
      }
    };
    fetchLeetCode();
  }, [user?.leetcodeUsername]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await api.put('/users/profile', formData);
      login(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const totalLeetcodeSolved = leetcodeStats
    ? (leetcodeStats.solved.easy + leetcodeStats.solved.medium + leetcodeStats.solved.hard)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium focus:outline-none transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Tell us about yourself..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <GitHubIcon /> GitHub Username
                </label>
                <input
                  type="text" name="githubUsername" value={formData.githubUsername}
                  onChange={handleChange} placeholder="e.g. octocat"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <CodeIcon /> LeetCode Username
                </label>
                <input
                  type="text" name="leetcodeUsername" value={formData.leetcodeUsername}
                  onChange={handleChange} placeholder="e.g. Pradeep_129"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => { setIsEditing(false); setFormData({ bio: user?.bio || '', githubUsername: user?.githubUsername || '', leetcodeUsername: user?.leetcodeUsername || '' }); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {user?.bio || <span className="italic text-gray-400">No bio added yet. Click Edit Profile to add one.</span>}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* GitHub Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-900 dark:bg-gray-950">
            <GitHubIcon />
            <h2 className="text-base font-semibold text-white">GitHub Stats</h2>
            {user?.githubUsername && (
              <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
                @{user.githubUsername} ↗
              </a>
            )}
          </div>

          {!user?.githubUsername ? (
            <div className="p-6 text-center text-gray-400 text-sm italic">Connect GitHub in Edit Profile</div>
          ) : githubLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
          ) : githubStats ? (
            <div className="p-5 space-y-4">
              {/* Profile avatar row */}
              {githubStats.profile?.avatar_url && (
                <div className="flex items-center gap-3">
                  <img src={githubStats.profile.avatar_url} alt="GitHub Avatar" className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"/>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{githubStats.profile.name || githubStats.profile.login}</span>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Repositories', value: githubStats.profile?.public_repos ?? '—' },
                  { label: 'Total Stars', value: githubStats.stats?.totalStars ?? '—' },
                  { label: 'Followers', value: githubStats.profile?.followers ?? '—' },
                  { label: 'Following', value: githubStats.profile?.following ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Top Languages */}
              {githubStats.stats?.topLanguages?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Top Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {githubStats.stats.topLanguages.map(({ lang, count }) => (
                      <span key={lang} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[lang] || '#8884d8' }}></span>
                        {lang}
                        <span className="text-gray-400">({count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-red-400 text-sm">{githubErrorMsg || 'Could not load GitHub data.'}</div>
          )}
        </div>

        {/* LeetCode Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-900 dark:bg-gray-950">
            <span className="text-yellow-500"><CodeIcon /></span>
            <h2 className="text-base font-semibold text-white">LeetCode Stats</h2>
            {user?.leetcodeUsername && (
              <a href={`https://leetcode.com/${user.leetcodeUsername}`} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-xs text-gray-400 hover:text-yellow-500 transition-colors">
                @{user.leetcodeUsername} ↗
              </a>
            )}
          </div>

          {!user?.leetcodeUsername ? (
            <div className="p-6 text-center text-gray-400 text-sm italic">Connect LeetCode in Edit Profile</div>
          ) : leetcodeLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div></div>
          ) : leetcodeStats ? (
            <div className="p-5 space-y-4">
              {/* Total solved big number */}
              <div className="text-center">
                <div className="text-5xl font-extrabold text-gray-900 dark:text-white">{totalLeetcodeSolved}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Problems Solved</div>
              </div>

              {/* Easy / Medium / Hard breakdown */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Easy', value: leetcodeStats.solved?.easy, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                  { label: 'Medium', value: leetcodeStats.solved?.medium, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                  { label: 'Hard', value: leetcodeStats.solved?.hard, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-lg px-3 py-3 text-center`}>
                    <div className={`text-xl font-bold ${color}`}>{value ?? '—'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Ranking & Contest Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 text-center">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {leetcodeStats.ranking ? leetcodeStats.ranking.toLocaleString() : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Global Ranking</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {leetcodeStats.contestRating ? Math.round(leetcodeStats.contestRating) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Contest Rating</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-red-400 text-sm">Could not load LeetCode data.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
