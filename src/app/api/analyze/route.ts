import { NextRequest, NextResponse } from "next/server";
import { analyzeIdea } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const { idea, problem } = await request.json();

  if (!idea?.trim() || !problem?.trim()) {
    return NextResponse.json(
      { error: "Both fields are required" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeIdea(idea.trim(), problem.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
