import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  Route,
  School,
  ShieldQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

const tools = [
  {
    href: "/tools/illinois-permit-readiness-checker",
    title: "Illinois Permit Readiness Checker",
    description: "Six quick checks for paperwork, road signs, right-of-way, and practice-score readiness.",
    icon: Gauge,
    tag: "Start here",
  },
  {
    href: "/tools/illinois-dmv-document-checklist",
    title: "Illinois DMV Document Checklist",
    description: "Build a simple permit-day document list from the official ID document groups.",
    icon: FileCheck2,
    tag: "Paperwork",
  },
  {
    href: "/tools/can-i-get-my-permit-at-15-illinois",
    title: "Can I Get My Permit at 15?",
    description: "Answer a few questions and see what still needs to be true before you apply.",
    icon: ShieldQuestion,
    tag: "Eligibility",
  },
  {
    href: "/tools/illinois-road-sign-flashcards",
    title: "Illinois Road Sign Flashcards",
    description: "Flip through the sign shapes and colors that show up on permit questions.",
    icon: Route,
    tag: "Flashcards",
  },
  {
    href: "/tools/illinois-school-zone-speed-game",
    title: "School-Zone Speed Game",
    description: "Practice the 20 mph school-zone rule with fast mini scenarios.",
    icon: School,
    tag: "Mini game",
  },
];

export const metadata: Metadata = {
  title: "Free Illinois Driver Tools | Ace Your Permit",
  description:
    "Free Illinois permit test tools: readiness checker, DMV document checklist, age-15 permit quiz, road-sign flashcards, and school-zone speed game.",
  alternates: { canonical: `${siteUrl}/tools` },
  openGraph: {
    title: "Free Illinois Driver Tools",
    description:
      "Free Illinois permit test tools: readiness checker, DMV document checklist, age-15 permit quiz, road-sign flashcards, and school-zone speed game.",
    url: `${siteUrl}/tools`,
  },
};

export default function ToolsPage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            Free driver tools
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Tools for the Illinois permit test.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Quick interactive helpers for the stuff students actually search before test day: documents, eligibility, signs, school zones, and readiness.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/free-illinois-dmv-practice-test">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Take a Free Practice Test
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline">Read Study Guides</Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group">
              <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors group-hover:border-blue-400">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <tool.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">{tool.tag}</p>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-950">{tool.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.description}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                  Open tool
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </p>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
