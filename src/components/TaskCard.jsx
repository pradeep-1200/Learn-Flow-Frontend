import React, { useState } from 'react';

const categoryIcons = {
  Study: '📘',
  Coding: '💻',
  Project: '📁',
  Revision: '🧠',
  Goals: '🎯',
};

const TaskCard = ({ task, onUpdateStatus, onDelete, onEdit, onUpdateTask, onStartFocus, compact = false }) => {
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

  const getDeadlineStyles = (deadline, status) => {
    if (status === 'Completed' || !deadline) return { borderClass: 'border-gray-100 dark:border-gray-700', textClass: 'text-gray-500', isOverdue: false };
    
    // Convert dates
    const now = new Date();
    // Reset to start of day for comparison
    now.setHours(0,0,0,0);
    const dDate = new Date(deadline);
    dDate.setHours(0,0,0,0);

    const diffTime = dDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { borderClass: 'border-red-600 dark:border-red-600 border-l-4 shadow-sm', textClass: 'text-red-600 font-bold', isOverdue: true };
    if (diffDays === 0 || diffDays === 1) return { borderClass: 'border-red-400 dark:border-red-400 border-l-4 shadow-sm', textClass: 'text-red-500 font-semibold', isOverdue: false };
    if (diffDays <= 3) return { borderClass: 'border-orange-400 dark:border-orange-400 border-l-4 shadow-sm', textClass: 'text-orange-500 font-medium', isOverdue: false };
    
    return { borderClass: 'border-gray-100 dark:border-gray-700', textClass: 'text-gray-500', isOverdue: false };
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        setIsDeleting(true);
        await onDelete(task._id);
    }
  };

  const handleSubtaskToggle = (index) => {
     if(!onUpdateTask) return;
     const updatedTask = { ...task };
     updatedTask.subtasks[index].completed = !updatedTask.subtasks[index].completed;
     onUpdateTask(updatedTask);
  };

  const { borderClass, textClass, isOverdue } = getDeadlineStyles(task.deadline, task.status);
  
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border transition-all ${task.status === 'Completed' ? 'opacity-70 bg-gray-50 dark:bg-gray-800/60' : 'hover:shadow-md'} ${borderClass}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-3 w-full">
           {!compact && (
            <input
              type="checkbox"
              checked={task.status === 'Completed'}
              onChange={(e) => onUpdateStatus(task._id, e.target.checked ? 'Completed' : 'Pending')}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer transition-colors mt-1 shrink-0"
              disabled={isDeleting}
            />
           )}
           <div className="flex-1 w-full min-w-0">
             <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold truncate ${getStatusColor(task.status)} transition-colors`}>
                  {isOverdue && '⚠️ '}{task.title}
                </h3>
             </div>
             {task.description && !compact && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
             )}
           </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
        </span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium flex items-center">
            <span className="mr-1">{categoryIcons[task.category] || '📌'}</span> {task.category}
        </span>
        
        {task.deadline && (
          <span className={`flex items-center text-xs ml-auto bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700 ${textClass}`}>
             <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
             {isOverdue ? "Overdue" : new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {totalSubtasks > 0 && !compact && (
        <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
               <span className="text-gray-500 dark:text-gray-400">Progress</span>
               <span className="text-gray-700 dark:text-gray-300 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
               <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="space-y-1.5 mt-2">
               {task.subtasks.map((st, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm">
                      <input 
                         type="checkbox" 
                         checked={st.completed}
                         onChange={() => handleSubtaskToggle(i)}
                         className="h-3.5 w-3.5 text-indigo-500 rounded border-gray-300 cursor-pointer"
                      />
                      <span className={st.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                        {st.title}
                      </span>
                  </div>
               ))}
            </div>
        </div>
      )}

      {task.linkedNotes?.length > 0 && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500">
            <span className="font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Linked Notes</span>
            <ul className="list-disc pl-4 space-y-0.5">
               {task.linkedNotes.map((note) => (
                  <li key={note._id} className="text-indigo-600 dark:text-indigo-400">
                     {note.title}
                  </li>
               ))}
            </ul>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
         <select
             value={task.status}
             onChange={(e) => onUpdateStatus(task._id, e.target.value)}
             className="text-xs bg-transparent border-none text-gray-500 dark:text-gray-400 cursor-pointer focus:ring-0 p-0"
             disabled={isDeleting}
         >
             <option value="Pending">Pending</option>
             <option value="To Do">To Do</option>
             <option value="In Progress">In Progress</option>
             <option value="Review">Review</option>
             <option value="Completed">Completed</option>
         </select>
         
         <div className="flex space-x-3 items-center">
             {onStartFocus && !compact && task.status !== 'Completed' && (
                <button
                    onClick={() => onStartFocus(task)}
                    className="flex items-center text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Focus
                </button>
             )}
             <button
                 onClick={() => onEdit(task)}
                 className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                 disabled={isDeleting}
             >
                 Edit
             </button>
             {!compact && (
                <button
                    onClick={handleDelete}
                    className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                    disabled={isDeleting}
                >
                    {isDeleting ? '...' : 'Delete'}
                </button>
             )}
         </div>
      </div>
    </div>
  );
};

export default TaskCard;
