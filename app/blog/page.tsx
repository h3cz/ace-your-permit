import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Gauge, School } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

const posts = [
  {
    href: "/blog/illinois-permit-test-cheat-sheet",
    title: "Illinois Permit Test Cheat Sheet",
    description: "The signs, right-of-way rules, and safe-driving facts worth reviewing first.",
    icon: BookOpen,
    tag: "Study guide",
  },
  {
    href: "/blog/what-to-bring-illinois-permit-test",
    title: "What to Bring to the Illinois Permit Test",
    description: "A plain-English DMV checklist before you walk into a Secretary of State facility.",
    icon: ClipboardCheck,
    tag: "DMV checklist",
  },
  {
    href: "/blog/illinois-school-zone-speed-limit",
    title: "Illinois School Zone Speed Limit",
    description: "When the 20 mph school-zone rule matters and how it shows up on permit questions.",
    icon: School,
    tag: "Rules of the road",
  },
];

export const metadata: Metadata = {
  title: "Illinois Permit Test Blog | Ace Your Permit",
  description:
    "Simple Illinois permit test guides, DMV checklists, and study tips built for students who need to pass without overthinking it.",
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: "Illinois Permit Test Blog | Ace Your Permit",
    description:
      "Simple Illinois permit test guides, DMV checklists, and study tips built for students who need to pass without overthinking it.",
    url: `${siteUrl}/blog`,
  },
};

export default function BlogIndexPage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <Gauge className="h-4 w-4" aria-hidden="true" />
            Permit prep library
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Illinois permit test guides that get to the point.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Quick explainers, checklists, and rules-of-the-road refreshers for anyone taking the Illinois permit test.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/free-illinois-dmv-practice-test">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Take a Free Practice Test
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/tools/illinois-permit-readiness-checker">
              <Button variant="outline">Check If You Are Ready</Button>
            </Link>
            <Link href="/tools">
              <Button variant="outline">Browse Driver Tools</Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.href} href={post.href} className="group">
              <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors group-hover:border-blue-400">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <post.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">{post.tag}</p>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-950">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{post.description}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                  Read guide
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
