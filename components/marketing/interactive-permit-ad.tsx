import Link from "next/link";
import { ArrowRight, CheckCircle2, MousePointerClick, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InteractivePermitAd() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 sm:p-8 lg:grid-cols-[1fr_380px] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            <MousePointerClick className="h-4 w-4" aria-hidden="true" />
            Student ad concept
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Think you can pass this before the bell rings?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            A tiny interactive ad built around the real practice test: one tap, instant feedback, then a clean path into the free mini quiz.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <span className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-600" aria-hidden="true" />
              30-second hook
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" aria-hidden="true" />
              Instant payoff
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              No signup first
            </span>
          </div>
          <div className="mt-7">
            <Link href="#sample-practice">
              <Button className="min-h-[44px] bg-blue-600 hover:bg-blue-700">
                Try the Interactive Ad
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-lg">
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                ACE YOUR PERMIT
              </span>
              <span className="font-mono text-xs text-blue-100">0:29</span>
            </div>
            <p className="font-display text-2xl font-bold tracking-tight">
              Quick: school zone speed?
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["15 mph", "20 mph", "25 mph", "30 mph"].map((answer) => (
                <div
                  key={answer}
                  className={`min-h-[44px] rounded-xl border px-3 py-3 text-center text-sm font-bold ${
                    answer === "20 mph"
                      ? "border-green-300 bg-green-400 text-slate-950"
                      : "border-white/20 bg-white/10 text-white"
                  }`}
                >
                  {answer}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-900">
              Dash says: Yep. 20 mph when children are present.
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-300">
            Built for TikTok, Snap, school newsletter embeds, and landing-page retargeting.
          </p>
        </div>
      </div>
    </section>
  );
}
