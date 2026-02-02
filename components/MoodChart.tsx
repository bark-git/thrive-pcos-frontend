'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type MoodEntry } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface MoodChartProps {
  entries: MoodEntry[];
}

export default function MoodChart({ entries }: MoodChartProps) {
  const data = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: format(parseISO(entry.date), 'MMM d'),
      mood: entry.moodScore,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#9CA3AF"
        />
        <YAxis 
          domain={[1, 5]} 
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 12 }}
          stroke="#9CA3AF"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="mood" 
          stroke="#db2877" 
          strokeWidth={3}
          dot={{ fill: '#db2877', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
