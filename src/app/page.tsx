import WallCalendar from "@/components/WallCalendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#fffbeb_40%,_#fff_80%)] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto mb-6 max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight text-amber-950 md:text-4xl">
          cronocanavas
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-amber-900 md:text-base">
          A tactile, wall-calendar inspired planner with date-range selection, notes, and
          responsive behavior.
        </p>
      </div>
      <WallCalendar />
    </main>
  );
}
