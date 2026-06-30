"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Clock,
  Infinity,
  Play,
  RotateCcw,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile-layout";
import { illinoisDMVQuestions } from "@/lib/data/questions/illinois-dmv-questions";

const quizModes = [
  {
    id: "practice",
    name: "Quick Practice",
    description: "10 random questions",
    icon: Play,
    href: "/quiz/practice",
    badge: "Best start",
    estimatedTime: "5 min",
    tone: "blue",
  },
  {
    id: "timed",
    name: "Timed Test",
    description: "35 questions with test-day pacing",
    icon: Timer,
    href: "/quiz/timed",
    badge: "Real format",
    estimatedTime: "45 min",
    tone: "orange",
  },
  {
    id: "mistakes",
    name: "Review Misses",
    description: "Practice what needs another rep",
    icon: RotateCcw,
    href: "/quiz/mistakes",
    badge: "Personalized",
    estimatedTime: "Varies",
    tone: "green",
  },
  {
    id: "marathon",
    name: "Marathon Mode",
    description: "Run through the full bank",
    icon: Infinity,
    href: "/quiz/marathon",
    badge: "All questions",
    estimatedTime: "Varies",
    tone: "blue",
  },
];

const categoryMeta = [
  {
    id: "traffic-signs",
    name: "Traffic Signs",
    description: "Signs, signals, markings",
    icon: Target,
  },
  {
    id: "traffic-laws",
    name: "Rules of the Road",
    description: "Right-of-way, speed, laws",
    icon: Zap,
  },
  {
    id: "safe-driving",
    name: "Safe Driving",
    description: "Hazards and defense",
    icon: Brain,
  },
  {
    id: "alcohol-drugs",
    name: "Alcohol & Drugs",
    description: "DUI and impairment",
    icon: AlertCircle,
  },
];

const categories = categoryMeta.map((cat) => ({
  ...cat,
  questionCount: illinoisDMVQuestions.filter((q) => q.category_id === cat.id).length,
}));

export default function QuizLobbyPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MobileLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
          <Card className="overflow-hidden border-blue-500/30 bg-blue-600 text-white">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Practice Quiz
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                What do you want to knock out?
              </h1>
              <p className="mt-2 max-w-2xl text-blue-100">
                Start with 10 questions, simulate the real test, or target one topic.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/quiz/practice">
                  <Button className="min-h-[44px] bg-white text-blue-700 hover:bg-blue-50">
                    Start Quick Practice
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/quiz/timed">
                  <Button
                    variant="outline"
                    className="min-h-[44px] border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    Timed Test
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
              <p className="text-sm font-semibold text-blue-600">No fake stats here</p>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Practice updates your real dashboard.
              </h2>
              <p className="text-sm text-muted-foreground">
                Finish a quiz to start tracking XP, streaks, and accuracy.
              </p>
            </CardContent>
          </Card>
        </header>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Choose a mode
            </h2>
            <span className="text-sm text-muted-foreground">Tap and go</span>
          </div>

          <div className="grid gap-3">
            {quizModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.04 }}
              >
                <ModeCard mode={mode} primary={mode.id === "practice"} />
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Practice by category
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.16 + index * 0.04 }}
              >
                <Link href={`/quiz/category/${category.id}`} className="group">
                  <Card className="h-full transition-colors group-hover:border-blue-500/70">
                    <CardContent className="flex min-h-[96px] items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-blue-500">
                          <category.icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {category.questionCount} questions
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}

function ModeCard({
  mode,
  primary,
}: {
  mode: (typeof quizModes)[number];
  primary?: boolean;
}) {
  const Icon = mode.icon;

  return (
    <Link href={mode.href} className="group">
      <Card
        className={`transition-colors ${
          primary ? "border-blue-500/50 bg-blue-600 text-white" : "group-hover:border-blue-500/70"
        }`}
      >
        <CardContent className="flex min-h-[92px] items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                primary ? "bg-white/15 text-white" : modeIconClass(mode.tone)
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`font-semibold ${primary ? "text-white" : "text-foreground"}`}>
                  {mode.name}
                </h3>
                <Badge
                  variant={primary ? "secondary" : "outline"}
                  className={primary ? "bg-white/15 text-white hover:bg-white/15" : ""}
                >
                  {mode.badge}
                </Badge>
              </div>
              <p className={primary ? "mt-1 text-sm text-blue-100" : "mt-1 text-sm text-muted-foreground"}>
                {mode.description}
              </p>
              <p className={primary ? "mt-2 flex items-center gap-1 text-xs text-blue-100" : "mt-2 flex items-center gap-1 text-xs text-muted-foreground"}>
                <Clock className="h-3 w-3" aria-hidden="true" />
                {mode.estimatedTime}
              </p>
            </div>
          </div>
          <ArrowRight
            className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 ${
              primary ? "text-white" : "text-muted-foreground group-hover:text-blue-500"
            }`}
          />
        </CardContent>
      </Card>
    </Link>
  );
}

function modeIconClass(tone: string) {
  switch (tone) {
    case "orange":
      return "bg-orange-500 text-white";
    case "green":
      return "bg-emerald-500 text-white";
    default:
      return "bg-blue-600 text-white";
  }
}
