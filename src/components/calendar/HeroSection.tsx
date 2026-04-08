"use client";

import { addMonths, format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { monthThemes } from "./monthThemes";

type HeroSectionProps = {
  monthDate: Date;
};

function preloadImage(src: string) {
  if (typeof window === "undefined") return;
  const img = new window.Image();
  img.src = src;
}

export default function HeroSection({ monthDate }: HeroSectionProps) {
  const monthIndex = monthDate.getMonth();
  const theme = monthThemes[monthIndex];

  useEffect(() => {
    const nextTheme = monthThemes[addMonths(monthDate, 1).getMonth()];
    const prevTheme = monthThemes[addMonths(monthDate, -1).getMonth()];
    preloadImage(nextTheme.image);
    preloadImage(prevTheme.image);
  }, [monthDate]);

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-md sm:h-[24rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={theme.image}
          style={{ transformOrigin: "right bottom" }}
          initial={{ opacity: 0, scale: 0.96, y: 12, x: 8, rotate: 0.4 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.015, y: -4, x: -4, rotate: -0.2 }}
          transition={{ duration: 0.72, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={theme.image}
            alt={theme.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10" />

      <div className="absolute bottom-5 left-5 right-5 text-white sm:left-8 sm:right-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/90">
          {format(monthDate, "LLLL yyyy")}
        </p>
        <h3 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{theme.title}</h3>
        <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">{theme.description}</p>
      </div>
    </div>
  );
}

