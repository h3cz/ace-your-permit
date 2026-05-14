"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const groups = [
  {
    id: "signature",
    label: "Group A: Written signature",
    examples: ["Social Security card", "U.S. passport", "credit or debit card", "Illinois ID card"],
  },
  {
    id: "birth",
    label: "Group B: Date of birth",
    examples: ["birth certificate", "U.S. passport", "citizenship certificate", "certified school transcript"],
  },
  {
    id: "ssn",
    label: "Group C: Social Security number",
    examples: ["Social Security card", "W-2", "pay stub with full SSN", "SSA-1099"],
  },
  {
    id: "residency",
    label: "Group D: Illinois residency",
    examples: ["utility bill", "bank statement", "lease agreement", "school report card"],
  },
];

export function DocumentChecklistTool() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const readyCount = Object.values(selected).filter(Boolean).length;
  const missing = useMemo(
    () => groups.filter((group) => !selected[group.id]).map((group) => group.label),
    [selected],
  );

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 sm:p-8">
      <div className="grid gap-4">
        {groups.map((group) => {
          const active = selected[group.id] === true;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelected((current) => ({ ...current, [group.id]: !current[group.id] }))}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-950"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300"
              }`}
              aria-pressed={active}
            >
              <div className="flex items-start gap-3">
                {active ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                )}
                <div>
                  <p className="font-semibold">{group.label}</p>
                  <p className="mt-1 text-sm text-slate-600">Examples: {group.examples.join(", ")}.</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <p className="font-display text-2xl font-bold text-slate-950">
          {readyCount === groups.length ? "Your checklist looks full." : `${missing.length} document group${missing.length === 1 ? "" : "s"} left.`}
        </p>
        <p className="mt-2 text-slate-700">
          {readyCount === groups.length
            ? "Confirm everything is current, original or certified when required, and acceptable under the official SOS list."
            : `Still missing: ${missing.join("; ")}.`}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print Checklist
          </Button>
          <Link href="/tools/can-i-get-my-permit-at-15-illinois">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Check Age Eligibility
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
