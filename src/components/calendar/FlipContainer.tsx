"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import CalendarGrid from "./CalendarGrid";
import type { MonthTheme } from "./monthThemes";

type FlipContainerProps = {
  currentMonth: Date;
  pendingMonth: Date | null;
  direction: "next" | "prev";
  startDate: Date | null;
  endDate: Date | null;
  onDateClick: (date: Date) => void;
  dark: boolean;
  getThemeForMonth: (date: Date) => MonthTheme;
  onFlipComplete: () => void;
};

function PageStack({ dark }: { dark: boolean }) {
  return (
    <>
      <div
        className={`absolute inset-0 rounded-md ${
          dark ? "bg-[#120f11]" : "bg-[#120f11]"
        } shadow-[0_16px_35px_-25px_rgba(0,0,0,0.7)]`}
        style={{ transform: "translateY(6px) scale(0.995)" }}
      />
      <div
        className={`absolute inset-0 rounded-md ${
          dark ? "bg-[#161214]" : "bg-[#161214]"
        } shadow-[0_18px_40px_-26px_rgba(0,0,0,0.75)]`}
        style={{ transform: "translateY(12px) scale(0.99)" }}
      />
      <div
        className={`absolute inset-0 rounded-md ${
          dark ? "bg-[#1a1518]" : "bg-[#1a1518]"
        } shadow-[0_20px_46px_-28px_rgba(0,0,0,0.8)]`}
        style={{ transform: "translateY(18px) scale(0.985)" }}
      />
      <div
        className={`absolute inset-0 rounded-md ${
          dark ? "bg-[#1f191c]" : "bg-[#1f191c]"
        } shadow-[0_22px_50px_-30px_rgba(0,0,0,0.82)]`}
        style={{ transform: "translateY(24px) scale(0.98)" }}
      />
      <div
        className={`absolute inset-0 rounded-md ${
          dark ? "bg-[#241d21]" : "bg-[#241d21]"
        } shadow-[0_24px_55px_-32px_rgba(0,0,0,0.84)]`}
        style={{ transform: "translateY(30px) scale(0.975)" }}
      />
      <div
        className={`absolute inset-0 rounded-md ${
          dark ? "bg-[#292225]" : "bg-[#292225]"
        } shadow-[0_26px_60px_-34px_rgba(0,0,0,0.86)]`}
        style={{ transform: "translateY(26px) scale(0.975)" }}
      />
    </>
  );
}

function MonthPage({
  monthDate,
  theme,
  dark,
  startDate,
  endDate,
  onDateClick,
}: {
  monthDate: Date;
  theme: MonthTheme;
  dark: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onDateClick: (date: Date) => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border shadow-[0_26px_58px_-28px_rgba(0,0,0,0.86)] sm:rounded-xl ${
        dark
          ? "border-[#3a2b16] bg-[#0e0b0d] text-[#e5b5ba]"
          : "border-[#d8bf8d] bg-[#fff8eb] text-[#5f4412]"
      }`}
    >
      <div className="relative h-[clamp(14rem,48vw,24rem)] w-full">
        <Image src={theme.image} alt={theme.title} fill sizes="(max-width: 768px) 100vw, 70vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5" />
        <div
          className="absolute -bottom-0.5 left-0 h-24 w-[58%] bg-[#b76e79]"
          style={{ clipPath: "polygon(0 28%, 100% 100%, 0 100%)" }}
        />
        <div
          className="absolute -bottom-0.5 right-0 h-24 w-[47%] bg-[#8f4f5d]"
          style={{ clipPath: "polygon(0 100%, 100% 28%, 100% 100%)" }}
        />
        <div className="absolute bottom-3 left-4 right-4 text-white sm:bottom-5 sm:left-6 sm:right-6">
          <p className="text-xs font-medium opacity-95 sm:text-sm">{format(monthDate, "yyyy")}</p>
          <p className="text-2xl font-extrabold leading-none uppercase tracking-wide sm:text-3xl">
            {format(monthDate, "LLLL")}
          </p>
          <p className="mt-1 text-base font-bold text-white/95 sm:mt-2 sm:text-xl">{theme.title}</p>
          <p className="mt-1 max-w-2xl text-xs text-white/85 sm:text-sm">{theme.description}</p>
        </div>
      </div>

      <div className={`px-4 pb-6 pt-4 sm:px-6 ${dark ? "bg-[#0e0b0d]" : "bg-[#fff8eb]"}`}>
        <CalendarGrid
          monthDate={monthDate}
          startDate={startDate}
          endDate={endDate}
          onDateClick={onDateClick}
          dark={dark}
        />
      </div>
    </div>
  );
}

export default function FlipContainer(props: FlipContainerProps) {
  const {
    currentMonth,
    pendingMonth,
    direction,
    startDate,
    endDate,
    onDateClick,
    dark,
    getThemeForMonth,
    onFlipComplete,
  } = props;

  if (!pendingMonth) {
    return (
      <div className="relative pb-4">
        <PageStack dark={dark} />
        <div className="relative z-20">
          <MonthPage
            monthDate={currentMonth}
            theme={getThemeForMonth(currentMonth)}
            dark={dark}
            startDate={startDate}
            endDate={endDate}
            onDateClick={onDateClick}
          />
        </div>
      </div>
    );
  }

  const rotateTo = direction === "next" ? -132 : 132;
  const frontOrigin = direction === "next" ? "0% 50%" : "100% 50%";

  return (
    <div className="relative pb-4 [perspective:1800px]">
      <PageStack dark={dark} />
      <div className="absolute inset-0 translate-y-1 scale-[0.992] opacity-85">
        <MonthPage
          monthDate={pendingMonth}
          theme={getThemeForMonth(pendingMonth)}
          dark={dark}
          startDate={startDate}
          endDate={endDate}
          onDateClick={onDateClick}
        />
      </div>

      <motion.div
        style={{ transformOrigin: frontOrigin, backfaceVisibility: "hidden" }}
        initial={{ rotateY: 0, x: 0 }}
        animate={{
          rotateY: [0, rotateTo],
          x: [0, direction === "next" ? -1 : 1],
          scale: [1, 0.995],
          opacity: [1, 1, 0],
        }}
        transition={{ duration: 0.72, ease: [0.2, 0.65, 0.2, 1], times: [0, 0.82, 1] }}
        onAnimationComplete={onFlipComplete}
        className="relative z-20"
      >
        <MonthPage
          monthDate={currentMonth}
          theme={getThemeForMonth(currentMonth)}
          dark={dark}
          startDate={startDate}
          endDate={endDate}
          onDateClick={onDateClick}
        />
        <motion.div
          className={`pointer-events-none absolute inset-0 rounded-md ${
            direction === "next"
              ? "bg-gradient-to-r from-black/5 via-black/15 to-black/35"
              : "bg-gradient-to-l from-black/5 via-black/15 to-black/35"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.03, 0.22, 0] }}
          transition={{ duration: 0.68, ease: [0.2, 0.65, 0.2, 1] }}
        />
      </motion.div>
    </div>
  );
}
