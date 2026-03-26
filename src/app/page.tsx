"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Lightbulb,
  Clock,
  TrendingUp,
  FlaskConical,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/claude";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, problem }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function verdictColor(verdict: string) {
    if (verdict.toLowerCase().includes("fast"))
      return "bg-emerald-100 text-emerald-800";
    if (verdict.toLowerCase().includes("medium"))
      return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  }

  function assigneeColor(who: string) {
    if (who.toLowerCase().includes("agent")) return "text-purple-600 font-medium";
    if (who.toLowerCase().includes("friend")) return "text-blue-600 font-medium";
    return "text-foreground font-medium";
  }

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Lightbulb className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight">Ideas Advisor</h1>
          </div>
          <p className="text-muted-foreground">
            Drop your business idea and get an honest AI assessment
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="idea"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Your idea in one sentence
                </label>
                <Input
                  id="idea"
                  placeholder="e.g. An AI tool that writes cold emails for freelancers"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="problem"
                  className="mb-1.5 block text-sm font-medium"
                >
                  What problem does it solve?
                </label>
                <Textarea
                  id="problem"
                  placeholder="e.g. Freelancers spend 2+ hours/day writing outreach emails that get ignored. This generates personalized emails based on the prospect's LinkedIn profile."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  disabled={loading}
                  rows={4}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !idea.trim() || !problem.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Idea"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Market Timing */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Market Timing</CardTitle>
                </div>
                <CardDescription>How fast can it make money?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${verdictColor(result.marketTiming.verdict)}`}
                  >
                    {result.marketTiming.verdict}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    First revenue: {result.marketTiming.timeToFirstRevenue}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  {result.marketTiming.reasoning}
                </p>
              </CardContent>
            </Card>

            {/* TAM */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    Total Addressable Market
                  </CardTitle>
                </div>
                <CardDescription>How big is the opportunity?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    {result.tam.estimatedSize}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {result.tam.growthRate}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  {result.tam.reasoning}
                </p>
              </CardContent>
            </Card>

            {/* Validation Plan */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Validation Plan</CardTitle>
                </div>
                <CardDescription>
                  5 parallel experiments to validate fast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.validationIdeas.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-lg border p-3"
                    >
                      <p className="mb-2 text-sm">{v.action}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className={assigneeColor(v.who)}>{v.who}</span>
                        <span>{v.timeframe}</span>
                        <span>{v.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
