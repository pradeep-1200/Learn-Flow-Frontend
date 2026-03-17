import React, { useMemo } from 'react';

const LeetcodeHeatmap = ({ calendarData }) => {
  const { weeks, months } = useMemo(() => {
    if (!calendarData) return { weeks: [], months: [] };
    
    // Parse JSON
    let parsed = {};
    try {
      if (typeof calendarData === 'string') {
        parsed = JSON.parse(calendarData);
      } else {
        parsed = calendarData;
      }
    } catch (e) {
      console.error("Invalid calendarData", e);
    }
    
    // Convert to Date mapping
    const activityMap = new Map();
    Object.entries(parsed).forEach(([timestamp, count]) => {
      const ms = timestamp.length > 10 ? parseInt(timestamp) : parseInt(timestamp) * 1000;
      const dateString = new Date(ms).toISOString().split('T')[0];
      activityMap.set(dateString, count);
    });

    const weeksArr = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    const startOffset = startDate.getDay(); // 0 = Sunday, 1 = Monday
    const firstGridDate = new Date(startDate);
    firstGridDate.setDate(startDate.getDate() - startOffset);

    const monthLabels = [];
    let currentMonth = -1;
    let currentWeek = [];

    for (let i = 0; i < 53 * 7; i++) {
      const d = new Date(firstGridDate);
      d.setDate(firstGridDate.getDate() + i);
      
      const dateString = d.toISOString().split('T')[0];
      const colIndex = Math.floor(i / 7);
      
      // Month labels
      if (d.getDate() <= 7 && d.getDay() === 0 && d.getMonth() !== currentMonth) {
        currentMonth = d.getMonth();
        const monthName = d.toLocaleString('default', { month: 'short' });
        monthLabels.push({ name: monthName, colIndex });
      }

      let countValue = -1;
      let empty = true;
      if (d >= startDate && d <= today) {
         countValue = activityMap.get(dateString) || 0;
         empty = false;
      }

      currentWeek.push({
         date: dateString,
         count: countValue,
         isEmpty: empty
      });

      if (currentWeek.length === 7) {
         weeksArr.push(currentWeek);
         currentWeek = [];
      }
    }

    return { weeks: weeksArr, months: monthLabels };
  }, [calendarData]);

  const getColor = (count) => {
    if (count < 0) return 'transparent';
    if (count === 0) return '#ebedf0';
    if (count === 1) return '#9be9a8';
    if (count === 2) return '#40c463';
    if (count === 3) return '#30a14e';
    return '#216e39';
  };
  
  if (!weeks || weeks.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2">
      <div className="min-w-max flex flex-col">
        {/* Month labels */}
        <div className="flex h-6 text-xs text-gray-500 mb-1 ml-8 relative">
           {weeks.map((_, i) => {
             const month = months.find(m => m.colIndex === i);
             const isNewMonth = !!month;
             // Calculate the margin matching the weeks gap below
             const marginLeft = i === 0 ? '0' : (isNewMonth ? '12px' : '3px');
             return (
               <div key={`ml-${i}`} style={{ width: '12px', marginLeft, position: 'relative' }}>
                 {month && (
                    <span className="absolute top-0 left-0">{month.name}</span>
                 )}
               </div>
             );
           })}
        </div>
        
        <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pr-2 text-[10px] text-gray-400 font-medium w-8 justify-around pt-[2px]">
              <div className="h-[14px]"></div>
              <div className="h-[14px] leading-[14px]">Mon</div>
              <div className="h-[14px]"></div>
              <div className="h-[14px] leading-[14px]">Wed</div>
              <div className="h-[14px]"></div>
              <div className="h-[14px] leading-[14px]">Fri</div>
              <div className="h-[14px]"></div>
            </div>

            {/* Grid */}
            <div className="flex">
              {weeks.map((week, i) => {
                const isNewMonth = months.some(m => m.colIndex === i);
                const marginLeft = i === 0 ? '0' : (isNewMonth ? '12px' : '3px');
                
                return (
                  <div 
                    key={i} 
                    className="flex flex-col gap-[3px]"
                    style={{ marginLeft }}
                  >
                    {week.map((day, j) => (
                      <div 
                        key={j}
                        className="w-[12px] h-[12px] rounded-sm"
                        style={{ backgroundColor: getColor(day.count) }}
                        title={day.isEmpty ? '' : `${day.count} submissions on ${day.date}`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-end items-center space-x-2 mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-[3px]">
          <div className="w-[12px] h-[12px] rounded-sm" style={{ backgroundColor: '#ebedf0' }} />
          <div className="w-[12px] h-[12px] rounded-sm" style={{ backgroundColor: '#9be9a8' }} />
          <div className="w-[12px] h-[12px] rounded-sm" style={{ backgroundColor: '#40c463' }} />
          <div className="w-[12px] h-[12px] rounded-sm" style={{ backgroundColor: '#30a14e' }} />
          <div className="w-[12px] h-[12px] rounded-sm" style={{ backgroundColor: '#216e39' }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default LeetcodeHeatmap;
