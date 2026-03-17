import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import CourseSkillRadar from './CourseSkillRadar';

const platformIcons = {
  Udemy: '🎓',
  YouTube: '▶️',
  Coursera: '📘',
  'Frontend Masters': '🖥️',
  Default: '📚'
};

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const CourseCard = ({ course, onUpdate, onDelete, onUpdateProgressDirectly }) => {
  const [expanded, setExpanded] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const percentComplete = Math.min(
    100,
    ((course.completedModules || 0) / (course.totalModules || 1)) * 100
  );

  useEffect(() => {
    let interval = null;
    if (isStudying) {
      interval = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const toggleStudySession = async () => {
    if (isStudying) {
      // Stop Session
      setIsStudying(false);
      const sessionMinutes = Math.floor(sessionSeconds / 60);
      if (sessionMinutes > 0) {
          await onUpdateProgressDirectly(course._id, { sessionTime: sessionMinutes });
      }
      setSessionSeconds(0);
    } else {
      // Start Session
      setIsStudying(true);
      setSessionSeconds(0);
    }
  };

  const formatStudyTime = () => {
    const totalMins = (course.totalStudyTime || 0) + Math.floor(sessionSeconds / 60);
    if (totalMins === 0) return '0 hrs';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h > 0 ? h + ' hrs ' : ''}${m} mins`;
  };

  const handleModuleToggle = async (moduleIndex) => {
    const newModules = [...(course.modules || [])];
    const newCompleted = !newModules[moduleIndex].completed;
    newModules[moduleIndex].completed = newCompleted;
    
    // Auto-update count
    const completedCount = newModules.filter(m => m.completed).length;
    
    if (completedCount === course.totalModules && newCompleted) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    await onUpdateProgressDirectly(course._id, { 
      modules: newModules, 
      completedModules: completedCount 
    });
  };

  // Prediction Math
  const calculatePrediction = () => {
      if (!course.lastStudiedDate || course.completedModules === 0) return "Not enough data";
      const createdAt = new Date(course.createdAt);
      const today = new Date();
      const daysSinceStart = Math.max(1, Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24)));
      const pace = course.completedModules / daysSinceStart;
      if (pace <= 0) return "Needs consistent study";
      
      const remainingModules = course.totalModules - course.completedModules;
      if (remainingModules === 0) return "Completed!";
      
      const predictionDays = Math.ceil(remainingModules / pace);
      const predictionDate = new Date();
      predictionDate.setDate(today.getDate() + predictionDays);
      return predictionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {platformIcons[course.platform] || platformIcons.Default} {course.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs text-gray-500 dark:text-gray-400">{course.platform} • {course.type}</span>
             <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${difficultyColors[course.difficulty || 'Beginner']}`}>
                {course.difficulty || 'Beginner'}
             </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {course.currentStreak > 0 && (
           <span className="flex items-center gap-1 text-sm font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
             🔥 {course.currentStreak} Day Streak
           </span>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
           Last studied: {(course.lastStudiedDate && new Date(course.lastStudiedDate).toDateString() === new Date().toDateString()) ? "Today" : course.lastStudiedDate ? new Date(course.lastStudiedDate).toLocaleDateString() : "Never"}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
          <span>{course.completedModules} / {course.totalModules} modules</span>
          <span>{Math.round(percentComplete)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-700 ${percentComplete === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} 
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl mb-4 text-sm">
        <div className="text-gray-600 dark:text-gray-300">
           ⏱️ Time Spent: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatStudyTime()}</span>
        </div>
        <button 
           onClick={toggleStudySession}
           className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
               isStudying 
                 ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                 : "bg-indigo-600 hover:bg-indigo-700 text-white"
           }`}
        >
           {isStudying ? `⏹ Stop (${Math.floor(sessionSeconds/60)}:${('0'+(sessionSeconds%60)).slice(-2)})` : "▶ Start Session"}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 space-y-6 pt-5 border-t border-gray-100 dark:border-gray-700 fade-in">
           {/* Roadmap Modules */}
           {course.modules && course.modules.length > 0 && (
               <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2 text-center">Roadmap</h4>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                     {course.modules.map((m, idx) => (
                         <div key={m._id || idx} className="flex items-center gap-1">
                             <button
                               onClick={() => handleModuleToggle(idx)} 
                               className={`w-5 h-5 flex items-center justify-center rounded-full border text-xs transition-colors ${
                                  m.completed 
                                    ? "bg-green-500 border-green-500 text-white shadow-sm" 
                                    : "border-gray-300 dark:border-gray-600 text-transparent hover:border-indigo-400"
                               }`}
                             >
                                 ✔
                             </button>
                             <span className={`text-xs ${m.completed ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                 {m.title}
                             </span>
                             {idx < course.modules.length - 1 && <span className="text-gray-300 dark:text-gray-600 ml-1">→</span>}
                         </div>
                     ))}
                  </div>
               </div>
           )}

           {/* AI Prediction & Skills Radar Layer */}
           <div className="grid grid-cols-2 gap-4 items-center bg-white dark:bg-gray-800 p-2 rounded-xl">
               <div className="space-y-3">
                   <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Estimated Completion</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1 cursor-default font-medium">{calculatePrediction()}</p>
                   </div>
                   {course.linkedNotes && course.linkedNotes.length > 0 && (
                       <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-2">Linked Notes 📝</p>
                          <ul className="space-y-1">
                             {course.linkedNotes.map(n => (
                                 <li key={n._id}>
                                     <Link to={`/notes?id=${n._id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs line-clamp-1">
                                         • {n.title}
                                     </Link>
                                 </li>
                             ))}
                          </ul>
                       </div>
                   )}
               </div>
               <div>
                   <CourseSkillRadar course={course} />
               </div>
           </div>
           
           {/* Tags */}
           {(course.tags || course.skills) && (
             <div className="flex flex-wrap gap-1 mt-2">
                 {[...(course.tags || []), ...(course.skills || [])].map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full cursor-default">
                        #{t.toLowerCase()}
                    </span>
                 ))}
             </div>
           )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="mt-5 flex space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm py-2 rounded-lg transition-colors"
        >
          {expanded ? "Collapse Details" : "View Details / Roadmap"}
        </button>
        <button 
          onClick={() => onUpdate(course)}
          className="px-3 bg-white border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors text-gray-500"
          title="Edit Details"
        >
          ✏️
        </button>
        <button 
          onClick={() => onDelete(course._id)}
          className="px-3 bg-red-50 hover:bg-red-100 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          title="Delete Course"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
