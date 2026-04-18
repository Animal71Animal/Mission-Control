export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const ABACUS_API_KEY = process.env.ABACUSAI_API_KEY || process.env.ABACUS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, source, category } = body;

    if (!title) {
      return NextResponse.json({ error: "No story title provided" }, { status: 400 });
    }

    if (!ABACUS_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a balanced news analyst. Analyze this news story from multiple perspectives.

Story: "${title}"
Summary: "${summary || "No summary available"}"
Source: "${source || "Unknown"}"
Category: "${category || "General"}"

Provide a structured analysis with exactly these 3 sections. Be concise (2-3 sentences each):

LEFT: [Progressive/liberal perspective on this story]
RIGHT: [Conservative perspective on this story]
TRUTH: [Balanced factual analysis - what's actually happening without spin]

Return ONLY valid JSON like this:
{
  "left": "...",
  "right": "...",
  "truth": "..."
}`;

    const response = await fetch("https://routellm.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ABACUS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse LLM response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      topic: title,
      left: analysis.left || "No left perspective available.",
      right: analysis.right || "No right perspective available.",
      truth: analysis.truth || "No balanced analysis available.",
    });

  } catch (error: any) {
    console.error("Brief story error:", error);
    return NextResponse.json({
      topic: "Analysis unavailable",
      left: "Could not generate analysis.",
      right: "Could not generate analysis.",
      truth: error.message || "Unknown error occurred.",
    }, { status: 500 });
  }
}
