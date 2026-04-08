"use client";

import {
  addDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

type CalendarGridProps = {
  monthDate: Date;
  startDate: Date | null;
  endDate: Date | null;
  onDateClick: (date: Date) => void;
  dark: boolean;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDays(monthDate: Date) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const startDay = startOfWeek(monthStart, { weekStartsOn: 0 });
  const total = 42;

  return Array.from({ length: total }, (_, idx) => addDays(startDay, idx)).filter(
    (date) => isBefore(date, addDays(monthEnd, 8)) || isSameMonth(date, monthDate),
  );
}

export default function CalendarGrid({
  monthDate,
  startDate,
  endDate,
  onDateClick,
  dark,
}: CalendarGridProps) {
  const days = buildDays(monthDate);

  return (
    <div>
      <div
        className={`grid grid-cols-7 gap-y-2 text-center text-[10px] font-bold uppercase ${
          dark ? "text-[#dfbe72]" : "text-[#8e6a1d]"
        }`}
      >
        {weekDays.map((weekDay) => (
          <span key={weekDay}>{weekDay}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
        {days.map((date) => {
          const inMonth = isSameMonth(date, monthDate);
          const isToday = isSameDay(date, new Date());
          const isStart = Boolean(startDate && isSameDay(date, startDate));
          const isEnd = Boolean(endDate && isSameDay(date, endDate));
          const inRange = Boolean(
            startDate &&
              endDate &&
              isAfter(date, startDate) &&
              isBefore(date, endDate) &&
              !isStart &&
              !isEnd,
          );

          const baseClass =
            "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold shadow-[inset_0_1px_0_rgba(255,221,150,0.1)] transition sm:h-8 sm:w-8 sm:text-xs";
          const neutralClass = inMonth
            ? dark
              ? "text-[#e7c46a] hover:bg-[#2a1f0f] hover:shadow-[0_8px_16px_-12px_rgba(0,0,0,0.9)]"
              : "text-[#6b4f19] hover:bg-[#f1deb5] hover:shadow-[0_8px_16px_-12px_rgba(0,0,0,0.45)]"
            : dark
              ? "text-[#8f7a48]"
              : "text-[#b99b52]";

          const rangeClass = isStart || isEnd
            ? "bg-[#c59a2a] text-[#170f12] shadow-[0_10px_18px_-12px_rgba(0,0,0,0.9)]"
            : inRange
              ? "bg-[#e8cf8f] text-[#2a191e] shadow-[0_8px_14px_-12px_rgba(0,0,0,0.7)]"
              : neutralClass;

          const todayClass = isToday && !isStart && !isEnd ? "ring-2 ring-[#c59a2a]" : "";

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              aria-label={`Select ${format(date, "PPP")}`}
              className={`${baseClass} ${rangeClass} ${todayClass}`}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
