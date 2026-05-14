import type { Metadata } from "next";
import Link from "next/link";
import { Gauge } from "lucide-react";
import { ReadinessChecker } from "./readiness-checker";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

export const metadata: Metadata = {
  title: "Illinois Permit Readiness Checker | Ace Your Permit",
  description:
    "Free Illinois permit readiness checker. See if your paperwork, road signs, right-of-way rules, and practice score are ready for test day.",
  alternates: { canonical: `${siteUrl}/tools/illinois-permit-readiness-checker` },
  openGraph: {
    title: "Illinois Permit Readiness Checker",
    description:
      "Free Illinois permit readiness checker. See if your paperwork, road signs, right-of-way rules, and practice score are ready for test day.",
    url: `${siteUrl}/tools/illinois-permit-readiness-checker`,
  },
};

export default function IllinoisPermitReadinessCheckerPage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Link href="/tools" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            Back to tools
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <Gauge className="h-4 w-4" aria-hidden="true" />
            Free driver tool
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Illinois Permit Readiness Checker
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Answer six quick checks to see whether you are ready to walk into the Illinois permit test or need one more practice lap.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            This tool is a study helper, not an official eligibility decision. Always confirm document requirements with the Illinois Secretary of State before visiting a facility.
          </p>
        </div>
        <ReadinessChecker />
      </section>
    </main>
  );
}
