import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import SyllabusSkeleton from '../components/skeletons/SyllabusSkeleton';

const Syllabus = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/syllabus');
      setSyllabi(response.data);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabi();
  }, []);

  if (loading) return <SyllabusSkeleton />;

  const handleOpenModal = () => {
    reset();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddSyllabus = async (data) => {
    try {
      await api.post('/syllabus/add', data);
      handleCloseModal();
      fetchSyllabi();
    } catch (error) {
      console.error('Error adding syllabus topic:', error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/syllabus/update/${id}`, { status: newStatus });
      setSyllabi(syllabi.map(item => item._id === id ? { ...item, status: newStatus } : item));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this topic?')) {
        try {
            await api.delete(`/syllabus/delete/${id}`);
            setSyllabi(syllabi.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error deleting topic:', error);
        }
    }
  };

  // Group syllabi by subject
  const groupedSyllabi = syllabi.reduce((acc, curr) => {
    if (!acc[curr.subject]) {
      acc[curr.subject] = [];
    }
    acc[curr.subject].push(curr);
    return acc;
  }, {});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <span className="text-green-500">✔</span>;
      case 'In Progress': return <span className="text-yellow-500">⏳</span>;
      default: return <span className="text-gray-400">⏱</span>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return 'from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-900/30 dark:border-green-800';
        case 'In Progress': return 'from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-900/30 dark:border-yellow-800';
        default: return 'from-gray-50 to-white border-gray-200 dark:from-gray-800 dark:to-gray-800/50 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Syllabus Tracker</h1>
        <button
          onClick={handleOpenModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          Add Topic
        </button>
      </div>

      {Object.keys(groupedSyllabi).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No syllabus topics added yet. Map out your learning journey!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedSyllabi).map(([subject, topics]) => {
             const completedCount = topics.filter(t => t.status === 'Completed').length;
             const progress = Math.round((completedCount / topics.length) * 100);

             return (
                <div key={subject} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{subject}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <span>{completedCount} of {topics.length} completed</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto max-h-80 space-y-3">
                        {topics.map(topic => (
                           <div key={topic._id} className={`p-3 rounded-lg border bg-gradient-to-r flex justify-between items-center ${getStatusColor(topic.status)}`}>
                               <div className="flex items-center space-x-3">
                                   <div className="text-lg">{getStatusIcon(topic.status)}</div>
                                   <span className={`text-sm font-medium ${topic.status === 'Completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                       {topic.topic}
                                   </span>
                               </div>
                               <div className="flex items-center space-x-2">
                                    <select
                                        value={topic.status}
                                        onChange={(e) => handleUpdateStatus(topic._id, e.target.value)}
                                        className="text-xs bg-transparent border-gray-300 dark:border-gray-600 border rounded py-1 pl-2 pr-6 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-200"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    <button 
                                        onClick={() => handleDelete(topic._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete topic"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                               </div>
                           </div>
                        ))}
                    </div>
                </div>
             );
          })}
        </div>
      )}

      {/* Modal for adding topic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Syllabus Topic</h3>
                <form onSubmit={handleSubmit(handleAddSyllabus)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <input
                      type="text"
                      {...register('subject', { required: true })}
                      placeholder="e.g. Data Structures"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                    <input
                      type="text"
                      {...register('topic', { required: true })}
                      placeholder="e.g. Linked Lists"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <select
                        {...register('status')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    >
                      Add Topic
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

export default Syllabus;
