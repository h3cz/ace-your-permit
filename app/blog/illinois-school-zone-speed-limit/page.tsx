import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, School } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

export const metadata: Metadata = {
  title: "Illinois School Zone Speed Limit: What Permit Test Students Need",
  description:
    "Illinois school-zone speed limit study guide for permit test students: 20 mph on school days when children are present, plus practice tips.",
  alternates: { canonical: `${siteUrl}/blog/illinois-school-zone-speed-limit` },
  openGraph: {
    title: "Illinois School Zone Speed Limit",
    description:
      "Illinois school-zone speed limit study guide for permit test students: 20 mph on school days when children are present, plus practice tips.",
    url: `${siteUrl}/blog/illinois-school-zone-speed-limit`,
  },
};

export default function IllinoisSchoolZoneSpeedLimitPage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
          Back to blog
        </Link>
        <header className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Rules of the road</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Illinois School Zone Speed Limit
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            For permit-test purposes, remember the simple version first: Illinois school zones commonly use a 20 mph reduced speed limit on school days when children are present and signs are posted.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <School className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-slate-950">The rule students should memorize</h2>
          <p className="mt-3 text-slate-700">
            When you see a school-zone question, look for three clues: it is a school day, children are present, and the school-zone signs are posted. If those clues are there, 20 mph is usually the answer.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Speed", "20 mph"],
            ["When", "School days"],
            ["Trigger", "Children present"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl bg-blue-600 p-6 text-white">
          <h2 className="font-display text-2xl font-bold">Want to see this as a real question?</h2>
          <p className="mt-2 max-w-2xl text-blue-50">
            The fastest way to remember speed rules is to answer them in context.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/ads/permit-speed-check">
              <Button className="bg-white text-blue-700 hover:bg-blue-50">
                Try the Speed Check
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/free-illinois-dmv-practice-test">
              <Button variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
                Take Free Practice Test
              </Button>
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
