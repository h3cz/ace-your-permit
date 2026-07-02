"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Bug,
  CheckCircle2,
  Clock3,
  Lightbulb,
  MessageSquare,
  Paintbrush,
  Rocket,
  Send,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FeatureCategory = "feature" | "question" | "bug" | "pwa" | "polish" | "other";
type FeatureStatus = "new" | "reviewing" | "planned" | "shipped" | "closed";

interface FeatureRequest {
  id: string;
  category: FeatureCategory;
  title: string;
  details: string;
  status: FeatureStatus;
  created_at: string;
  updated_at: string;
}

const categories: Array<{
  value: FeatureCategory;
  label: string;
  icon: typeof Lightbulb;
}> = [
  { value: "feature", label: "Feature", icon: Lightbulb },
  { value: "question", label: "Question", icon: BookOpen },
  { value: "bug", label: "Bug", icon: Bug },
  { value: "pwa", label: "PWA", icon: Smartphone },
  { value: "polish", label: "Polish", icon: Paintbrush },
  { value: "other", label: "Other", icon: MessageSquare },
];

const statusStyles: Record<FeatureStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  reviewing: "border-cyan-200 bg-cyan-50 text-cyan-700",
  planned: "border-orange-200 bg-orange-50 text-orange-700",
  shipped: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closed: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatStatus(status: FeatureStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function FeatureRequestsClient() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [category, setCategory] = useState<FeatureCategory>("feature");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailsRemaining = useMemo(() => 2000 - details.length, [details.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/feature-requests", {
          headers: { accept: "application/json" },
        });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Could not load suggestions.");
        }

        if (!cancelled) {
          setRequests(json.requests ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Could not load suggestions.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRequests();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ category, title, details }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Could not save suggestion.");
      }

      setRequests((current) => [json.request, ...current]);
      setTitle("");
      setDetails("");
      setCategory("feature");
      toast.success("Suggestion saved. Dash has it on the board.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save suggestion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">Help shape Ace Your Permit</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Drop the thing that would make studying faster, clearer, or more fun.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-orange-700">
          <Rocket className="h-5 w-5" />
          <span className="text-sm font-semibold">{requests.length} on your board</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Send className="h-5 w-5 text-blue-600" />
              New Suggestion
            </CardTitle>
            <CardDescription>Keep it specific so we can act on it.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="suggestion-title">Title</Label>
                <Input
                  id="suggestion-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  minLength={3}
                  maxLength={120}
                  required
                  placeholder="Practice reminders before my test"
                  className="min-h-11"
                />
              </div>

              <div className="space-y-3">
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((item) => {
                    const Icon = item.icon;
                    const active = category === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setCategory(item.value)}
                        className={cn(
                          "min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                          "flex items-center justify-center gap-2",
                          active
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/60"
                        )}
                        aria-pressed={active}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="suggestion-details">Details</Label>
                  <span className="font-mono text-xs text-slate-500">{detailsRemaining}</span>
                </div>
                <textarea
                  id="suggestion-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value.slice(0, 2000))}
                  minLength={10}
                  maxLength={2000}
                  required
                  placeholder="What should happen, where would it show up, and why would it help?"
                  className="min-h-36 w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Suggestion"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">Your Suggestions</h2>
            <Badge variant="secondary" className="font-mono">
              {requests.length}
            </Badge>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <Card key={item} className="border-slate-200">
                  <CardContent className="space-y-3 p-5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-slate-50">
              <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                <Lightbulb className="h-10 w-10 text-orange-500" />
                <div>
                  <h3 className="font-bold text-slate-950">Nothing here yet</h3>
                  <p className="mt-1 text-sm text-slate-600">Send the first idea and we&apos;ll track it here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Card key={request.id} className="border-slate-200 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
                            {categories.find((item) => item.value === request.category)?.label ?? "Feature"}
                          </Badge>
                          <Badge className={cn("border hover:bg-current/0", statusStyles[request.status])}>
                            {request.status === "shipped" ? (
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            ) : (
                              <Clock3 className="mr-1 h-3.5 w-3.5" />
                            )}
                            {formatStatus(request.status)}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-slate-950">{request.title}</h3>
                      </div>
                      <time className="shrink-0 text-sm text-slate-500" dateTime={request.created_at}>
                        {formatDate(request.created_at)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{request.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
