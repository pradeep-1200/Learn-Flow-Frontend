import React, { useMemo } from 'react';

const LeetcodeHeatmap = ({ submissionCalendar }) => {
  const heatmapData = useMemo(() => {
    if (!submissionCalendar) return [];
    
    // The submissionCalendar is a JSON string or object mapping timestamps (seconds) to counts
    const activityMap = new Map();
    
    // Handle both string and parsed object
    const calendarData = typeof submissionCalendar === 'string' 
        ? JSON.parse(submissionCalendar || '{}') 
        : submissionCalendar;

    Object.entries(calendarData).forEach(([timestamp, count]) => {
      // timestamp is in seconds, convert to milliseconds
      const date = new Date(parseInt(timestamp) * 1000);
      const dateString = date.toISOString().split('T')[0];
      activityMap.set(dateString, count);
    });

    // Generate array for the last 365 days
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // past 1 year

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      days.push({
        date: dateString,
        count: activityMap.get(dateString) || 0
      });
    }

    return days;
  }, [submissionCalendar]);

  const weeks = useMemo(() => {
    const weeksArray = [];
    if (heatmapData.length === 0) return weeksArray;

    let currentWeek = [];
    
    // The first day's day-of-week determines where we start the first column
    const startDayOfWeek = new Date(heatmapData[0].date).getDay();
    
    // Pad the start of the first week so Sunday starts at index 0
    for (let i = 0; i < startDayOfWeek; i++) {
        currentWeek.push(null);
    }

    heatmapData.forEach((dayData) => {
        currentWeek.push(dayData);
        if (currentWeek.length === 7) {
            weeksArray.push(currentWeek);
            currentWeek = [];
        }
    });

    // Pad the end of the last week if necessary
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, [heatmapData]);

  const getColorClass = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'; // white/gray
    if (count === 1) return 'bg-green-200 dark:bg-green-800'; // light green
    if (count === 2) return 'bg-green-400 dark:bg-green-600'; // medium green
    if (count >= 3) return 'bg-green-600 dark:bg-green-500'; // dark green
    return 'bg-gray-100 dark:bg-gray-800';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex min-w-max items-end">
        {/* Day of week labels */}
        <div className="flex flex-col gap-1 pr-2 pt-5">
           {dayLabels.map((day, i) => (
               <div key={day} className={`h-3 text-[10px] leading-[12px] text-gray-400 font-medium ${i % 2 === 0 ? 'invisible' : 'visible'}`}>
                   {day}
               </div>
           ))}
        </div>
        
        {/* Grid */}
        <div className="flex gap-1 pt-5">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((day, dIndex) => (
                <div 
                  key={`${wIndex}-${dIndex}`}
                  className={`w-3 h-3 rounded-sm transition-colors duration-200 ${day ? getColorClass(day.count) : 'bg-transparent'}`}
                  title={day ? `${day.count} submissions on ${day.date}` : ''}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-end items-center space-x-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default LeetcodeHeatmap;
