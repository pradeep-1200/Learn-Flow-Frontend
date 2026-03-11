import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const Projects = () => {
  const { user } = useAuth();

  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all'); // 'all' | 'import'
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [importingId, setImportingId] = useState(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [newUpdate, setNewUpdate] = useState('');
  const [activeProjectTab, setActiveProjectTab] = useState({}); // per-project tab

  const { register: regProject, handleSubmit: handleProject, reset: resetProject } = useForm();

  // Fetch user's projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // Fetch GitHub repos
  const fetchGitHubRepos = async () => {
    if (!user?.githubUsername) return;
    setGithubLoading(true);
    setGithubError('');
    try {
      const res = await api.get(`/github/${user.githubUsername}`);
      setGithubRepos(res.data.repos || []);
    } catch (e) {
      setGithubError(e.response?.data?.message || 'Failed to fetch GitHub repositories.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSwitchView = (v) => {
    setView(v);
    if (v === 'import' && githubRepos.length === 0) fetchGitHubRepos();
  };

  // Import GitHub Repo as Project
  const handleImportRepo = async (repo) => {
    setImportingId(repo.id);
    try {
      await api.post('/projects/import-github', {
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        id: repo.id,
      });
      await fetchProjects();
      setView('all');
    } catch (e) {
      alert(e.response?.data?.message || 'Import failed');
    } finally {
      setImportingId(null);
    }
  };

  // Project Modal
  const handleOpenProjectModal = (project = null) => {
    if (project) {
      setIsUpdateMode(true);
      setSelectedProject(project);
      resetProject({
        title: project.title,
        description: project.description,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        status: project.status,
        progress: project.progress
      });
    } else {
      setIsUpdateMode(false);
      setSelectedProject(null);
      resetProject({ status: 'Planning', progress: 0 });
    }
    setIsProjectModalOpen(true);
  };

  const onSubmitProject = async (data) => {
    try {
      if (isUpdateMode) {
        await api.put(`/projects/update/${selectedProject._id}`, data);
      } else {
        await api.post('/projects/create', { ...data, source: 'manual' });
      }
      setIsProjectModalOpen(false);
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Delete this project and all its data?')) {
      await api.delete(`/projects/delete/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    }
  };

  // Milestone
  const handleAddMilestone = async () => {
    if (!newMilestone.trim()) return;
    await api.post(`/projects/${selectedProject._id}/milestones`, { title: newMilestone });
    setNewMilestone('');
    setIsMilestoneModalOpen(false);
    fetchProjects();
  };

  const handleToggleMilestone = async (project, milestoneId) => {
    await api.put(`/projects/${project._id}/milestones/${milestoneId}`);
    fetchProjects();
  };

  // Update note
  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    await api.post(`/projects/${selectedProject._id}/updates`, { note: newUpdate });
    setNewUpdate('');
    setIsUpdateModalOpen(false);
    fetchProjects();
  };

  const getStatusColor = (status) => ({
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'On Hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Planning': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }[status] || 'bg-gray-100 text-gray-800');

  const getProjectTab = (id) => activeProjectTab[id] || 'milestones';
  const setProjectTab = (id, tab) => setActiveProjectTab(prev => ({ ...prev, [id]: tab }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Tracker</h1>
        <div className="flex gap-2">
          {user?.githubUsername && (
            <button
              onClick={() => handleSwitchView(view === 'import' ? 'all' : 'import')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
            >
              <GitHubIcon />
              {view === 'import' ? 'Back to Projects' : 'Import Repositories'}
            </button>
          )}
          <button
            onClick={() => handleOpenProjectModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm text-sm"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Import GitHub Repos View */}
      {view === 'import' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitHubIcon />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                GitHub Repositories — <span className="text-indigo-600 dark:text-indigo-400">@{user?.githubUsername}</span>
              </h2>
            </div>
            <button onClick={fetchGitHubRepos} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">Refresh</button>
          </div>
          {githubLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : githubError ? (
            <div className="p-6 text-center text-red-500 dark:text-red-400">{githubError}</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {githubRepos.map(repo => {
                const alreadyImported = projects.some(p => p.githubRepoId === repo.id);
                return (
                  <div key={repo.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate">
                          {repo.name}
                        </a>
                        {repo.language && (
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium">{repo.language}</span>
                        )}
                        {alreadyImported && (
                          <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">Imported</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{repo.description || 'No description'}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                        <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      disabled={alreadyImported || importingId === repo.id}
                      onClick={() => handleImportRepo(repo)}
                      className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        alreadyImported
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {importingId === repo.id ? 'Adding...' : alreadyImported ? 'Added' : 'Add to Projects'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {view === 'all' && (
        loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No projects yet. Create one or import from GitHub!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map(project => {
              const completedMilestones = project.milestones?.filter(m => m.completed).length || 0;
              const totalMilestones = project.milestones?.length || 0;
              const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : project.progress;
              const tab = getProjectTab(project._id);

              return (
                <div key={project._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    {/* Title + Badges */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Source badge */}
                          {project.source === 'github' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-full font-medium">
                              <GitHubIcon /> GitHub
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium">Manual</span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>{project.status}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                          {project.source === 'github' && project.repoUrl ? (
                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                              {project.title}
                            </a>
                          ) : project.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                      <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-3">
                        <button onClick={() => handleOpenProjectModal(project)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Edit</button>
                        <button onClick={() => handleDeleteProject(project._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </div>
                    </div>
                  </div>

                  {/* Milestones / Updates Tabs */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex-1">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
                      <button
                        className={`pb-2 px-3 text-xs font-medium ${tab === 'milestones' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        onClick={() => setProjectTab(project._id, 'milestones')}
                      >
                        Milestones ({totalMilestones})
                      </button>
                      <button
                        className={`pb-2 px-3 text-xs font-medium ${tab === 'updates' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        onClick={() => setProjectTab(project._id, 'updates')}
                      >
                        Updates ({project.updates?.length || 0})
                      </button>
                    </div>

                    {tab === 'milestones' ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {project.milestones?.length === 0 ? (
                          <p className="text-xs text-center text-gray-500 italic py-3">No milestones added.</p>
                        ) : project.milestones?.map(m => (
                          <div key={m._id} className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                            <input
                              type="checkbox"
                              checked={m.completed}
                              onChange={() => handleToggleMilestone(project, m._id)}
                              className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
                            />
                            <span className={`text-sm ${m.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>{m.title}</span>
                          </div>
                        ))}
                        <button
                          onClick={() => { setSelectedProject(project); setIsMilestoneModalOpen(true); }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium w-full text-center py-2 border border-dashed border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >+ Add Milestone</button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {project.updates?.length === 0 ? (
                          <p className="text-xs text-center text-gray-500 italic py-3">No updates logged.</p>
                        ) : project.updates?.map(u => (
                          <div key={u._id} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-200">{u.note}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(u.createdAt).toLocaleString()}</p>
                          </div>
                        ))}
                        <button
                          onClick={() => { setSelectedProject(project); setIsUpdateModalOpen(true); }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium w-full text-center py-2 border border-dashed border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >+ Log Update</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Project Create/Edit Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isUpdateMode ? 'Update Project' : 'New Manual Project'}</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg">✕</button>
            </div>
            <form onSubmit={handleProject(onSubmitProject)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
                <input type="text" {...regProject('title', { required: true })} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea rows="2" {...regProject('description')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select {...regProject('status')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 dark:text-white">
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Progress (%)</label>
                  <input type="number" min="0" max="100" {...regProject('progress')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <input type="date" {...regProject('startDate')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
                  <input type="date" {...regProject('deadline')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"/>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium text-sm">
                  {isUpdateMode ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Add Milestone</h3>
              <button onClick={() => setIsMilestoneModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                placeholder="e.g. Build backend"
                autoFocus
                className="block w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(); }}}
              />
              <button onClick={handleAddMilestone} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm">Add Milestone</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Note Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Log Update</h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={newUpdate}
                onChange={e => setNewUpdate(e.target.value)}
                rows="3"
                placeholder="What did you do?"
                autoFocus
                className="block w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
              />
              <button onClick={handleAddUpdate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm">Save Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
