import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import TaskCard from '../components/TaskCard';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('All');

  const { register, handleSubmit, reset } = useForm();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenAddModal = () => {
    reset({ priority: 'Medium', status: 'Pending', category: 'General', title: '', description: '', deadline: '' });
    setIsUpdateMode(false);
    setIsModalOpen(true);
  };

  const handleOpenUpdateModal = (task) => {
    setIsUpdateMode(true);
    setSelectedTask(task);
    reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        category: task.category
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setIsUpdateMode(false);
    reset();
  };

  const onSubmitAdd = async (data) => {
    try {
      if (isUpdateMode) {
        const response = await api.put(`/tasks/update/${selectedTask._id}`, data);
        setTasks(tasks.map(t => t._id === selectedTask._id ? response.data : t));
      } else {
        const response = await api.post('/tasks/create', data);
        setTasks([response.data, ...tasks]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await api.put(`/tasks/update/${id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === id ? response.data : t));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
     try {
       await api.delete(`/tasks/delete/${id}`);
       setTasks(tasks.filter(t => t._id !== id));
     } catch (error) {
       console.error('Error deleting task:', error);
     }
  };

  const filteredTasks = tasks.filter(task => {
      if (filter === 'All') return true;
      if (filter === 'Completed') return task.status === 'Completed';
      if (filter === 'Pending') return task.status === 'Pending' || task.status === 'In Progress';
      if (filter === 'High Priority') return task.priority === 'High';
      return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
        <div className="flex items-center space-x-4">
           <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 dark:text-gray-200 transition-colors"
           >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending / In Progress</option>
              <option value="Completed">Completed</option>
              <option value="High Priority">High Priority</option>
           </select>
           <button
             onClick={handleOpenAddModal}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm whitespace-nowrap"
           >
             New Task
           </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
            <svg className="w-16 h-16 text-indigo-100 dark:text-indigo-900/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
            <p className="text-gray-500 dark:text-gray-400">No tasks found. Create a new task to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
              onEdit={handleOpenUpdateModal}
            />
          ))}
        </div>
      )}

      {/* Add / Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {isUpdateMode ? 'Edit Task' : 'Create New Task'}
                </h3>
                <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
                    <input
                      type="text"
                      {...register('title', { required: true })}
                      placeholder="e.g. Complete React Section 4"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea
                      rows="3"
                      {...register('description')}
                      placeholder="Add any extra details here..."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                      <select
                        {...register('priority', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                      >
                        <option value="High">High 🔴</option>
                        <option value="Medium">Medium 🟡</option>
                        <option value="Low">Low 🟢</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <select
                        {...register('status', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline (Optional)</label>
                        <input
                          type="date"
                          {...register('deadline')}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <input
                          type="text"
                          {...register('category')}
                          placeholder="e.g. Study, Project, Interview"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        />
                      </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    >
                      {isUpdateMode ? 'Update Task' : 'Create Task'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
