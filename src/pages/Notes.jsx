import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import NoteEditor from '../components/NoteEditor';
import KnowledgeGraph from './KnowledgeGraph';
import NotesSkeleton from '../components/skeletons/NotesSkeleton';

const Notes = () => {
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [backlinks, setBacklinks] = useState([]);
  const { theme } = useContext(ThemeContext);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const noteTitleFromUrl = searchParams.get('note');

  useEffect(() => {
    if (noteTitleFromUrl && notes.length > 0) {
      const foundNote = notes.find(n => n.title.toLowerCase() === noteTitleFromUrl.toLowerCase());
      if (foundNote) {
        handleOpenEditor(foundNote);
      }
    }
  }, [noteTitleFromUrl, notes]);

  const fetchNotes = async (search = '') => {
    try {
      setLoading(true);
      const url = search ? `/notes?search=${encodeURIComponent(search)}` : '/notes';
      const response = await api.get(url);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const fetchLinks = async () => {
      if (currentNote?._id) {
        try {
          const response = await api.get(`/notes/links/${currentNote._id}`);
          setBacklinks(response.data.backlinks || []);
        } catch (error) {
          console.error('Error fetching links', error);
        }
      } else {
        setBacklinks([]);
      }
    };
    fetchLinks();
  }, [currentNote]);

  const handleOpenEditor = (note = null) => {
    setCurrentNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setCurrentNote(null);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (currentNote) {
        const response = await api.put(`/notes/update/${currentNote._id}`, noteData);
        setNotes(notes.map(n => n._id === currentNote._id ? response.data : n));
      } else {
        const response = await api.post('/notes/create', noteData);
        setNotes([response.data, ...notes]);
      }
      handleCloseEditor();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Delete this note? This action cannot be undone.')) {
      try {
        await api.delete(`/notes/delete/${id}`);
        setNotes(notes.filter(n => n._id !== id));
        if (currentNote && currentNote._id === id) {
            handleCloseEditor();
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleWikiLinkClick = (title) => {
    const linkedNote = notes.find(n => n.title.toLowerCase() === title.toLowerCase());
    if (linkedNote) {
        handleOpenEditor(linkedNote);
    } else {
        const createNew = window.confirm(`Note "${title}" does not exist. Create it?`);
        if (createNew) {
            handleOpenEditor({ title, content: '', tags: [], color: '#ffffff' });
        }
    }
  };

  const filteredNotes = notes;

  const tagsList = useMemo(() => {
    const counts = {};
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]);
  }, [notes]);

  const getHeatmapColor = (level) => {
    if (theme === 'dark') {
      const darkColors = ['#2d333b', '#0e4429', '#006d32', '#26a641', '#39d353'];
      return darkColors[level];
    }
    const lightColors = ['#ffffff', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    return lightColors[level];
  };
  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden notes-container min-h-0">
      <div className="flex gap-6 border-b mb-4">
        <button
          onClick={() => setActiveTab("notes")}
          className={activeTab === "notes" ? "font-semibold border-b-2 border-indigo-500 pb-2 text-gray-900 dark:text-white" : "text-gray-500 pb-2"}
        >
          Notes
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={activeTab === "graph" ? "font-semibold border-b-2 border-indigo-500 pb-2 text-gray-900 dark:text-white" : "text-gray-500 pb-2"}
        >
          Knowledge Graph
        </button>
      </div>

      {activeTab === "notes" && (
      <>
        {loading ? (
            <NotesSkeleton />
        ) : (
        <>
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 shrink-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
             <input 
                type="text" 
                placeholder="Search notes, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
             />
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
             </div>
          </div>
          <button
            onClick={() => handleOpenEditor()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            New Note
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 min-h-0">
        
        <div className={`w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 ${isEditorOpen ? 'hidden lg:flex' : 'flex'}`}>
            <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 z-10 space-y-4 rounded-t-xl shrink-0">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tag Explorer</h3>
                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
                    {tagsList.length > 0 ? tagsList.map(([tag, count]) => (
                        <button 
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800/30"
                        >
                            #{tag} <span className="ml-1 opacity-60 text-[10px] bg-indigo-200 dark:bg-indigo-800 px-1.5 rounded-full">{count}</span>
                        </button>
                    )) : <span className="text-sm text-gray-400">No tags used yet</span>}
                </div>
            </div>
            
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">All Notes ({filteredNotes.length})</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
            {filteredNotes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    No notes found. Create your first note!
                </div>
            ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredNotes.map(note => (
                        <li 
                           key={note._id} 
                           onClick={() => handleOpenEditor(note)}
                           style={{ backgroundColor: note.color || '#ffffff' }}
                           className={`p-4 cursor-pointer hover:opacity-90 transition-opacity ${currentNote?._id === note._id ? 'border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                        >
                            <h4 className="text-md font-semibold text-gray-900 dark:text-white truncate">{note.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {note.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\[\[(.*?)\]\]/g, ' 🔗 $1')}
                            </p>
                            
                            {note.tags && note.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {note.tags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="text-xs text-gray-400 mt-2">
                                {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            </div>
        </div>

        {/* Note Editor Area */}
        <div className={`w-full lg:flex-1 h-full flex flex-col min-h-0 ${!isEditorOpen ? 'hidden lg:flex' : 'flex'}`}>
            {isEditorOpen ? (
               <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col min-h-0 overflow-hidden">
                 <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {currentNote ? 'Edit Note' : 'Create New Note'}
                    </h2>
                    <div className="flex gap-2">
                         {currentNote && (
                            <button
                                onClick={() => handleDeleteNote(currentNote._id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded transition-colors"
                                title="Delete note"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                         )}
                         <button 
                            onClick={handleCloseEditor}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 p-2 lg:hidden bg-gray-100 dark:bg-gray-700 rounded"
                         >
                            Close
                         </button>
                    </div>
                 </div>
                 <NoteEditor 
                     key={currentNote?._id || 'new'} 
                     defaultTitle={currentNote?.title}
                     defaultContent={currentNote?.content}
                     defaultTags={currentNote?.tags?.join(', ') || ''}
                     defaultColor={currentNote?.color || '#ffffff'}
                     onSubmit={handleSaveNote}
                     onCancel={handleCloseEditor}
                     isUpdate={!!currentNote?._id}
                     onWikiLinkClick={handleWikiLinkClick}
                     allNotes={notes}
                 />
                 
                 {currentNote && backlinks.length > 0 && (
                     <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                         <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Referenced by:</h3>
                         <div className="flex flex-wrap gap-2">
                             {backlinks.map(link => (
                                 <button 
                                     key={link._id}
                                     onClick={() => handleWikiLinkClick(link.sourceNoteId.title)}
                                     className="py-1.5 px-3 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs flex items-center gap-2"
                                 >
                                     <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: link.sourceNoteId.color || '#ffffff' }}></span>
                                     {link.sourceNoteId.title}
                                 </button>
                             ))}
                         </div>
                     </div>
                 )}
               </div>
            ) : (
                <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-full mb-4">
                        <svg className="w-12 h-12 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Note Selected</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">Select a note from the list on the left to read or edit it, or create a new note to start writing.</p>
                </div>
            )}
        </div>
      </div>
      </>
      )}
      </>
      )}

      {activeTab === "graph" && (
        <KnowledgeGraph />
      )}
    </div>
  );
};

export default Notes;
