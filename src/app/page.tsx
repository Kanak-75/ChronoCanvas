import WallCalendar from "@/components/WallCalendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070607] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto mb-6 max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#e7c46a] md:text-4xl">
          cronocanavas
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[#d9b96a] md:text-base">
          A tactile, wall-calendar inspired planner with date-range selection, notes, and
          responsive behavior.
        </p>
      </div>
      <WallCalendar />
    </main>
  );
}
