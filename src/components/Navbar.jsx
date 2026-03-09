import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 p-4 transition-colors duration-200">
            <div className="flex justify-between flex-wrap items-center">
                <div className="flex items-center space-x-2">
                    {/* Add Logo icon here if desired */}
                    <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">LearnFlow</span>
                    <span className="text-gray-400 font-medium px-2 hidden sm:inline">|</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium hidden sm:inline hidden sm:block">Dashboard</span>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-700 transition-colors"
                        title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === 'dark' ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                           </svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                           </svg>
                        )}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                        <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 h-8 w-8 rounded-full flex items-center justify-center font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                            {user?.name || 'User'}
                        </span>
                    </div>

                    <button 
                        onClick={logout}
                        className="text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
