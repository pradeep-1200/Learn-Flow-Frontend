import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks or logs
  
  // Specific Modals
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const { register: registerProject, handleSubmit: handleSubmitProject, reset: resetProject } = useForm();
  const { register: registerMilestone, handleSubmit: handleSubmitMilestone, reset: resetMilestone } = useForm();
  const { register: registerLog, handleSubmit: handleSubmitLog, reset: resetLog } = useForm();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Project Handlers ---
  const handleOpenProjectModal = (project = null) => {
    if (project) {
      setIsUpdateMode(true);
      setSelectedProject(project);
      resetProject({
        title: project.title,
        description: project.description,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
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
        await api.post('/projects/create', data);
      }
      setIsProjectModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project and all its data?')) {
      try {
        await api.delete(`/projects/delete/${id}`);
        setProjects(projects.filter(p => p._id !== id));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  // --- Milestone Handlers ---
  const handleOpenMilestoneModal = (projectId) => {
      setSelectedProject(projects.find(p => p._id === projectId));
      resetMilestone();
      setIsMilestoneModalOpen(true);
  };

  const onSubmitMilestone = async (data) => {
      try {
          await api.post('/projects/milestone', { ...data, projectId: selectedProject._id });
          setIsMilestoneModalOpen(false);
          fetchProjects();
      } catch (error) {
          console.error('Error adding milestone', error);
      }
  };

  const handleToggleMilestone = async (milestone) => {
      try {
          const newStatus = milestone.status === 'Completed' ? 'Pending' : 'Completed';
          await api.put(`/projects/milestone/${milestone._id}`, { status: newStatus });
          fetchProjects(); // Refresh to get recalculated progress if we added serverside logic, or just refresh array
      } catch (error) {
          console.error('Error updating milestone', error);
      }
  };

  // --- Log Handlers ---
  const handleOpenLogModal = (projectId) => {
      setSelectedProject(projects.find(p => p._id === projectId));
      resetLog({ date: new Date().toISOString().split('T')[0] });
      setIsLogModalOpen(true);
  };

  const onSubmitLog = async (data) => {
      try {
          await api.post('/projects/maintenance-log', { ...data, projectId: selectedProject._id });
          setIsLogModalOpen(false);
          fetchProjects();
      } catch (error) {
          console.error('Error adding log', error);
      }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
          case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
          case 'On Hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Tracker</h1>
        <button
          onClick={() => handleOpenProjectModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          New Project
        </button>
      </div>

      {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading projects...</p>
      ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <p className="text-gray-500 dark:text-gray-400">No projects started yet. Plan your next big thing!</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map(project => {
                 const completedMilestones = project.milestones?.filter(m => m.status === 'Completed').length || 0;
                 const totalMilestones = project.milestones?.length || 0;
                 // Calculate progress based on milestones if they exist, otherwise use manual progress
                 const calculatedProgress = totalMilestones > 0 
                    ? Math.round((completedMilestones / totalMilestones) * 100) 
                    : project.progress;

                 return (
                  <div key={project._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h2>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                              </div>
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                  {project.status}
                              </span>
                          </div>

                          <div className="mb-4">
                              <div className="flex justify-between items-center text-sm mb-1">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{calculatedProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${calculatedProgress}%` }}></div>
                              </div>
                          </div>

                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                              <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                              {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
                              
                              <div className="flex space-x-2">
                                  <button onClick={() => handleOpenProjectModal(project)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Edit</button>
                                  <button onClick={() => handleDeleteProject(project._id)} className="text-red-500 hover:text-red-700 dark:text-red-400 font-medium">Delete</button>
                              </div>
                          </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex-1">
                          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                              <button 
                                  className={`pb-2 px-4 text-sm font-medium ${activeTab === 'tasks' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                  onClick={() => setActiveTab('tasks')}
                              >
                                  Milestones ({totalMilestones})
                              </button>
                              <button 
                                  className={`pb-2 px-4 text-sm font-medium ${activeTab === 'logs' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                  onClick={() => setActiveTab('logs')}
                              >
                                  Updates ({project.maintenanceLogs?.length || 0})
                              </button>
                          </div>

                          {activeTab === 'tasks' ? (
                              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                  {project.milestones?.length === 0 ? (
                                      <p className="text-xs text-center text-gray-500 italic py-4">No milestones added.</p>
                                  ) : (
                                      project.milestones?.map(milestone => (
                                          <div key={milestone._id} className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                                              <input 
                                                  type="checkbox" 
                                                  checked={milestone.status === 'Completed'}
                                                  onChange={() => handleToggleMilestone(milestone)}
                                                  className="h-4 w-4 text-indigo-600 rounded cursor-pointer border-gray-300 focus:ring-indigo-500"
                                              />
                                              <span className={`text-sm ${milestone.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                                  {milestone.title}
                                              </span>
                                          </div>
                                      ))
                                  )}
                                  <button onClick={() => handleOpenMilestoneModal(project._id)} className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium w-full text-center py-2 border border-dashed border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                      + Add Milestone
                                  </button>
                              </div>
                          ) : (
                              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                  {project.maintenanceLogs?.length === 0 ? (
                                      <p className="text-xs text-center text-gray-500 italic py-4">No updates logged.</p>
                                  ) : (
                                      project.maintenanceLogs?.map(log => (
                                          <div key={log._id} className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700 relative">
                                              <div className="text-[10px] text-gray-400 absolute top-2 right-2 font-mono">
                                                  {new Date(log.date).toLocaleDateString()}
                                              </div>
                                              <p className="text-sm text-gray-700 dark:text-gray-200 pr-16">{log.description}</p>
                                          </div>
                                      ))
                                  )}
                                  <button onClick={() => handleOpenLogModal(project._id)} className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium w-full text-center py-2 border border-dashed border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                      + Log Update
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
                 );
              })}
          </div>
      )}

      {/* Primary Project Modal */}
      {isProjectModalOpen && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                 <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                         {isUpdateMode ? 'Update Project' : 'Create Project'}
                     </h3>
                     <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
                 </div>
                 <form onSubmit={handleSubmitProject(onSubmitProject)} className="p-6 space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                         <input type="text" {...registerProject('title', { required: true })} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white" />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                         <textarea rows="2" {...registerProject('description')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                             <select {...registerProject('status')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white">
                                 <option value="Planning">Planning</option>
                                 <option value="In Progress">In Progress</option>
                                 <option value="On Hold">On Hold</option>
                                 <option value="Completed">Completed</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manual Progress (%)</label>
                             <input type="number" min="0" max="100" {...registerProject('progress')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white" />
                             <p className="text-[10px] text-gray-400 mt-1">Overridden if milestones exist</p>
                         </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                             <input type="date" {...registerProject('startDate')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white" />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
                             <input type="date" {...registerProject('deadline')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white" />
                         </div>
                     </div>
                     <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                         <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                             {isUpdateMode ? 'Save Changes' : 'Create Project'}
                         </button>
                     </div>
                 </form>
             </div>
         </div>
      )}

      {/* Milestone Add Modal */}
      {isMilestoneModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                 <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                     <h3 className="font-bold text-gray-900 dark:text-white">Add Milestone</h3>
                     <button onClick={() => setIsMilestoneModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                 </div>
                 <form onSubmit={handleSubmitMilestone(onSubmitMilestone)} className="p-4 space-y-4">
                     <div>
                         <label className="block text-sm text-gray-700 dark:text-gray-300">Milestone Title</label>
                         <input type="text" {...registerMilestone('title', { required: true })} autoFocus className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm" />
                     </div>
                     <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm">Add Milestone</button>
                 </form>
              </div>
          </div>
      )}

      {/* Maintenance Log Modal */}
      {isLogModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                 <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                     <h3 className="font-bold text-gray-900 dark:text-white">Log Update</h3>
                     <button onClick={() => setIsLogModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                 </div>
                 <form onSubmit={handleSubmitLog(onSubmitLog)} className="p-4 space-y-4">
                     <div>
                         <label className="block text-sm text-gray-700 dark:text-gray-300">Date</label>
                         <input type="date" {...registerLog('date')} className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm" />
                     </div>
                     <div>
                         <label className="block text-sm text-gray-700 dark:text-gray-300">Update Description</label>
                         <textarea rows="3" {...registerLog('description', { required: true })} autoFocus className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"></textarea>
                     </div>
                     <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm">Save Log</button>
                 </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Projects;
