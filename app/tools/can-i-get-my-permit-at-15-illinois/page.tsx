import type { Metadata } from "next";
import Link from "next/link";
import { ShieldQuestion } from "lucide-react";
import { PermitAt15EligibilityQuiz } from "./eligibility-quiz";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

export const metadata: Metadata = {
  title: "Can I Get My Permit at 15 in Illinois? | Eligibility Quiz",
  description:
    "Free Illinois age-15 permit eligibility quiz for driver education enrollment, parent consent, written test, vision screening, and documents.",
  alternates: { canonical: `${siteUrl}/tools/can-i-get-my-permit-at-15-illinois` },
  openGraph: {
    title: "Can I Get My Permit at 15 in Illinois?",
    description:
      "Free Illinois age-15 permit eligibility quiz for driver education enrollment, parent consent, written test, vision screening, and documents.",
    url: `${siteUrl}/tools/can-i-get-my-permit-at-15-illinois`,
  },
};

export default function PermitAt15Page() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Link href="/tools" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            Back to tools
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <ShieldQuestion className="h-4 w-4" aria-hidden="true" />
            Eligibility quiz
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Can I Get My Permit at 15 in Illinois?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Yes, many Illinois students can apply at 15, but driver education enrollment, parent consent, vision screening, and the written exam all matter.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            This tool summarizes official Illinois Secretary of State guidance. It is not a DMV decision.
          </p>
        </div>
        <PermitAt15EligibilityQuiz />
      </section>
    </main>
  );
}
