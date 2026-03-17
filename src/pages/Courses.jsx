import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import CoursesSkeleton from '../components/skeletons/CoursesSkeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allNotes, setAllNotes] = useState([]);

  // Filters & Sorting setup
  const [filterView, setFilterView] = useState('All'); // 'All', 'In Progress', 'Completed'
  const [filterSkill, setFilterSkill] = useState('All');
  const [sortBy, setSortBy] = useState('progress'); // 'progress', 'newest', 'recent'

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchCourses = async () => {
    try {
      const [courseRes, notesRes] = await Promise.all([
        api.get('/courses'),
        api.get('/notes')
      ]);
      setCourses(courseRes.data);
      setAllNotes(notesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleUpdateProgressDirectly = async (courseId, payload) => {
      try {
          const response = await api.put(`/courses/update-progress/${courseId}`, payload);
          setCourses(courses.map(c => c._id === courseId ? response.data : c));
      } catch (error) {
          console.error("Error updating progress:", error);
      }
  };

  const handleOpenAddModal = () => {
    reset();
    setIsUpdateMode(false);
    setIsModalOpen(true);
  };

  const handleOpenUpdateModal = (course) => {
    setIsUpdateMode(true);
    setSelectedCourse(course);
    setValue('completedModules', course.completedModules);
    setValue('timeSpent', course.timeSpent);
    setValue('linkedNotes', course.linkedNotes?.map(n => n._id || n) || []);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setIsUpdateMode(false);
    reset();
  };

  const onSubmitAdd = async (data) => {
    try {
      const payload = { ...data };
      if (payload.tags && typeof payload.tags === 'string') {
          payload.tags = payload.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      
      if (isUpdateMode) {
        const response = await api.put(`/courses/update-progress/${selectedCourse._id}`, payload);
        setCourses(courses.map(c => c._id === selectedCourse._id ? response.data : c));
      } else {
        const response = await api.post('/courses/add', payload);
        setCourses([...courses, response.data]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/delete/${id}`);
        setCourses(courses.filter(c => c._id !== id));
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  // derived data
  const allSkills = useMemo(() => {
      const skills = new Set();
      courses.forEach(c => {
          if (c.skills) c.skills.forEach(s => skills.add(s));
          if (c.skill) skills.add(c.skill);
      });
      return Array.from(skills);
  }, [courses]);

  const filteredAndSortedCourses = useMemo(() => {
      let result = [...courses];
      
      // Filter by View Status
      if (filterView === 'In Progress') {
          result = result.filter(c => (c.completedModules / c.totalModules) < 1);
      } else if (filterView === 'Completed') {
          result = result.filter(c => (c.completedModules / c.totalModules) >= 1);
      }

      // Filter by Skill
      if (filterSkill !== 'All') {
          result = result.filter(c => (c.skills && c.skills.includes(filterSkill)) || c.skill === filterSkill);
      }

      // Sorting
      result.sort((a, b) => {
          if (sortBy === 'progress') {
              const pA = a.completedModules / Math.max(a.totalModules, 1);
              const pB = b.completedModules / Math.max(b.totalModules, 1);
              return pB - pA;
          }
          if (sortBy === 'newest') {
              return new Date(b.createdAt) - new Date(a.createdAt);
          }
          if (sortBy === 'recent') {
              const dA = a.lastStudiedDate ? new Date(a.lastStudiedDate) : new Date(0);
              const dB = b.lastStudiedDate ? new Date(b.lastStudiedDate) : new Date(0);
              return dB - dA;
          }
          return 0;
      });

      return result;
  }, [courses, filterView, filterSkill, sortBy]);

  // Weekly Graph Data prep
  const weeklyData = useMemo(() => {
       const weeks = [
         { name: '3 weeks ago', completed: 0 },
         { name: '2 weeks ago', completed: 0 },
         { name: 'Last week', completed: 0 },
         { name: 'This week', completed: 0 }
       ];
       const now = new Date();
       
       courses.forEach(course => {
           // We count actual course completions if they have completedAt,
           // else approximate with updatedAt if they are physically 100% completed
           const isCompleted = (course.completedModules / Math.max(1, course.totalModules)) >= 1;
           let dt = null;
           
           if (course.completedAt) {
               dt = new Date(course.completedAt);
           } else if (isCompleted && course.updatedAt) {
               dt = new Date(course.updatedAt);
           }

           if (dt) {
               const diffDays = Math.floor((now - dt)/(1000 * 60 * 60 * 24));
               if (diffDays >= 0 && diffDays <= 7) weeks[3].completed++;
               else if (diffDays > 7 && diffDays <= 14) weeks[2].completed++;
               else if (diffDays > 14 && diffDays <= 21) weeks[1].completed++;
               else if (diffDays > 21 && diffDays <= 28) weeks[0].completed++;
           }
       });
       return weeks;
  }, [courses]);

  if (loading) return <CoursesSkeleton />;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Learning Tracker</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md transform hover:scale-105"
        >
          + Add Course
        </button>
      </div>

      {/* Weekly Graph & Totals */}
      {courses.length > 0 && (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
               <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Past 4 Weeks Progress</h3>
               <div className="h-40 w-full">
                  <ResponsiveContainer>
                      <LineChart data={weeklyData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} allowDecimals={false} />
                         <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                            itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                         />
                         <Line type="monotone" dataKey="completed" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="flex flex-wrap gap-4 flex-shrink-0 md:w-64">
               <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex-1 min-w-[120px]">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1">Courses</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
               </div>
               <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex-1 min-w-[120px]">
                  <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {courses.filter(c => (c.completedModules / Math.max(1, c.totalModules)) >= 1).length}
                  </p>
               </div>
            </div>
         </div>
      )}

      {/* Filters Toolbar */}
      {courses.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-between">
             <div className="flex bg-white dark:bg-gray-900 shadow-sm rounded-lg p-1 border border-gray-100 dark:border-gray-700">
                {['All', 'In Progress', 'Completed'].map(v => (
                    <button 
                       key={v}
                       onClick={() => setFilterView(v)}
                       className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterView === v ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        {v}
                    </button>
                ))}
             </div>
             
             <div className="flex gap-3">
                 <select 
                     value={filterSkill} 
                     onChange={(e) => setFilterSkill(e.target.value)}
                     className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                 >
                     <option value="All">All Skills</option>
                     {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>

                 <select 
                     value={sortBy} 
                     onChange={(e) => setSortBy(e.target.value)}
                     className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                 >
                     <option value="progress">Sort by Progress</option>
                     <option value="recent">Sort by Recently Studied</option>
                     <option value="newest">Sort by Newest</option>
                 </select>
             </div>
          </div>
      )}

      {/* Course List */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Build Your Learning Path</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">Track your daily study habits, maintain your streak, and organize your modules into a beautiful developer learning roadmap.</p>
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors inline-block"
          >
            Start Your First Course
          </button>
        </div>
      ) : filteredAndSortedCourses.length === 0 ? (
         <div className="text-center py-12 text-gray-500 dark:text-gray-400">
             No courses match your current filters.
         </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredAndSortedCourses.map((course) => (
            <CourseCard 
              key={course._id} 
              course={course} 
              onUpdate={handleOpenUpdateModal}
              onDelete={handleDelete}
              onUpdateProgressDirectly={handleUpdateProgressDirectly}
            />
          ))}
        </div>
      )}

      {/* Modal / Dialog for Add/Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl w-full">
              <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isUpdateMode ? 'Update Progress Details 🌱' : 'Add New Resource 📚'}
                </h3>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                  {isUpdateMode ? 'You can easily update completion inside the card roadmap as well.' : 'Track your learning journey systematically.'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-6">
                <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-5">
                  {!isUpdateMode ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                        <input
                          type="text"
                          {...register('title', { required: true })}
                          placeholder="e.g. Total TypeScript"
                          className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                          <select
                            {...register('type', { required: true })}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="Course">Course</option>
                            <option value="Book">Book</option>
                            <option value="Tutorial">Tutorial</option>
                            <option value="Project">Project Repo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Platform / Source</label>
                          <select
                            {...register('platform', { required: true })}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="YouTube">YouTube</option>
                            <option value="Udemy">Udemy</option>
                            <option value="Coursera">Coursera</option>
                            <option value="Frontend Masters">Frontend Masters</option>
                            <option value="Pluralsight">Pluralsight</option>
                            <option value="Default">Other (Website/Book)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                          <select
                            {...register('difficulty')}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Primary Skill</label>
                          <input
                            type="text"
                            {...register('skill', { required: true })}
                            placeholder="e.g. React"
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tags (Comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. backend, nodejs, devops"
                            {...register('tags')}
                            onChange={(e) => {
                                // Transform comma separated string to array before submission if needed, 
                                // or parse it in onSubmitAdd. We'll parse it in onSubmitAdd.
                            }}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Modules</label>
                          <input
                            type="number"
                            min="1"
                            {...register('totalModules', { required: true })}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 mt-2">Modules will be automatically generated as "Module 1", "Module 2", etc.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Completed Modules Override</label>
                          <input
                            type="number"
                            min="0"
                            max={selectedCourse?.totalModules}
                            {...register('completedModules', { required: true })}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Legacy Time Spent (hrs)</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            {...register('timeSpent', { required: true })}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Linked Notes (Ctrl+Click to select multiple)</label>
                          <select
                            multiple
                            {...register('linkedNotes')}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            {allNotes.map(n => (
                              <option key={n._id} value={n._id}>{n.title}</option>
                            ))}
                          </select>
                      </div>
                    </>
                  )}
                  <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-md px-6 py-2.5 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      {isUpdateMode ? 'Save Details' : 'Create Course'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
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

export default Courses;
