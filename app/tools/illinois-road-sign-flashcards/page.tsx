import type { Metadata } from "next";
import Link from "next/link";
import { Route } from "lucide-react";
import { RoadSignFlashcards } from "./flashcards";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

export const metadata: Metadata = {
  title: "Illinois Road Sign Flashcards | Ace Your Permit",
  description:
    "Free Illinois road sign flashcards for the permit test. Practice stop, yield, warning, school-zone, and speed-limit signs.",
  alternates: { canonical: `${siteUrl}/tools/illinois-road-sign-flashcards` },
  openGraph: {
    title: "Illinois Road Sign Flashcards",
    description:
      "Free Illinois road sign flashcards for the permit test. Practice stop, yield, warning, school-zone, and speed-limit signs.",
    url: `${siteUrl}/tools/illinois-road-sign-flashcards`,
  },
};

export default function IllinoisRoadSignFlashcardsPage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Link href="/tools" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            Back to tools
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <Route className="h-4 w-4" aria-hidden="true" />
            Flashcards
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Illinois Road Sign Flashcards
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Learn sign shapes and meanings fast. On the permit test, shape and color often tell you the answer before the words do.
          </p>
        </div>
        <RoadSignFlashcards />
      </section>
    </main>
  );
}
