"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type DayCell = {
  date: Date;
  inMonth: boolean;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const storageKey = "chrono-canvas-notes";
const monthlyHeroImages = [
  "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1517639493569-5666a7b2f494?auto=format&fit=crop&w=1400&q=80",
];

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarDays(baseDate: Date): DayCell[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
}

export default function WallCalendar() {
  const [viewDate, setViewDate] = useState(() => normalizeDate(new Date()));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return {};
    try {
      return JSON.parse(saved) as Record<string, string>;
    } catch {
      return {};
    }
  });
  const [notesMode, setNotesMode] = useState<"month" | "range">("month");

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(notesMap));
  }, [notesMap]);

  const monthLabel = useMemo(
    () =>
      viewDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [viewDate],
  );

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const heroImage = monthlyHeroImages[viewDate.getMonth()];

  const normalizedStart = startDate ? normalizeDate(startDate) : null;
  const normalizedEnd = endDate ? normalizeDate(endDate) : null;

  const selectedRangeLabel =
    normalizedStart && normalizedEnd
      ? `${normalizedStart.toLocaleDateString()} - ${normalizedEnd.toLocaleDateString()}`
      : normalizedStart
        ? `${normalizedStart.toLocaleDateString()} - ?`
        : "No range selected";

  const hasRange = Boolean(normalizedStart && normalizedEnd);
  const activeNoteKey =
    notesMode === "range" && normalizedStart && normalizedEnd
      ? `${toIsoDate(normalizedStart)}__${toIsoDate(normalizedEnd)}`
      : "month";

  const currentNote = notesMap[activeNoteKey] ?? "";

  function moveMonth(offset: number) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  function onDayClick(date: Date) {
    const selected = normalizeDate(date);

    if (!normalizedStart || (normalizedStart && normalizedEnd)) {
      setStartDate(selected);
      setEndDate(null);
      return;
    }

    if (selected < normalizedStart) {
      setEndDate(normalizedStart);
      setStartDate(selected);
    } else if (selected.getTime() === normalizedStart.getTime()) {
      setEndDate(selected);
    } else {
      setEndDate(selected);
    }
  }

  function getRangeState(date: Date) {
    if (!normalizedStart) return "none";
    if (isSameDay(date, normalizedStart)) return "start";
    if (normalizedEnd && isSameDay(date, normalizedEnd)) return "end";
    if (normalizedEnd && date > normalizedStart && date < normalizedEnd) return "middle";
    return "none";
  }

  function onNoteChange(value: string) {
    setNotesMap((prev) => ({ ...prev, [activeNoteKey]: value }));
  }

  return (
    <section className="mx-auto w-full max-w-6xl rounded-[2rem] border border-amber-100/80 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 p-4 shadow-[0_20px_60px_-20px_rgba(120,53,15,0.25)] backdrop-blur-sm md:p-6">
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-[1.5rem] border border-amber-100 bg-amber-50/60 shadow-sm">
          <div className="relative h-44 w-full sm:h-52">
            <Image
              src={heroImage}
              alt="Scenic hero for wall calendar"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="h-full w-full object-cover saturate-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          </div>

          <div className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => moveMonth(-1)}
                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50"
              >
                ← Prev
              </button>
              <h2 className="text-lg font-bold tracking-wide text-amber-950">{monthLabel}</h2>
              <button
                onClick={() => moveMonth(1)}
                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50"
              >
                Next →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 rounded-xl bg-amber-100/70 px-1.5 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">
              {weekDays.map((weekDay) => (
                <span key={weekDay}>{weekDay}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1.5 rounded-xl bg-gradient-to-b from-amber-50/80 to-white p-1.5">
              {days.map(({ date, inMonth }) => {
                const rangeState = getRangeState(date);
                const isToday = isSameDay(normalizeDate(new Date()), date);

                const baseClass =
                  "relative min-h-11 rounded-xl border text-sm transition-all duration-200 sm:min-h-12";
                const mutedClass = inMonth
                  ? "border-amber-100/60 bg-white text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-sm"
                  : "border-transparent bg-amber-100/30 text-amber-400";
                const rangeClass =
                  rangeState === "start" || rangeState === "end"
                    ? "border-rose-500 bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-md shadow-rose-200"
                    : rangeState === "middle"
                      ? "border-rose-100 bg-gradient-to-r from-rose-100 to-orange-100 text-rose-900"
                      : mutedClass;
                const todayRing =
                  isToday && rangeState === "none" ? "ring-2 ring-amber-300 ring-inset" : "";

                return (
                  <button
                    key={`${date.toISOString()}_${inMonth}`}
                    onClick={() => onDayClick(date)}
                    className={`${baseClass} ${rangeClass} ${todayRing}`}
                    aria-label={`Select ${date.toDateString()}`}
                  >
                    <span className="absolute left-2 top-1.5 text-xs font-semibold">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-amber-100 bg-gradient-to-b from-orange-50 via-amber-50/60 to-white p-4 shadow-sm">
          <h3 className="text-lg font-bold tracking-wide text-amber-950">Notes</h3>
          <p className="mt-1 text-sm text-amber-800">
            Save notes for this month or the selected date range.
          </p>

          <div className="mt-4 rounded-xl border border-amber-200 bg-white/95 p-3 text-sm shadow-sm">
            <p className="font-medium text-amber-900">Selected Range</p>
            <p className="mt-1 text-amber-700">{selectedRangeLabel}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <button
              onClick={() => setNotesMode("month")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                notesMode === "month"
                  ? "bg-amber-900 text-white shadow"
                  : "border border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
              }`}
            >
              Monthly Memo
            </button>
            <button
              onClick={() => hasRange && setNotesMode("range")}
              disabled={!hasRange}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                notesMode === "range"
                  ? "bg-amber-900 text-white shadow"
                  : "border border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Range Memo
            </button>
          </div>

          <textarea
            value={currentNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Write reminders, ideas, or tasks..."
            className="mt-4 h-48 w-full resize-none rounded-2xl border border-amber-200 bg-white p-3 text-sm leading-relaxed text-zinc-800 outline-none ring-0 placeholder:text-amber-400 focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.2)] md:h-64"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-amber-700">
            <span>Autosaved locally</span>
            <button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setNotesMode("month");
              }}
              className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-amber-900 transition hover:-translate-y-0.5 hover:bg-amber-50"
            >
              Clear Range
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
