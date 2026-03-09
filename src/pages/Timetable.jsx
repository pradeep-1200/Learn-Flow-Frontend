import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Timetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);

  const { register, handleSubmit, reset } = useForm();

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get('/timetable');
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleOpenModal = (day) => {
    setSelectedDay(day);
    reset({ day, startTime: '', endTime: '', task: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const onSubmitAdd = async (data) => {
    try {
      await api.post('/timetable/add', data);
      handleCloseModal();
      fetchSchedule();
    } catch (error) {
      console.error('Error adding timetable entry:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this study block?')) {
      try {
        await api.delete(`/timetable/remove/${id}`);
        setSchedule(schedule.filter((entry) => entry._id !== id));
      } catch (error) {
        console.error('Error deleting timetable entry:', error);
      }
    }
  };

  // Group schedule by day
  const groupedSchedule = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedule.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Timetable</h1>
        <button
          onClick={() => handleOpenModal(DAYS_OF_WEEK[0])}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          Add Study Block
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading your schedule...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[300px]">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-between items-center">
                <h3 className="text-md font-semibold text-gray-800 dark:text-white">{day}</h3>
                <button 
                  onClick={() => handleOpenModal(day)}
                  className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title={`Add to ${day}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {groupedSchedule[day].length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                     <p className="text-xs text-center text-gray-400 dark:text-gray-500 italic px-2">No blocks scheduled</p>
                  </div>
                ) : (
                  groupedSchedule[day].map((block) => (
                    <div key={block._id} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-2 rounded-lg group relative transition-all hover:shadow-md">
                      <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">
                        {block.startTime} - {block.endTime}
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
                        {block.task}
                      </div>
                      <button
                        onClick={() => handleDelete(block._id)}
                        className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Study Block</h3>
                <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day</label>
                    <select
                      {...register('day', { required: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                        <input
                          type="time"
                          {...register('startTime', { required: true })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                        <input
                          type="time"
                          {...register('endTime', { required: true })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task / Subject</label>
                    <input
                      type="text"
                      {...register('task', { required: true })}
                      placeholder="e.g., React Course Chapter 4"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    >
                      Save Block
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

export default Timetable;
