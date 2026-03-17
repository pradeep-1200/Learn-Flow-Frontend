import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const PRIORITY_CONFIG = {
  High:   { bg: '#ef4444', light: '#fef2f2', text: '#b91c1c', label: '🔴 High'   },
  Medium: { bg: '#f59e0b', light: '#fffbeb', text: '#b45309', label: '🟡 Medium' },
  Low:    { bg: '#22c55e', light: '#f0fdf4', text: '#15803d', label: '🟢 Low'    },
};

// ---- Custom Toolbar (computes new Date itself — never passes strings to setDate) ----
const CustomToolbar = ({ date, view, onNavigate, onView }) => {
  const viewLabel = {
    [Views.MONTH]: format(date, 'MMMM yyyy'),
    [Views.WEEK]:  `Week of ${format(date, 'MMM d, yyyy')}`,
    [Views.DAY]:   format(date, 'EEEE, MMMM d, yyyy'),
  }[view] ?? format(date, 'MMMM yyyy');

  const goToday = () => onNavigate(new Date());

  const goPrev = () => {
    if (view === Views.MONTH) onNavigate(subMonths(date, 1));
    else if (view === Views.WEEK) onNavigate(subWeeks(date, 1));
    else onNavigate(subDays(date, 1));
  };

  const goNext = () => {
    if (view === Views.MONTH) onNavigate(addMonths(date, 1));
    else if (view === Views.WEEK) onNavigate(addWeeks(date, 1));
    else onNavigate(addDays(date, 1));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToday}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800"
        >
          Today
        </button>
        <button
          onClick={goPrev}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Previous"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          onClick={goNext}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Next"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <span className="text-base font-bold text-gray-800 dark:text-gray-100 ml-2">
          {viewLabel}
        </span>
      </div>

      {/* View Switcher */}
      <div className="bg-gray-100 dark:bg-gray-700/60 p-1 rounded-lg flex gap-1">
        {[
          { key: Views.MONTH, label: 'Month' },
          { key: Views.WEEK,  label: 'Week'  },
          { key: Views.DAY,   label: 'Day'   },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onView(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === key
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ---- Task Detail Popup ----
const TaskDetailPanel = ({ task, onClose, onEdit }) => {
  if (!task) return null;
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'No deadline';
  const completedSubs = (task.subtasks ?? []).filter(s => s.completed).length;
  const totalSubs = (task.subtasks ?? []).length;

  return (
    <div className="absolute top-4 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: p.light, color: p.text }}>
            {p.label}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
            {task.category || 'General'}
          </span>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
            task.status === 'Completed' ? 'bg-green-100 text-green-700'
            : task.status === 'In Progress' ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'}`}>
            {task.status}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {deadline}
        </div>

        {totalSubs > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Subtasks ({completedSubs}/{totalSubs})
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={() => { onClose(); onEdit(task); }}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Open &amp; Edit Task →
        </button>
      </div>
    </div>
  );
};

// ---- Priority Legend ----
const PriorityLegend = () => (
  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority:</span>
    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
      <div key={key} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: cfg.text }}>
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cfg.bg }}/>
        {key}
      </div>
    ))}
  </div>
);

// ---- Main CalendarView ----
const CalendarView = ({ tasks, onEdit }) => {
  const [date, setDate]             = useState(new Date());
  const [view, setView]             = useState(Views.MONTH);
  const [selectedTask, setSelectedTask] = useState(null);

  // The Calendar's own onNavigate gives us a real Date — just pass setDate directly
  const handleNavigate = useCallback((newDate) => setDate(newDate), []);
  const handleView     = useCallback((newView)  => setView(newView),  []);

  const events = (tasks ?? [])
    .filter(t => t.deadline)
    .map(t => ({
      title:    t.title,
      start:    new Date(t.deadline),
      end:      new Date(t.deadline),
      allDay:   true,
      priority: t.priority,
      resource: t,
    }));

  return (
    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <style>{`
        .rbc-toolbar { display: none; }
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 8px 4px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: transparent; }
        .rbc-month-view, .rbc-time-view { border: none; border-radius: 8px; overflow: hidden; }
        .rbc-event { border-radius: 6px !important; padding: 2px 6px !important; font-size: 0.72rem !important; font-weight: 600 !important; border: none !important; box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important; }
        .rbc-event.rbc-selected { box-shadow: 0 0 0 3px rgba(99,102,241,0.45) !important; }
        .rbc-today { background: rgba(99,102,241,0.06) !important; }
        .rbc-off-range-bg { background: transparent; opacity: 0.4; }
        .rbc-show-more { font-size: 0.72rem; font-weight: 600; color: #6366f1; }
      `}</style>

      {/* Custom toolbar — passes actual Date objects, never strings */}
      <CustomToolbar
        date={date}
        view={view}
        onNavigate={handleNavigate}
        onView={handleView}
      />

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 580 }}
        /* Controlled props — MUST be provided together */
        date={date}
        view={view}
        onNavigate={handleNavigate}
        onView={handleView}
        /* Interaction */
        onSelectEvent={(event) => setSelectedTask(event.resource)}
        onSelectSlot={() => setSelectedTask(null)}
        selectable
        popup
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        eventPropGetter={(event) => {
          const cfg = PRIORITY_CONFIG[event.priority] ?? { bg: '#4f46e5' };
          return { style: { backgroundColor: cfg.bg, color: '#fff' } };
        }}
        dayPropGetter={(d) => {
          const t = new Date();
          if (d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()) {
            return { style: { background: 'rgba(99,102,241,0.06)' } };
          }
          return {};
        }}
      />

      <PriorityLegend />

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={(t) => { setSelectedTask(null); onEdit(t); }}
        />
      )}
    </div>
  );
};

export default CalendarView;
