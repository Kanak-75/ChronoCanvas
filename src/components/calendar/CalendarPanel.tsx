"use client";

import { format } from "date-fns";
import CalendarGrid from "./CalendarGrid";

type CalendarPanelProps = {
  monthDate: Date;
  startDate: Date | null;
  endDate: Date | null;
  dark: boolean;
  isAnimating: boolean;
  onPrev: () => void;
  onNext: () => void;
  onDateClick: (date: Date) => void;
  onClearRange: () => void;
};

export default function CalendarPanel(props: CalendarPanelProps) {
  const { monthDate, startDate, endDate, dark, isAnimating, onPrev, onNext, onDateClick, onClearRange } = props;

  return (
    <div className={`rounded-md p-4 ${dark ? "bg-[#0d0d0d]" : "bg-[#fff9ec]"}`}>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={isAnimating}
          className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
            dark
              ? "border-[#9f7a1f] text-[#f3dca2] hover:bg-[#2a210f]"
              : "border-[#c59a2a] text-[#5a410f] hover:bg-[#f5e5b8]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Previous Month
        </button>
        <h2 className={`text-sm font-bold tracking-wide ${dark ? "text-[#f3dca2]" : "text-[#5a410f]"}`}>
          {format(monthDate, "LLLL yyyy")}
        </h2>
        <button
          onClick={onNext}
          disabled={isAnimating}
          className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
            dark
              ? "border-[#9f7a1f] text-[#f3dca2] hover:bg-[#2a210f]"
              : "border-[#c59a2a] text-[#5a410f] hover:bg-[#f5e5b8]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Next Month
        </button>
      </div>

      <CalendarGrid
        monthDate={monthDate}
        startDate={startDate}
        endDate={endDate}
        onDateClick={onDateClick}
        dark={dark}
      />

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={onClearRange}
          className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
            dark
              ? "border-[#9f7a1f] text-[#f3dca2] hover:bg-[#2a210f]"
              : "border-[#c59a2a] text-[#5a410f] hover:bg-[#f5e5b8]"
          }`}
        >
          Clear Range
        </button>
      </div>
    </div>
  );
}

