import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import TaskAnalytics from '../components/TaskAnalytics';
import TasksSkeleton from '../components/skeletons/TasksSkeleton';
import TimerModal from '../components/TimerModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('List'); // List, Kanban, Calendar
  const [focusTask, setFocusTask] = useState(null); // Timer modal

  const { register, handleSubmit, reset, control, setValue } = useForm({
    defaultValues: {
      subtasks: []
    }
  });
  
  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask } = useFieldArray({
    control,
    name: "subtasks"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, notesRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/notes')
      ]);
      setTasks(tasksRes.data);
      setNotes(notesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <TasksSkeleton />;

  const handleOpenAddModal = () => {
    reset({ 
      title: '', 
      description: '', 
      priority: 'Medium', 
      status: 'To Do', 
      category: 'General', 
      deadline: '', 
      subtasks: [],
      linkedNotes: []
    });
    setIsUpdateMode(false);
    setIsModalOpen(true);
  };

  const handleOpenUpdateModal = (task) => {
    setIsUpdateMode(true);
    setSelectedTask(task);
    reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        category: task.category,
        subtasks: task.subtasks || [],
        linkedNotes: task.linkedNotes?.map(n => n._id) || []
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

  const handleUpdateTask = async (updatedTask) => {
    try {
        const response = await api.put(`/tasks/update/${updatedTask._id}`, updatedTask);
        setTasks(tasks.map(t => t._id === updatedTask._id ? response.data : t));
    } catch (error) {
        console.error('Error updating task fully:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
      if (filter === 'All') return true;
      if (filter === 'Completed') return task.status === 'Completed';
      if (filter === 'Pending') return task.status === 'Pending' || task.status === 'In Progress' || task.status === 'To Do';
      if (filter === 'High Priority') return task.priority === 'High';
      return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            Task Manager
        </h1>

        <div className="flex flex-wrap items-center gap-3">
           <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex space-x-1">
             {[
               { id: 'List',     icon: '☰',  label: 'List'     },
               { id: 'Kanban',   icon: '⬛', label: 'Kanban'   },
               { id: 'Calendar', icon: '🗓️', label: 'Calendar' },
               { id: 'Stats',    icon: '📊', label: 'Stats'    },
             ].map(({ id, icon, label }) => (
                 <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      viewMode === id
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                 >
                     <span>{icon}</span>
                     <span className="hidden sm:inline">{label}</span>
                 </button>
             ))}
           </div>
           
           {viewMode === 'List' && (
             <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 text-sm text-gray-700 dark:text-gray-200 mt-2 sm:mt-0"
             >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending / To Do</option>
                <option value="Completed">Completed</option>
                <option value="High Priority">High Priority</option>
             </select>
           )}

           <button
             onClick={handleOpenAddModal}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm whitespace-nowrap mt-2 sm:mt-0"
           >
             + New Task
           </button>
        </div>
      </div>

      {/* VIEWS */}
      {viewMode === 'List' && (
          filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-gray-500">No tasks found. Create a new task to get started.</p>
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
                  onUpdateTask={handleUpdateTask}
                  onStartFocus={() => setFocusTask(task)}
                />
              ))}
            </div>
          )
      )}

      {viewMode === 'Kanban' && (
         <KanbanBoard 
            tasks={tasks} // use all tasks for Kanban
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
            onEdit={handleOpenUpdateModal}
         />
      )}

      {viewMode === 'Calendar' && (
         <CalendarView 
            tasks={tasks} 
            onEdit={handleOpenUpdateModal}
         />
      )}

      {viewMode === 'Stats' && (
         <TaskAnalytics />
      )}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-2xl w-full">
              <div className="bg-white dark:bg-gray-800 px-6 pt-5 pb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {isUpdateMode ? 'Edit Task' : 'Create New Task'}
                </h3>
                <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
                    <input
                      type="text"
                      {...register('title', { required: true })}
                      placeholder="e.g. Complete React Section 4"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      rows="3"
                      {...register('description')}
                      placeholder="Add any extra details here..."
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                      <select
                        {...register('priority', { required: true })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm dark:bg-gray-700 dark:text-white"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
                        <input
                          type="date"
                          {...register('deadline')}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select
                          {...register('category')}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                            <option value="Study">📘 Study</option>
                            <option value="Coding">💻 Coding</option>
                            <option value="Project">📁 Project</option>
                            <option value="Revision">🧠 Revision</option>
                            <option value="Goals">🎯 Goals</option>
                            <option value="General">📝 General</option>
                        </select>
                      </div>
                  </div>

                  {/* SUBTASKS SYSTEM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtasks</label>
                    <div className="space-y-2">
                        {subtaskFields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register(`subtasks.${index}.completed`)}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                                />
                                <input
                                    type="text"
                                    {...register(`subtasks.${index}.title`, { required: true })}
                                    className="flex-1 border-b border-gray-300 dark:border-gray-600 bg-transparent py-1 px-2 focus:outline-none focus:border-indigo-500 dark:text-white sm:text-sm"
                                    placeholder="Subtask description..."
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSubtask(index)}
                                    className="text-red-500 hover:text-red-700 px-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => appendSubtask({ title: '', completed: false })}
                            className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800"
                        >
                            + Add Subtask
                        </button>
                    </div>
                  </div>

                  {/* LINKED NOTES */}
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link Notes (Optional)</label>
                      <select
                          multiple
                          {...register('linkedNotes')}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 sm:text-sm dark:bg-gray-700 dark:text-white"
                          size="3"
                      >
                          {notes.map(note => (
                              <option key={note._id} value={note._id}>{note.title}</option>
                          ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t dark:border-gray-700 pt-4">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isUpdateMode ? 'Save Changes' : 'Create Task'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

      {focusTask && (
        <TimerModal 
            task={focusTask} 
            onClose={() => setFocusTask(null)}
            onTimerComplete={(updatedTask) => {
                handleUpdateTask(updatedTask);
                // Can keep it open or close automatically. We'll leave it up to user to close.
            }}
        />
      )}
    </div>
  );
};

export default Tasks;
