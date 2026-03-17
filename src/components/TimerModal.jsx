import React, { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import api from '../services/api';

const TimerModal = ({ task, onClose, onTimerComplete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(25 * 60); // 25 mins Focus default
    const [isCompleted, setIsCompleted] = useState(false);
    
    // We update the backend upon timer completion
    const handleComplete = async () => {
        setIsPlaying(false);
        setIsCompleted(true);
        try {
            // we increment the focusSessions and totalFocusTime by getting current task and making an update
            const updatedTask = {
                ...task,
                focusSessions: (task.focusSessions || 0) + 1,
                totalFocusTime: (task.totalFocusTime || 0) + (duration / 60)
            };
            const response = await api.put(`/tasks/update/${task._id}`, updatedTask);
            if(onTimerComplete) onTimerComplete(response.data);
        } catch (error) {
            console.error('Failed to update focus data:', error);
        }
    };

    const renderTime = ({ remainingTime }) => {
        if (remainingTime === 0 || isCompleted) {
          return <div className="text-xl font-bold text-green-500">Done! ✅</div>;
        }
      
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
      
        return (
          <div className="flex flex-col items-center">
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Focus Mode</div>
            <div className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
            </div>
          </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 relative flex flex-col items-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{task.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center px-4">Focus on this task without distractions.</p>

                <div className="my-8 flex justify-center">
                    <CountdownCircleTimer
                        isPlaying={isPlaying}
                        duration={duration}
                        colors={['#4f46e5', '#818cf8', '#22c55e']}
                        colorsTime={[duration, duration / 2, 0]}
                        onComplete={handleComplete}
                        size={220}
                        strokeWidth={14}
                        trailColor="#e5e7eb"
                    >
                        {renderTime}
                    </CountdownCircleTimer>
                </div>

                <div className="flex gap-4 mt-6">
                    {!isCompleted ? (
                        <>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors min-w-[120px] ${
                                    isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {isPlaying ? 'Pause' : 'Start Focus'}
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={onClose}
                            className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimerModal;
