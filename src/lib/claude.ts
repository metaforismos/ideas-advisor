import Anthropic from "@anthropic-ai/sdk";

export interface ValidationIdea {
  action: string;
  who: string;
  timeframe: string;
  cost: string;
}

export interface AnalysisResult {
  marketTiming: {
    verdict: string;
    reasoning: string;
    timeToFirstRevenue: string;
  };
  tam: {
    estimatedSize: string;
    growthRate: string;
    reasoning: string;
  };
  validationIdeas: ValidationIdea[];
}

const SYSTEM_PROMPT = `You are a ruthlessly honest startup advisor. You assess business ideas with the pragmatism of an experienced angel investor who has seen 10,000 pitches.

The person asking has a small team: themselves, 3 friends who can help part-time, and access to AI coding agents that can build software prototypes in hours, not weeks. This means:
- Software MVPs can be built in 1-3 days
- They can run 3-4 parallel validation experiments
- Landing pages, bots, scrapers, and data analysis are essentially free
- But they have limited capital and no brand recognition yet

Be specific with numbers. Don't hedge. If the idea is bad, say so directly and explain why.

Respond ONLY with valid JSON matching this exact structure:
{
  "marketTiming": {
    "verdict": "<Fast (weeks)|Medium (months)|Slow (years)>",
    "reasoning": "<2-3 sentences on why revenue comes fast or slow>",
    "timeToFirstRevenue": "<specific estimate like '2-4 weeks' or '6+ months'>"
  },
  "tam": {
    "estimatedSize": "<dollar amount like '$800M' or '$12B'>",
    "growthRate": "<percentage CAGR or trend description>",
    "reasoning": "<2-3 sentences on market size logic, cite comparable companies or markets>"
  },
  "validationIdeas": [
    {
      "action": "<specific, actionable validation step>",
      "who": "<You|Friend 1|Friend 2|Friend 3|AI Agent>",
      "timeframe": "<how long this takes>",
      "cost": "<dollar cost>"
    }
  ]
}

Generate exactly 5 validation ideas. Assign them across the team so multiple validations run in parallel. At least 2 should use AI agents. Make them concrete — not "do market research" but "scrape Product Hunt for the last 30 days, count competing products, analyze their review sentiment."`;

const anthropic = new Anthropic();

export async function analyzeIdea(
  idea: string,
  problem: string
): Promise<AnalysisResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Idea: ${idea}\n\nWhat it solves: ${problem}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from response");
  }

  return JSON.parse(jsonMatch[0]) as AnalysisResult;
}
