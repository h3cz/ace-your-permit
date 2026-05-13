"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  Flame,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OnboardingChecklistCompact } from "@/components/onboarding/checklist";
import { useOnboarding } from "@/hooks/use-onboarding";

export interface DashboardStats {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  questionsAnswered: number;
  accuracy: number;
  hasStats: boolean;
}

export interface DashboardCategoryProgress {
  id: string;
  name: string;
  completed: number;
  total: number;
  progress: number;
}

export interface DashboardLeaderboardEntry {
  userId: string;
  rank: number;
  name: string;
  weeklyXp: number;
  isUser: boolean;
}

interface DashboardViewProps {
  stats: DashboardStats;
  categories: DashboardCategoryProgress[];
  leaderboard: DashboardLeaderboardEntry[];
}

function levelProgressPercent(totalXp: number, level: number): number {
  const xpPerLevel = 500;
  const xpIntoLevel = Math.max(0, totalXp - (level - 1) * xpPerLevel);
  return Math.min(100, Math.round((xpIntoLevel / xpPerLevel) * 100));
}

export function DashboardView({ stats, categories, leaderboard }: DashboardViewProps) {
  const onboarding = useOnboarding();
  const levelProgress = levelProgressPercent(stats.totalXP, stats.currentLevel);
  const topLeaderboard = leaderboard.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Study hub
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-muted-foreground">
            Keep it simple: answer a few questions, build the streak, move on.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
          <Flame className="h-5 w-5" aria-hidden="true" />
          <span className="font-mono text-sm font-bold">{stats.currentStreak} day streak</span>
        </div>
      </header>

      {onboarding.completedSteps.length < 6 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <OnboardingChecklistCompact
            completedSteps={onboarding.completedSteps}
            currentStep={onboarding.currentStep}
          />
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden border-blue-500/30 bg-blue-600 text-white shadow-lg shadow-blue-950/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                  Next best move
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats.hasStats ? "Continue with quick practice" : "Take your first quiz"}
                </h2>
                <p className="mt-2 text-blue-100">
                  {stats.hasStats
                    ? "Ten questions is enough to make progress today."
                    : "Start tracking XP, accuracy, and weak spots in a few minutes."}
                </p>
              </div>
              <Link href="/quiz/practice">
                <Button className="min-h-[44px] bg-white text-blue-700 hover:bg-blue-50">
                  Start Practice
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid h-full grid-cols-3 gap-3 p-4 lg:grid-cols-1">
            <StatPill icon={Zap} label="XP" value={stats.totalXP.toLocaleString()} />
            <StatPill icon={Target} label="Accuracy" value={`${stats.accuracy}%`} />
            <StatPill icon={BookOpen} label="Answered" value={stats.questionsAnswered.toString()} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/quiz/practice" className="group">
          <Card className="h-full border-blue-500/30 transition-colors group-hover:border-blue-500">
            <CardContent className="flex min-h-[96px] items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <BookOpen className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Quick Practice</h2>
                  <p className="text-sm text-muted-foreground">10 questions, about 5 minutes</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/quiz/timed" className="group">
          <Card className="h-full transition-colors group-hover:border-orange-500/70">
            <CardContent className="flex min-h-[96px] items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white">
                  <Clock className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Timed Test</h2>
                  <p className="text-sm text-muted-foreground">Real test pacing</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progress</CardTitle>
              <span className="text-sm text-muted-foreground">
                Level {stats.currentLevel}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Next level</span>
                <span className="font-mono text-foreground">{levelProgress}%</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>

            <div className="space-y-3">
              {categories.length === 0 ? (
                <EmptyLine
                  icon={BarChart3}
                  title="No category data yet"
                  description="Answer a quiz and this will show your strongest and weakest topics."
                />
              ) : (
                categories.map((category) => (
                  <div key={category.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className="text-muted-foreground">
                        {category.completed}/{category.total}
                      </span>
                    </div>
                    <Progress value={category.progress} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Weekly Rank</CardTitle>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm" className="min-h-[44px]">
                  View
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topLeaderboard.length === 0 ? (
              <EmptyLine
                icon={Trophy}
                title="Leaderboard starts after practice"
                description="Earn XP from quizzes to show up in this week's ranking."
              />
            ) : (
              <div className="space-y-2">
                {topLeaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between rounded-xl bg-muted px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background font-mono text-sm font-bold">
                        {entry.rank}
                      </span>
                      <span className="font-medium text-foreground">{entry.name}</span>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {entry.weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted px-3 py-3">
      <Icon className="mb-2 h-4 w-4 text-blue-500" aria-hidden="true" />
      <p className="font-mono text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyLine({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-blue-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
