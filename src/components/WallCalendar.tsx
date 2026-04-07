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
  {
    src: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80",
    theme: "Tech Hero",
  },
  {
    src: "https://images.unsplash.com/photo-1595433562696-a51b5e0f0fd7?auto=format&fit=crop&w=1600&q=80",
    theme: "Anime Spirit Hero",
  },
  {
    src: "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?auto=format&fit=crop&w=1600&q=80",
    theme: "City Night Hero",
  },
  {
    src: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80",
    theme: "Battle Ready",
  },
  {
    src: "https://images.unsplash.com/photo-1571019613576-2b22c76fd955?auto=format&fit=crop&w=1600&q=80",
    theme: "Training Arc",
  },
  {
    src: "https://images.unsplash.com/photo-1521805103422-74e3f0f4b56f?auto=format&fit=crop&w=1600&q=80",
    theme: "Street Guardian",
  },
  {
    src: "https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=1600&q=80",
    theme: "Action Squad",
  },
  {
    src: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1600&q=80",
    theme: "Power Pose",
  },
  {
    src: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1600&q=80",
    theme: "Masked Hero",
  },
  {
    src: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=1600&q=80",
    theme: "Legendary Warrior",
  },
  {
    src: "https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=1600&q=80",
    theme: "Mount Everest Climber",
  },
  {
    src: "https://images.unsplash.com/photo-1594736797933-d0af9e44e80f?auto=format&fit=crop&w=1600&q=80",
    theme: "Final Boss Energy",
  },
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
  const [isDark, setIsDark] = useState(false);
  const [flipClass, setFlipClass] = useState("");

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
    setFlipClass(offset > 0 ? "calendar-flip-next" : "calendar-flip-prev");
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    window.setTimeout(() => setFlipClass(""), 550);
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

  const themeClass = isDark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900";
  const sheetClass = isDark ? "bg-zinc-800" : "bg-[#e7e7ea]";

  return (
    <section className="mx-auto w-full max-w-5xl px-2 pb-6 pt-1">
      <div className={`relative rounded-b-[2rem] rounded-t-3xl px-3 pb-8 pt-5 shadow-[0_28px_70px_-30px_rgba(15,23,42,0.6)] sm:px-6 ${sheetClass}`}>
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className={`absolute -right-3 top-1/2 z-40 -translate-y-1/2 rotate-[-90deg] rounded-t-lg rounded-b-none px-3 py-1 text-xs font-semibold shadow-md transition sm:-right-5 ${
            isDark
              ? "bg-amber-200 text-zinc-900 hover:bg-amber-100"
              : "bg-zinc-900 text-white hover:bg-zinc-700"
          }`}
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <div className="pointer-events-none absolute left-1/2 top-1 z-30 flex -translate-x-1/2 gap-2">
          {Array.from({ length: 28 }, (_, idx) => (
            <span key={`ring-${idx}`} className="h-3 w-1 rounded-full bg-zinc-700/70" />
          ))}
        </div>

        <div className={`overflow-hidden rounded-md shadow-[0_25px_50px_-30px_rgba(0,0,0,0.6)] ${themeClass}`}>
          <div className={`relative h-72 w-full sm:h-[24rem] ${flipClass}`}>
            <div key={heroImage.src} className="h-full w-full animate-[fadeZoom_650ms_ease]">
              <Image
                src={heroImage.src}
                alt={heroImage.theme}
                fill
                sizes="(max-width: 768px) 100vw, 70vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

            <div
              className="absolute -bottom-0.5 left-0 h-24 w-[58%] bg-[#25a9ed]"
              style={{ clipPath: "polygon(0 28%, 100% 100%, 0 100%)" }}
            />
            <div
              className="absolute -bottom-0.5 right-0 h-24 w-[47%] bg-[#1f9be0]"
              style={{ clipPath: "polygon(0 100%, 100% 28%, 100% 100%)" }}
            />

            <div className="absolute bottom-5 right-6 text-right text-white">
              <p className="text-sm font-medium opacity-95">{viewDate.getFullYear()}</p>
              <p className="text-3xl font-extrabold leading-none uppercase tracking-wide">
                {viewDate.toLocaleDateString("en-US", { month: "long" })}
              </p>
              <p className="mt-1 text-xs font-medium tracking-wider text-white/90">{heroImage.theme}</p>
            </div>
          </div>

          <div className={`grid gap-4 px-4 pb-6 pt-4 sm:grid-cols-[1.15fr_1fr] sm:px-6 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => moveMonth(-1)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold hover:bg-zinc-100 ${isDark ? "border-zinc-600 text-zinc-100 hover:bg-zinc-700" : "border-zinc-300 text-zinc-700"}`}
                >
                  Prev
                </button>
                <h2 className={`text-sm font-bold tracking-wide ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>{monthLabel}</h2>
                <button
                  onClick={() => moveMonth(1)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold hover:bg-zinc-100 ${isDark ? "border-zinc-600 text-zinc-100 hover:bg-zinc-700" : "border-zinc-300 text-zinc-700"}`}
                >
                  Next
                </button>
              </div>

              <div className={`grid grid-cols-7 gap-y-2 text-center text-[10px] font-bold uppercase ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                {weekDays.map((weekDay) => (
                  <span key={weekDay}>{weekDay}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
                {days.map(({ date, inMonth }) => {
                  const rangeState = getRangeState(date);
                  const isToday = isSameDay(normalizeDate(new Date()), date);
                  const baseClass =
                    "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition";
                  const inactiveClass = inMonth
                    ? isDark
                      ? "text-zinc-100 hover:bg-zinc-700"
                      : "text-zinc-700 hover:bg-zinc-100"
                    : "text-zinc-400";
                  const rangeClass =
                    rangeState === "start" || rangeState === "end"
                      ? "bg-sky-500 text-white"
                      : rangeState === "middle"
                        ? "bg-sky-100 text-sky-700"
                        : inactiveClass;
                  const todayClass = isToday && rangeState === "none" ? "ring-2 ring-sky-300" : "";

                  return (
                    <button
                      key={`${date.toISOString()}_${inMonth}`}
                      onClick={() => onDayClick(date)}
                      aria-label={`Select ${date.toDateString()}`}
                      className={`${baseClass} ${rangeClass} ${todayClass}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-end">
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setNotesMode("month");
                  }}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${isDark ? "border-zinc-600 text-zinc-200 hover:bg-zinc-700" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100"}`}
                >
                  Clear Range
                </button>
              </div>
            </div>

            <aside>
              <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Notes</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <button
                  onClick={() => setNotesMode("month")}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    notesMode === "month"
                      ? "border-sky-500 bg-sky-500 text-white"
                      : isDark
                        ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                        : "border-zinc-300 bg-white text-zinc-700"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => hasRange && setNotesMode("range")}
                  disabled={!hasRange}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    notesMode === "range"
                      ? "border-sky-500 bg-sky-500 text-white"
                      : isDark
                        ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                        : "border-zinc-300 bg-white text-zinc-700"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Range
                </button>
              </div>
              <textarea
                value={currentNote}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Write your notes..."
                className={`mt-3 h-36 w-full resize-none rounded-sm border-none p-2 text-sm leading-6 outline-none ${
                  isDark
                    ? "bg-zinc-800 text-zinc-200"
                    : "bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_23px,#d4d4d8_24px)] text-zinc-700"
                }`}
              />
              <p className={`mt-2 text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{selectedRangeLabel}</p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
