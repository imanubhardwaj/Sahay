"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: string; // YYYY-MM-DD format
}

export function Calendar({
  selectedDate,
  onDateSelect,
  minDate,
}: CalendarProps) {
  const today = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);
  today.setHours(0, 0, 0, 0);

  // Initialize currentMonth from selectedDate or today
  const getInitialMonth = useMemo(() => {
    if (selectedDate) {
      const date = new Date(selectedDate + "T00:00:00");
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [selectedDate, today]);

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth);

  // Update currentMonth when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate + "T00:00:00");
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [selectedDate]);

  const minDateObj = useMemo(() => {
    return minDate ? new Date(minDate + "T00:00:00") : today;
  }, [minDate, today]);
  minDateObj.setHours(0, 0, 0, 0);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  }, []);

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const isDateDisabled = useCallback(
    (day: number) => {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      return date < minDateObj;
    },
    [minDateObj, year, month]
  );

  const isDateSelected = useCallback(
    (day: number) => {
      if (!selectedDate) return false;
      // Create date string in YYYY-MM-DD format for comparison
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      return dateStr === selectedDate;
    },
    [selectedDate, year, month]
  );

  const isToday = useCallback(
    (day: number) => {
      return (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      );
    },
    [month, today, year]
  );

  const handleDateClick = useCallback(
    (day: number) => {
      if (isDateDisabled(day)) return;

      // Create date string in YYYY-MM-DD format
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      onDateSelect(dateString);
    },
    [year, month, onDateSelect, isDateDisabled]
  );

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(year, month - 1, 1));
  }, [year, month]);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(year, month + 1, 1));
  }, [year, month]);

  const canGoPrevious = useCallback(() => {
    const prevMonth = new Date(year, month - 1, 1);
    return (
      prevMonth >= new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1)
    );
  }, [year, month, minDateObj]);

  const renderCalendarDays = useCallback(() => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      const todayCheck = isToday(day);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={disabled}
          className={`
            aspect-square rounded-lg transition-all
            ${
              disabled
                ? "text-gray-300 cursor-not-allowed bg-gray-50"
                : selected
                ? "bg-purple-600 text-white font-semibold shadow-md scale-105"
                : todayCheck
                ? "bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200"
                : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200"
            }
            ${!disabled && !selected ? "hover:scale-105" : ""}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  }, [
    startingDayOfWeek,
    daysInMonth,
    isDateDisabled,
    isDateSelected,
    isToday,
    handleDateClick,
  ]);

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious()}
          className={`
            p-2 rounded-lg transition-colors cursor-pointer
            ${
              canGoPrevious()
                ? "hover:bg-gray-100 text-gray-700"
                : "text-gray-300 cursor-not-allowed"
            }
          `}
        >
          <FaChevronLeft />
        </button>
        <h3 className="text-lg font-semibold text-white">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-600"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200"></div>
          <span className="text-gray-600">Available</span>
        </div>
      </div>
    </div>
  );
}
