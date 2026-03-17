import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const CourseSkillRadar = ({ course }) => {
  // Try to generate meaningful radar data
  // Since we only have 'skills' array (e.g. ["React", "JavaScript"]), 
  // we'll assign an artificial score based on progress to show in radar
  const progressPercent = (course.completedModules / course.totalModules) || 0;
  
  const data = (course.skills || []).map(skill => ({
    subject: skill,
    A: progressPercent * 100 + (Math.random() * 20 - 10), // slight variation for visuals
    fullMark: 100,
  }));

  // If less than 3 skills, radar chart looks broken, let's pad it
  if (data.length < 3) {
      data.push({ subject: 'Fundamentals', A: progressPercent * 90, fullMark: 100 });
      if (data.length < 3) data.push({ subject: 'Concepts', A: progressPercent * 85, fullMark: 100 });
      if (data.length < 3) data.push({ subject: 'Practice', A: progressPercent * 95, fullMark: 100 });
  }

  return (
    <div className="w-full h-48 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b5cf6', fontSize: 10 }} />
          <Radar name={course.title} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CourseSkillRadar;
