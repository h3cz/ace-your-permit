import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

export const metadata: Metadata = {
  title: "What to Bring to the Illinois Permit Test | DMV Checklist",
  description:
    "A simple Illinois permit test checklist: identification, Secretary of State application, driver education status, and study prep before your DMV visit.",
  alternates: { canonical: `${siteUrl}/blog/what-to-bring-illinois-permit-test` },
  openGraph: {
    title: "What to Bring to the Illinois Permit Test",
    description:
      "A simple Illinois permit test checklist: identification, Secretary of State application, driver education status, and study prep before your DMV visit.",
    url: `${siteUrl}/blog/what-to-bring-illinois-permit-test`,
  },
};

const checklist = [
  "Proper identification documents that match the Illinois Secretary of State requirements.",
  "A completed Secretary of State application.",
  "Proof that you meet the instruction permit requirements for your age group.",
  "Parent or guardian involvement if you are a minor and the facility requires consent.",
  "Time to take the written knowledge test and vision screening.",
  "A quick practice-test warmup before you leave home.",
];

export default function WhatToBringIllinoisPermitTestPage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
          Back to blog
        </Link>
        <header className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">DMV checklist</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            What to Bring to the Illinois Permit Test
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Before you go to a Driver Services facility, make sure your paperwork and study prep are both ready. Illinois Secretary of State guidance says proper identification documents and an application are required for an instruction permit.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-slate-950">
            <ClipboardCheck className="h-6 w-6 text-blue-700" aria-hidden="true" />
            Permit-day checklist
          </h2>
          <ul className="mt-5 space-y-3">
            {checklist.map((item, index) => (
              <li key={item} className="flex gap-3 text-slate-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono text-sm font-bold text-blue-700">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-6">
          <h2 className="font-display text-2xl font-bold text-slate-950">Official source to check before you go</h2>
          <p className="mt-2 text-slate-700">
            Document rules can change. Confirm your exact documents on the Illinois Secretary of State instruction permit page before visiting a facility.
          </p>
          <a
            href="https://www.ilsos.gov/departments/drivers/driver-education/instructpermit.html"
            className="mt-4 inline-flex font-semibold text-blue-700 hover:text-blue-800"
          >
            Illinois SOS instruction permit requirements
          </a>
        </section>

        <section className="mt-8 rounded-2xl bg-blue-600 p-6 text-white">
          <h2 className="font-display text-2xl font-bold">Paperwork ready? Check your test readiness.</h2>
          <p className="mt-2 max-w-2xl text-blue-50">
            Use the readiness checker, then run a free mini test so you are not guessing where you stand.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/tools/illinois-permit-readiness-checker">
              <Button className="bg-white text-blue-700 hover:bg-blue-50">
                Use Readiness Checker
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/free-illinois-dmv-practice-test">
              <Button variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
                Take Practice Test
              </Button>
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
