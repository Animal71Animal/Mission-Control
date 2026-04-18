import { NextRequest, NextResponse } from "next/server";

// Unfiltered analysis - uses AI to analyze actual article content
const ABACUS_API_KEY = process.env.ABACUSAI_API_KEY;
const ABACUS_BASE_URL = "https://routellm.abacus.ai/v1";

interface AnalysisResult {
  topic: string;
  left: string;
  right: string;
  truth: string;
}

async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    // Use a simple fetch to get article content
    // Note: Many sites block this, so we'll fall back to title-based analysis
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      timeout: 5000
    } as any);
    
    if (!res.ok) return null;
    
    const html = await res.text();
    // Extract text from article (basic)
    const textMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                     html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                     html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    
    if (textMatch) {
      // Strip HTML tags
      return textMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 3000);
    }
    return null;
  } catch {
    return null;
  }
}

async function analyzeWithAI(topic: string, content?: string): Promise<AnalysisResult> {
  const prompt = content 
    ? `Analyze this news article and provide three perspectives:

ARTICLE: ${content.substring(0, 2000)}

Provide:
1. LEFT: The progressive/left-wing perspective on this issue (2-3 sentences)
2. RIGHT: The conservative/right-wing perspective on this issue (2-3 sentences)  
3. TRUTH: A balanced, nuanced assessment of the actual facts and complexities (2-3 sentences)

Format as JSON: {"left": "...", "right": "...", "truth": "..."}`
    : `Analyze this topic and provide three perspectives:

TOPIC: ${topic}

Provide:
1. LEFT: The progressive/left-wing perspective on this issue (2-3 sentences)
2. RIGHT: The conservative/right-wing perspective on this issue (2-3 sentences)
3. TRUTH: A balanced, nuanced assessment of the actual facts and complexities (2-3 sentences)

Format as JSON: {"left": "...", "right": "...", "truth": "..."}`;

  try {
    const res = await fetch(`${ABACUS_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ABACUS_API_KEY}`
      },
      body: JSON.stringify({
        model: "abacus/claude-sonnet-4-6",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      throw new Error(`AI API error: ${res.status}`);
    }

    const data = await res.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        topic,
        left: parsed.left || parsed.LEFT || "Analysis unavailable",
        right: parsed.right || parsed.RIGHT || "Analysis unavailable",
        truth: parsed.truth || parsed.TRUTH || "Analysis unavailable"
      };
    }
    
    // Fallback: parse manually
    const leftMatch = aiResponse.match(/(?:LEFT|Left):?\s*(.+?)(?=\n(?:RIGHT|Right):|$)/s);
    const rightMatch = aiResponse.match(/(?:RIGHT|Right):?\s*(.+?)(?=\n(?:TRUTH|Truth):|$)/s);
    const truthMatch = aiResponse.match(/(?:TRUTH|Truth):?\s*(.+?)$/s);
    
    return {
      topic,
      left: leftMatch?.[1]?.trim() || "Progressive perspective analysis unavailable",
      right: rightMatch?.[1]?.trim() || "Conservative perspective analysis unavailable",
      truth: truthMatch?.[1]?.trim() || "Balanced analysis unavailable"
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    // Fallback to keyword-based
    return fallbackAnalysis(topic);
  }
}

function fallbackAnalysis(topic: string): AnalysisResult {
  const t = topic.toLowerCase();
  
  if (t.includes("tariff") || t.includes("trade")) {
    return {
      topic,
      left: "Tariffs protect American workers and industries from unfair foreign competition. The government should prioritize domestic manufacturing jobs over cheap imports.",
      right: "Tariffs are taxes that raise prices for consumers and invite retaliation. Free trade benefits everyone through lower costs and market efficiency.",
      truth: "Tariffs historically protect specific industries while raising costs broadly. Their effectiveness depends on implementation, duration, and whether trading partners retaliate."
    };
  } else if (t.includes("ai") || t.includes("artificial intelligence")) {
    return {
      topic,
      left: "AI needs strong regulation to prevent job displacement, bias, and corporate overreach. Workers and privacy must be protected before profits.",
      right: "Excessive AI regulation stifles innovation and cedes ground to China. Market competition, not government, should guide development.",
      truth: "AI presents genuine risks (bias, job loss, concentration of power) and benefits (productivity, health, science). Balanced oversight with innovation incentives is the challenge."
    };
  } else if (t.includes("gaza") || t.includes("israel") || t.includes("palestine")) {
    return {
      topic,
      left: "Palestinian civilians are suffering disproportionately. International law and human rights must be upheld regardless of security concerns.",
      right: "Israel has a right to defend itself against terrorist attacks. Ceasefires without hostage release reward aggression.",
      truth: "The conflict involves legitimate security concerns on both sides and civilian suffering. Sustainable solutions require addressing root causes, not just symptoms."
    };
  } else if (t.includes("fed") || t.includes("interest rate") || t.includes("inflation")) {
    return {
      topic,
      left: "The Fed should prioritize full employment over inflation fighting. Rate hikes hurt working people while corporations profit.",
      right: "The Fed must control inflation even if it causes short-term pain. Loose monetary policy created this problem.",
      truth: "Monetary policy involves tradeoffs between inflation and employment. The Fed's tools are blunt instruments affecting the entire economy."
    };
  } else if (t.includes("immigration") || t.includes("border")) {
    return {
      topic,
      left: "Immigrants strengthen the economy and deserve humane treatment. Border enforcement should not violate human rights or separate families.",
      right: "Secure borders are essential for national sovereignty and safety. Current policies incentivize illegal crossings.",
      truth: "Immigration has economic benefits and security challenges. The system is outdated and politically exploited by both sides."
    };
  } else if (t.includes("tech layoff") || t.includes("layoffs")) {
    return {
      topic,
      left: "Tech companies prioritized profits over people. Workers need stronger protections against sudden mass layoffs.",
      right: "Companies must adapt to market conditions. Overhiring during the pandemic was unsustainable.",
      truth: "Tech overhired during COVID boom and corrected as growth slowed. Workers bear the cost of poor forecasting."
    };
  }
  
  return {
    topic,
    left: `Progressive view: ${topic} requires government intervention to ensure fairness and protect vulnerable populations from market excesses.`,
    right: `Conservative view: ${topic} is best addressed through free markets and individual responsibility, not government expansion.`,
    truth: `The reality of ${topic} is complex, involving tradeoffs between competing values. Simple solutions rarely capture the full picture.`
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, url, content } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    let articleContent = content;
    
    // If URL provided, try to fetch article content
    if (url && !content) {
      articleContent = await fetchArticleContent(url) || undefined;
    }

    // Use AI for analysis
    const analysis = await analyzeWithAI(topic, articleContent);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Unfiltered analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
