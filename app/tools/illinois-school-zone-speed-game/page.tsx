import type { Metadata } from "next";
import Link from "next/link";
import { School } from "lucide-react";
import { SchoolZoneSpeedGame } from "./school-zone-game";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

export const metadata: Metadata = {
  title: "Illinois School-Zone Speed Game | 20 MPH Practice",
  description:
    "Practice Illinois school-zone speed questions with a free mini game. Learn when 20 mph applies for permit-test scenarios.",
  alternates: { canonical: `${siteUrl}/tools/illinois-school-zone-speed-game` },
  openGraph: {
    title: "Illinois School-Zone Speed Game",
    description:
      "Practice Illinois school-zone speed questions with a free mini game. Learn when 20 mph applies for permit-test scenarios.",
    url: `${siteUrl}/tools/illinois-school-zone-speed-game`,
  },
};

export default function IllinoisSchoolZoneSpeedGamePage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Link href="/tools" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            Back to tools
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <School className="h-4 w-4" aria-hidden="true" />
            Mini game
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Illinois School-Zone Speed Game
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            The school-zone rule is small but testable. Choose whether each scenario calls for 20 mph or the normal posted limit.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Based on Illinois Secretary of State guidance: school speed zones limit vehicle speed to 20 mph during school days when children are physically present.
          </p>
        </div>
        <SchoolZoneSpeedGame />
      </section>
    </main>
  );
}
