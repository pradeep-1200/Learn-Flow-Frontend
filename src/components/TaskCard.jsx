import React, { useState } from 'react';

const TaskCard = ({ task, onUpdateStatus, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-400';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-400';
      case 'Low': return 'text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-400';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-500 line-through text-gray-400';
      case 'In Progress': return 'text-indigo-600 dark:text-indigo-400 font-medium';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await onDelete(task._id);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all ${task.status === 'Completed' ? 'opacity-70 bg-gray-50 dark:bg-gray-800/60' : 'hover:shadow-md'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={task.status === 'Completed'}
            onChange={(e) => onUpdateStatus(task._id, e.target.checked ? 'Completed' : 'Pending')}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer transition-colors"
            disabled={isDeleting}
          />
          <div>
            <h3 className={`text-lg font-semibold ${getStatusColor(task.status)} transition-colors`}>
              {task.title}
            </h3>
            {task.description && (
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
          {task.category}
        </span>
        
        {task.deadline && (
          <span className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-auto bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
         <select
           value={task.status}
           onChange={(e) => onUpdateStatus(task._id, e.target.value)}
           className="text-xs bg-transparent border-none text-gray-500 dark:text-gray-400 cursor-pointer focus:ring-0 p-0"
           disabled={isDeleting}
         >
           <option value="Pending">Pending</option>
           <option value="In Progress">In Progress</option>
           <option value="Completed">Completed</option>
         </select>
         
         <div className="flex space-x-3">
             <button
               onClick={() => onEdit(task)}
               className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
               disabled={isDeleting}
             >
                 Edit
             </button>
             <button
               onClick={handleDelete}
               className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
               disabled={isDeleting}
             >
                 {isDeleting ? 'Deleting...' : 'Delete'}
             </button>
         </div>
      </div>
    </div>
  );
};

export default TaskCard;
