import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { DocumentChecklistTool } from "./document-checklist";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aceyourpermit.com";

export const metadata: Metadata = {
  title: "Illinois DMV Document Checklist for Permit Test | Ace Your Permit",
  description:
    "Build a simple Illinois permit document checklist from the official Secretary of State ID document groups before your DMV visit.",
  alternates: { canonical: `${siteUrl}/tools/illinois-dmv-document-checklist` },
  openGraph: {
    title: "Illinois DMV Document Checklist",
    description:
      "Build a simple Illinois permit document checklist from the official Secretary of State ID document groups before your DMV visit.",
    url: `${siteUrl}/tools/illinois-dmv-document-checklist`,
  },
};

export default function IllinoisDmvDocumentChecklistPage() {
  return (
    <main className="force-light-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Link href="/tools" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            Back to tools
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <FileCheck2 className="h-4 w-4" aria-hidden="true" />
            DMV checklist
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Illinois DMV Document Checklist
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Tap each document group as you gather it. The official Illinois Secretary of State list uses Groups A, B, C, and D for identity requirements.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            This is a planning helper. Always confirm the final document list on the Illinois Secretary of State site before visiting.
          </p>
        </div>
        <DocumentChecklistTool />
      </section>
    </main>
  );
}
