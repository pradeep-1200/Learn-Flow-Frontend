import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

// 1. Sortable task item
function SortableTask({ task, onUpdateStatus, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4">
      {/* Passing a wrapper to make the entire card a drag handle */}
      <div className="pointer-events-none">
        <TaskCard 
          task={task} 
          onUpdateStatus={onUpdateStatus} 
          onDelete={onDelete} 
          onEdit={onEdit} 
          compact={true}
        />
      </div>
    </div>
  );
}

// 2. Droppable column
import { useDroppable } from '@dnd-kit/core';

function KanbanColumn({ title, tasks, onUpdateStatus, onDelete, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: {
      type: 'Column',
      columnTitle: title
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border ${isOver ? 'border-indigo-500' : 'border-gray-100 dark:border-gray-700'} w-80 min-w-[320px] max-w-[320px] flex flex-col flex-nowrap transition-colors`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h2>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTask 
              key={task._id} 
              task={task} 
              onUpdateStatus={onUpdateStatus} 
              onDelete={onDelete} 
              onEdit={onEdit} 
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Main Board
const KanbanBoard = ({ tasks, onUpdateStatus, onDelete, onEdit }) => {
  const [columns, setColumns] = useState({
      'To Do': [],
      'In Progress': [],
      'Review': [],
      'Completed': []
  });

  useEffect(() => {
    const cols = {
      'To Do': [],
      'In Progress': [],
      'Review': [],
      'Completed': []
    };
    tasks.forEach(task => {
      const status = task.status;
      if (cols[status]) {
        cols[status].push(task);
      } else {
        cols['To Do'].push(task);
      }
    });
    setColumns(cols);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find source column and task
    let sourceCol = null;
    let destCol = null;
    for (const [col, colTasks] of Object.entries(columns)) {
      if (colTasks.find(t => t._id === activeId)) sourceCol = col;
      if (colTasks.find(t => t._id === overId)) destCol = col;
      if (over.data.current?.type === 'Column' && over.data.current?.columnTitle === col) {
          destCol = col;
      }
    }

    if (sourceCol && destCol && sourceCol !== destCol) {
        // Moved to another column, trigger the backend call and optimistic update
        const updatedTasks = { ...columns };
        const taskToMove = updatedTasks[sourceCol].find(t => t._id === activeId);
        
        // optimistic
        updatedTasks[sourceCol] = updatedTasks[sourceCol].filter(t => t._id !== activeId);
        taskToMove.status = destCol;
        updatedTasks[destCol] = [taskToMove, ...updatedTasks[destCol]];
        
        setColumns(updatedTasks);

        // Call parent to persist API
        onUpdateStatus(activeId, destCol);
    }
  };

  const columnsList = ['To Do', 'In Progress', 'Review', 'Completed'];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-200px)] min-h-[600px] items-stretch">
        {columnsList.map(title => (
          <KanbanColumn 
            key={title} 
            title={title} 
            tasks={columns[title] || []} 
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
