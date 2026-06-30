"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock3, KeyRound, Lightbulb, RefreshCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FeatureStatus = "new" | "reviewing" | "planned" | "shipped" | "closed";

interface AdminFeatureRequest {
  id: string;
  user_id: string;
  category: string;
  title: string;
  details: string;
  status: FeatureStatus;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
  } | null;
}

const statuses: FeatureStatus[] = ["new", "reviewing", "planned", "shipped", "closed"];

const statusStyles: Record<FeatureStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  reviewing: "border-cyan-200 bg-cyan-50 text-cyan-700",
  planned: "border-orange-200 bg-orange-50 text-orange-700",
  shipped: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closed: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: FeatureStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function AdminFeatureRequestsClient() {
  const [adminKey, setAdminKey] = useState("");
  const [requests, setRequests] = useState<AdminFeatureRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) return false;
      if (!normalized) return true;

      return [
        request.title,
        request.details,
        request.category,
        request.profile?.display_name,
        request.profile?.username,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [query, requests, statusFilter]);

  async function loadRequests(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!adminKey.trim()) {
      toast.error("Admin key required.");
      return;
    }

    setIsLoading(true);
    try {
      const url = statusFilter === "all"
        ? "/api/admin/feature-requests"
        : `/api/admin/feature-requests?status=${statusFilter}`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "x-admin-key": adminKey,
        },
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Could not load suggestions.");
      }

      setRequests(json.requests ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load suggestions.");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(id: string, status: FeatureStatus) {
    setUpdatingId(id);
    try {
      const response = await fetch("/api/admin/feature-requests", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ id, status }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Could not update suggestion.");
      }

      setRequests((current) =>
        current.map((request) => request.id === id ? json.request : request)
      );
      toast.success(`Marked ${formatStatus(status).toLowerCase()}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update suggestion.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <Lightbulb className="h-4 w-4" />
              Internal
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">Suggestion Review</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Triage user ideas into the product queue.
            </p>
          </div>
          <Badge className="w-fit border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700 hover:bg-orange-50">
            {filteredRequests.length} visible
          </Badge>
        </section>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <form onSubmit={loadRequests} className="grid gap-3 md:grid-cols-[minmax(220px,320px)_180px_minmax(160px,1fr)_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="admin-key">Admin Key</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="admin-key"
                    type="password"
                    value={adminKey}
                    onChange={(event) => setAdminKey(event.target.value)}
                    className="min-h-11 pl-9"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as FeatureStatus | "all")}
                  className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-search">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="request-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-h-11 pl-9"
                    placeholder="Title, details, user"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="min-h-11 gap-2">
                <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Load
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <Card key={item} className="border-slate-200">
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white">
            <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
              <Lightbulb className="h-10 w-10 text-orange-500" />
              <div>
                <CardTitle className="text-lg">No suggestions found</CardTitle>
                <CardDescription className="mt-1">Load the queue or change the filter.</CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
                          {request.category}
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
                      <CardTitle className="text-lg leading-snug">{request.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {request.profile?.display_name || request.profile?.username || request.user_id}
                        {" "}· {formatDate(request.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{request.details}</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={request.status === status ? "default" : "outline"}
                        size="sm"
                        disabled={updatingId === request.id || request.status === status}
                        onClick={() => updateStatus(request.id, status)}
                        className="min-h-10"
                      >
                        {formatStatus(status)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
