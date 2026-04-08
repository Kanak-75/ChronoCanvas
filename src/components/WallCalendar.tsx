"use client";

import { addMonths, format, isBefore, isSameDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import FlipContainer from "./calendar/FlipContainer";
import { monthThemes } from "./calendar/monthThemes";

const storageKey = "chrono-canvas-notes";

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export default function WallCalendar() {
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [pendingMonth, setPendingMonth] = useState<Date | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
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
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(notesMap));
  }, [notesMap]);

  const normalizedStart = startDate ? startOfDay(startDate) : null;
  const normalizedEnd = endDate ? startOfDay(endDate) : null;

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

  function playFlipSound() {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.1);
    void ctx.close();
  }

  function moveMonth(offset: number) {
    if (isAnimating) return;
    setDirection(offset > 0 ? "next" : "prev");
    setPendingMonth(addMonths(viewDate, offset));
    setIsAnimating(true);
    playFlipSound();
  }
  function onFlipComplete() {
    if (!pendingMonth) return;
    setViewDate(pendingMonth);
    setPendingMonth(null);
    setIsAnimating(false);
  }

  function getThemeForMonth(date: Date) {
    return monthThemes[date.getMonth()];
  }


  function onDayClick(date: Date) {
    const selected = startOfDay(date);

    if (!normalizedStart || (normalizedStart && normalizedEnd)) {
      setStartDate(selected);
      setEndDate(null);
      return;
    }

    if (isBefore(selected, normalizedStart)) {
      setEndDate(normalizedStart);
      setStartDate(selected);
    } else if (isSameDay(selected, normalizedStart)) {
      setEndDate(selected);
    } else {
      setEndDate(selected);
    }
  }

  function onNoteChange(value: string) {
    setNotesMap((prev) => ({ ...prev, [activeNoteKey]: value }));
  }

  const themeClass = isDark ? "bg-[#0e0b0d] text-[#e7c46a]" : "bg-[#fff8eb] text-[#5f4412]";
  const sheetClass = isDark ? "bg-[#171215]" : "bg-[#efe5cf]";

  return (
    <section className="mx-auto w-full max-w-[min(96vw,1080px)] px-2 pb-4 pt-1 sm:pb-6">
      <div className={`relative rounded-b-[1.5rem] rounded-t-[1.25rem] border border-[#332712] px-2.5 pb-6 pt-4 shadow-[0_32px_80px_-26px_rgba(0,0,0,0.75)] sm:rounded-b-[2rem] sm:rounded-t-3xl sm:px-4 sm:pb-8 sm:pt-5 md:px-6 ${sheetClass}`}>
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className={`absolute -right-2 top-1/2 z-40 -translate-y-1/2 rotate-[-90deg] rounded-t-lg rounded-b-none px-2.5 py-1 text-[10px] font-semibold shadow-md transition sm:-right-4 sm:px-3 sm:text-xs ${
            isDark
              ? "bg-[#2a1f0f] text-[#e7c46a] hover:bg-[#3a2b16]"
              : "bg-[#f5e6c6] text-[#6b4f19] hover:bg-[#edd7a6]"
          }`}
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <div className="pointer-events-none absolute left-1/2 top-1 z-30 flex -translate-x-1/2 gap-2">
          {Array.from({ length: 28 }, (_, idx) => (
            <span key={`ring-${idx}`} className="h-3 w-1 rounded-full bg-zinc-700/70" />
          ))}
        </div>

        <div className={themeClass}>
          <div className={`mb-3 flex items-center justify-between rounded-xl border px-2 py-2 shadow-[inset_0_1px_0_rgba(255,221,150,0.08),0_10px_24px_-16px_rgba(0,0,0,0.8)] sm:mb-4 sm:px-3 ${isDark ? "border-[#3a2b16] bg-[#120e09] text-[#e7c46a]" : "border-[#d8bf8d] bg-[#fff4dc] text-[#5f4412]"}`}>
            <button
              onClick={() => moveMonth(-1)}
              disabled={isAnimating}
              className={`rounded-md border px-2 py-1 text-[10px] font-semibold shadow-[0_6px_16px_-10px_rgba(0,0,0,0.8)] transition-transform hover:-translate-y-0.5 sm:px-2.5 sm:text-xs ${
                isDark
                  ? "border-[#c59a2a] text-[#e7c46a] hover:bg-[#2a1f0f]"
                  : "border-[#b68a2b] text-[#6b4f19] hover:bg-[#f1deb5]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Previous Month
            </button>
            <h2 className="text-xs font-bold tracking-[0.08em] drop-shadow-[0_1px_0_rgba(0,0,0,0.9)] sm:text-sm">{format(viewDate, "LLLL yyyy")}</h2>
            <button
              onClick={() => moveMonth(1)}
              disabled={isAnimating}
              className={`rounded-md border px-2 py-1 text-[10px] font-semibold shadow-[0_6px_16px_-10px_rgba(0,0,0,0.8)] transition-transform hover:-translate-y-0.5 sm:px-2.5 sm:text-xs ${
                isDark
                  ? "border-[#c59a2a] text-[#e7c46a] hover:bg-[#2a1f0f]"
                  : "border-[#b68a2b] text-[#6b4f19] hover:bg-[#f1deb5]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Next Month
            </button>
          </div>

          <FlipContainer
            currentMonth={viewDate}
            pendingMonth={pendingMonth}
            direction={direction}
            startDate={normalizedStart}
            endDate={normalizedEnd}
            onDateClick={onDayClick}
            dark={isDark}
            getThemeForMonth={getThemeForMonth}
            onFlipComplete={onFlipComplete}
          />

          <div className={`mt-4 rounded-xl border p-3 shadow-[inset_0_1px_0_rgba(255,221,150,0.08),0_16px_34px_-24px_rgba(0,0,0,0.88)] sm:mt-5 sm:p-4 ${isDark ? "border-[#3a2b16] bg-[#0e0b0d]" : "border-[#d8bf8d] bg-[#fff4dc]"}`}>
            <aside>
              <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isDark ? "text-[#dfbe72]" : "text-[#8e6a1d]"}`}>Notes</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <button
                  onClick={() => setNotesMode("month")}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_8px_18px_-14px_rgba(0,0,0,0.9)] transition ${
                    notesMode === "month"
                      ? "border-[#c59a2a] bg-[#c59a2a] text-[#170f12]"
                      : isDark
                        ? "border-[#c59a2a] bg-[#241b0e] text-[#e7c46a]"
                        : "border-[#c59a2a] bg-[#fff8eb] text-[#6b4f19]"
                  }`}
                >
                  Month Note
                </button>
                <button
                  onClick={() => hasRange && setNotesMode("range")}
                  disabled={!hasRange}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_8px_18px_-14px_rgba(0,0,0,0.9)] transition ${
                    notesMode === "range"
                      ? "border-[#c59a2a] bg-[#c59a2a] text-[#170f12]"
                      : isDark
                        ? "border-[#c59a2a] bg-[#241b0e] text-[#e7c46a]"
                        : "border-[#c59a2a] bg-[#fff8eb] text-[#6b4f19]"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Range Note
                </button>
              </div>
              <textarea
                value={currentNote}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Write your notes..."
                className={`mt-3 h-24 w-full resize-none rounded-lg border border-[#3a2b16] p-2 text-xs leading-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.55)] outline-none sm:h-28 sm:text-sm sm:leading-6 ${
                  isDark
                    ? "bg-[#1a140b] text-[#e7c46a]"
                    : "bg-[#fffaf1] text-[#5f4412]"
                }`}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className={`text-xs ${isDark ? "text-[#dfbe72]" : "text-[#8e6a1d]"}`}>{selectedRangeLabel}</p>
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setNotesMode("month");
                  }}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    isDark
                      ? "border-[#c59a2a] text-[#e7c46a] hover:bg-[#2a1f0f]"
                      : "border-[#b68a2b] text-[#6b4f19] hover:bg-[#f1deb5]"
                  }`}
                >
                  Clear Range
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
