'use client';

import { useState } from 'react';

interface Cycle {
  id: string;
  periodStartDate: string;
  periodEndDate: string | null;
  flowIntensity: string | null;
}

interface CycleCalendarProps {
  cycles: Cycle[];
  predictedNextPeriod?: string;
  onDateClick?: (date: Date) => void;
}

export default function CycleCalendar({ cycles, predictedNextPeriod, onDateClick }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isPeriodDay = (date: Date): { isPeriod: boolean; flowIntensity?: string } => {
    const dateStr = date.toISOString().split('T')[0];
    
    for (const cycle of cycles) {
      const startDate = new Date(cycle.periodStartDate);
      const endDate = cycle.periodEndDate ? new Date(cycle.periodEndDate) : startDate;
      
      // Normalize dates to compare just the date part
      const checkDate = new Date(dateStr);
      const start = new Date(startDate.toISOString().split('T')[0]);
      const end = new Date(endDate.toISOString().split('T')[0]);
      
      if (checkDate >= start && checkDate <= end) {
        return { isPeriod: true, flowIntensity: cycle.flowIntensity || undefined };
      }
    }
    return { isPeriod: false };
  };

  const isPredictedDay = (date: Date): boolean => {
    if (!predictedNextPeriod) return false;
    
    const predictedStart = new Date(predictedNextPeriod);
    const predictedEnd = new Date(predictedStart);
    predictedEnd.setDate(predictedEnd.getDate() + 5); // Assume 5-day period
    
    const checkDate = new Date(date.toISOString().split('T')[0]);
    const start = new Date(predictedStart.toISOString().split('T')[0]);
    const end = new Date(predictedEnd.toISOString().split('T')[0]);
    
    return checkDate >= start && checkDate <= end;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const { isPeriod, flowIntensity } = isPeriodDay(date);
      const isPredicted = isPredictedDay(date);
      const todayClass = isToday(date);

      let bgColor = 'bg-white hover:bg-gray-50';
      let textColor = 'text-gray-900';
      let borderClass = '';

      if (isPeriod) {
        // Different shades of pink based on flow intensity
        switch (flowIntensity) {
          case 'HEAVY':
            bgColor = 'bg-pink-500';
            textColor = 'text-white';
            break;
          case 'MODERATE':
            bgColor = 'bg-pink-400';
            textColor = 'text-white';
            break;
          case 'LIGHT':
            bgColor = 'bg-pink-300';
            textColor = 'text-gray-900';
            break;
          case 'SPOTTING':
            bgColor = 'bg-pink-200';
            textColor = 'text-gray-900';
            break;
          default:
            bgColor = 'bg-pink-400';
            textColor = 'text-white';
        }
      } else if (isPredicted) {
        bgColor = 'bg-purple-100';
        borderClass = 'border-2 border-dashed border-purple-400';
        textColor = 'text-purple-700';
      }

      if (todayClass && !isPeriod) {
        borderClass = 'ring-2 ring-pink-500 ring-offset-2';
      }

      days.push(
        <button
          key={day}
          onClick={() => onDateClick?.(date)}
          className={`h-10 w-full rounded-lg font-medium transition ${bgColor} ${textColor} ${borderClass}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Cycle Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-lg transition"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-pink-400"></div>
            <span className="text-gray-600">Period days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 border-2 border-dashed border-purple-400"></div>
            <span className="text-gray-600">Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white ring-2 ring-pink-500"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
