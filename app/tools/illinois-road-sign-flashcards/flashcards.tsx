"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const cards = [
  {
    name: "STOP",
    shape: "Red octagon",
    meaning: "Come to a complete stop before the stop line, crosswalk, or intersection.",
    kind: "stop",
  },
  {
    name: "YIELD",
    shape: "Upside-down triangle",
    meaning: "Slow down and be ready to stop for traffic or pedestrians with the right-of-way.",
    kind: "yield",
  },
  {
    name: "WARNING",
    shape: "Yellow diamond",
    meaning: "A hazard or road change is ahead. Slow down and pay attention.",
    kind: "warning",
  },
  {
    name: "SCHOOL",
    shape: "Fluorescent pentagon",
    meaning: "Watch for children, crossings, buses, and school-zone speed rules.",
    kind: "school",
  },
  {
    name: "SPEED LIMIT",
    shape: "White rectangle",
    meaning: "This is the maximum legal speed under normal conditions.",
    kind: "speed",
  },
];

export function RoadSignFlashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  const next = () => {
    setIndex((current) => (current + 1) % cards.length);
    setFlipped(false);
  };

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 sm:p-8">
      <button
        type="button"
        onClick={() => setFlipped((current) => !current)}
        className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-3xl border-2 border-blue-100 bg-gradient-to-b from-slate-50 to-white p-6 text-center transition-colors hover:border-blue-400"
      >
        <SignVisual kind={card.kind} />
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-blue-700">
          Card {index + 1} of {cards.length}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">
          {flipped ? card.shape : card.name}
        </h2>
        <p className="mt-3 max-w-md text-slate-600">
          {flipped ? card.meaning : "Tap to flip and check what it means."}
        </p>
      </button>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={() => setFlipped(false)}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Show Front
        </Button>
        <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={next}>
          Next Sign
        </Button>
        <Link href="/free-illinois-dmv-practice-test">
          <Button variant="outline">
            Practice Signs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SignVisual({ kind }: { kind: string }) {
  if (kind === "stop") {
    return (
      <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label="Stop sign">
        <polygon points="36,8 84,8 112,36 112,84 84,112 36,112 8,84 8,36" fill="#dc2626" stroke="#ffffff" strokeWidth="6" />
        <text x="60" y="68" textAnchor="middle" fontSize="24" fontWeight="800" fill="white">STOP</text>
      </svg>
    );
  }
  if (kind === "yield") {
    return (
      <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label="Yield sign">
        <polygon points="60,104 10,18 110,18" fill="#ffffff" stroke="#dc2626" strokeWidth="10" />
        <text x="60" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill="#dc2626">YIELD</text>
      </svg>
    );
  }
  if (kind === "school") {
    return (
      <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label="School sign">
        <polygon points="60,8 110,38 96,106 24,106 10,38" fill="#d9f99d" stroke="#111827" strokeWidth="4" />
        <text x="60" y="68" textAnchor="middle" fontSize="18" fontWeight="800" fill="#111827">SCHOOL</text>
      </svg>
    );
  }
  if (kind === "speed") {
    return (
      <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label="Speed limit sign">
        <rect x="20" y="14" width="80" height="92" rx="6" fill="#ffffff" stroke="#111827" strokeWidth="4" />
        <text x="60" y="44" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">SPEED</text>
        <text x="60" y="62" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">LIMIT</text>
        <text x="60" y="90" textAnchor="middle" fontSize="28" fontWeight="800" fill="#111827">30</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label="Warning sign">
      <polygon points="60,8 112,60 60,112 8,60" fill="#facc15" stroke="#111827" strokeWidth="4" />
      <text x="60" y="70" textAnchor="middle" fontSize="34" fontWeight="800" fill="#111827">!</text>
    </svg>
  );
}
