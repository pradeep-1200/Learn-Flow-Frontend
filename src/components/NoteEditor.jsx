import React, { useState } from 'react';

const NoteEditor = ({ defaultTitle = '', defaultContent = '', defaultTags = '', onSubmit, onCancel, isUpdate = false }) => {
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [tags, setTags] = useState(defaultTags);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    // Parse tags string into array
    const parsedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : tags;

    onSubmit({ title, content, tags: parsedTags });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Note Title"
            required
          />
        </div>

        <div>
           <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
           <input
             type="text"
             id="tags"
             value={tags}
             onChange={(e) => setTags(e.target.value)}
             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             placeholder="react, javascript, frontend"
           />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content (Markdown supported style)</label>
          <textarea
            id="content"
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Write your study notes here..."
            required
          ></textarea>
        </div>
      </div>

      <div className="mt-5 flex justify-end space-x-3">
        {onCancel && (
            <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
            Cancel
            </button>
        )}
        <button
          type="submit"
          disabled={!title.trim() || !content.trim()}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isUpdate ? 'Update Note' : 'Save Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteEditor;
