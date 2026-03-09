import React, { useState, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { CirclePicker } from 'react-color';

const NoteEditor = ({ defaultTitle = '', defaultContent = '', defaultTags = '', defaultColor = '#ffffff', onSubmit, onCancel, isUpdate = false, onWikiLinkClick, allNotes = [] }) => {
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [tags, setTags] = useState(defaultTags);
  const [color, setColor] = useState(defaultColor);
  const [isPreview, setIsPreview] = useState(isUpdate);
  const [suggestionQuery, setSuggestionQuery] = useState(null);
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextStyle,
      Color
    ],
    editorProps: {
      attributes: {
        class: '!outline-none focus:!outline-none focus:!ring-0 border-none w-full h-full min-h-[250px]',
      },
    },
    content: defaultContent,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      
      const { state, view } = editor;
      const { selection } = state;
      const { $from, empty } = selection;
      
      if (!empty) {
        setSuggestionQuery(null);
        return;
      }
      
      const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
      const match = textBefore.match(/\[\[([^\]]*)$/);
      
      if (match) {
        setSuggestionQuery(match[1]);
        const coords = view.coordsAtPos($from.pos);
        setSuggestionPos({ top: coords.bottom, left: coords.left });
      } else {
        setSuggestionQuery(null);
      }
    }
  });

  useEffect(() => {
    if (editor && defaultContent !== editor.getHTML()) {
      editor.commands.setContent(defaultContent);
    }
  }, [defaultContent, editor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    // Parse tags string into array
    const parsedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : tags;

    onSubmit({ title, content, tags: parsedTags, color });
  };

  const suggestions = useMemo(() => {
    if (suggestionQuery === null) return [];
    return allNotes.filter(n => n.title.toLowerCase().includes(suggestionQuery.toLowerCase()));
  }, [allNotes, suggestionQuery]);

  const insertWikiLink = (noteTitle) => {
    if (!editor) return;
    const { state } = editor;
    const { $from } = state.selection;
    const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
    const match = textBefore.match(/\[\[([^\]]*)$/);
    if (match) {
      const startPos = $from.pos - match[0].length;
      editor
        .chain()
        .focus()
        .deleteRange({ from: startPos, to: $from.pos })
        .insertContent(`[[${noteTitle}]] `)
        .run();
    }
    setSuggestionQuery(null);
  };

  const renderContent = (contentHtml, openNote) => {
    if (!contentHtml) return null;
    
    // Safely parse Wiki Links from the TipTap HTML string and inject clickable data anchors, adding a line break as requested
    const parsedHtml = contentHtml.replace(
      /\[\[(.*?)\]\]/g, 
      '<br /><span class="wiki-link text-blue-600 cursor-pointer font-medium underline inline-block mt-1 hover:text-blue-800" data-target="$1">🔗 $1</span>'
    );

    return (
      <div 
        dangerouslySetInnerHTML={{ __html: parsedHtml }} 
        className="prose dark:prose-invert max-w-none focus:outline-none"
        onClick={(e) => {
          const target = e.target.closest('.wiki-link');
          if (target && openNote) {
            openNote(target.getAttribute('data-target'));
          }
        }}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: color }} className="p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col min-h-0">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 flex flex-col min-h-0">
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
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Theme Color</label>
           <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 inline-block">
               <CirclePicker
                 color={color}
                 onChangeComplete={(c) => setColor(c.hex)}
                 colors={["#ffffff", "#fef3c7", "#dcfce7", "#dbeafe", "#f3e8ff"]}
               />
           </div>
        </div>

        <div className="flex-1 flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center mb-1 shrink-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={() => setIsPreview(false)} 
                className={`px-3 py-1 text-xs rounded-md transition-colors ${!isPreview ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Edit Mode
              </button>
              <button 
                type="button" 
                onClick={() => setIsPreview(true)} 
                className={`px-3 py-1 text-xs rounded-md transition-colors ${isPreview ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                View Mode
              </button>
            </div>
          </div>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm overflow-hidden flex flex-col flex-1 min-h-0 outline-none focus:outline-none">
            {!isPreview && editor && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-1 rounded ${editor.isActive('bold') ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} font-bold w-8 h-8 flex items-center justify-center`}
                  title="Bold (B)"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-1 rounded ${editor.isActive('italic') ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} italic w-8 h-8 flex items-center justify-center`}
                  title="Italic (I)"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                  className={`p-1 rounded ${editor.isActive('highlight') ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} font-medium px-2 h-8 flex items-center justify-center bg-yellow-100 dark:bg-yellow-800/30`}
                  title="Highlight (H)"
                >
                  H
                </button>
                <div className="flex items-center ml-2 space-x-2 border-l border-gray-300 dark:border-gray-600 pl-2">
                  <label htmlFor="color-picker" className="text-xs text-gray-500 dark:text-gray-400">Color:</label>
                  <input
                    id="color-picker"
                    type="color"
                    onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                    title="Text Color"
                  />
                </div>
              </div>
            )}
            
            {isPreview ? (
               <div className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {renderContent(content, onWikiLinkClick)}
               </div>
            ) : (
               <div className="flex-1 w-full h-full cursor-text overflow-hidden flex flex-col outline-none focus:outline-none focus:ring-0" onClick={() => editor && !editor.isFocused && editor.chain().focus().run()}>
                 <EditorContent 
                   editor={editor} 
                   className="p-4 flex-1 overflow-y-auto w-full prose dark:prose-invert max-w-none outline-none focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white bg-transparent"
                 />
                 
                 {suggestionQuery !== null && suggestions.length > 0 && (
                   <div 
                     className="fixed z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg flex flex-col max-h-48 overflow-y-auto min-w-[200px]"
                     style={{ top: suggestionPos.top + 5, left: suggestionPos.left }}
                   >
                     {suggestions.map((note) => (
                       <button
                         key={note._id}
                         type="button"
                         onClick={() => insertWikiLink(note.title)}
                         className="px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/40 dark:text-gray-200 flex items-center gap-2"
                       >
                         <span className="w-2 h-2 rounded-full" style={{ backgroundColor: note.color || '#cbd5e1' }}></span>
                         {note.title}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
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
