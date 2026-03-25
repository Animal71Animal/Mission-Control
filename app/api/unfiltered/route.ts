import { NextRequest, NextResponse } from "next/server";

// Unfiltered analysis - returns left/right/truth perspectives on any topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    // Generate analysis based on topic keywords
    const t = topic.toLowerCase();
    
    // Default analysis structure
    let analysis = {
      topic,
      left: "",
      right: "",
      truth: "",
    };

    // Topic-specific analysis (expandable)
    if (t.includes("tariff") || t.includes("trade")) {
      analysis.left = "Tariffs protect American workers and industries from unfair foreign competition. The government should prioritize domestic manufacturing jobs over cheap imports.";
      analysis.right = "Tariffs are taxes that raise prices for consumers and invite retaliation. Free trade benefits everyone through lower costs and market efficiency.";
      analysis.truth = "Tariffs historically protect specific industries while raising costs broadly. Their effectiveness depends on implementation, duration, and whether trading partners retaliate.";
    } else if (t.includes("ai") || t.includes("artificial intelligence")) {
      analysis.left = "AI needs strong regulation to prevent job displacement, bias, and corporate overreach. Workers and privacy must be protected before profits.";
      analysis.right = "Excessive AI regulation stifles innovation and cedes ground to China. Market competition, not government, should guide development.";
      analysis.truth = "AI presents genuine risks (bias, job loss, concentration of power) and benefits (productivity, health, science). Balanced oversight with innovation incentives is the challenge.";
    } else if (t.includes("gaza") || t.includes("israel") || t.includes("palestine")) {
      analysis.left = "Palestinian civilians are suffering disproportionately. International law and human rights must be upheld regardless of security concerns.";
      analysis.right = "Israel has a right to defend itself against terrorist attacks. Ceasefires without hostage release reward aggression.";
      analysis.truth = "The conflict involves legitimate security concerns on both sides and civilian suffering. Sustainable solutions require addressing root causes, not just symptoms.";
    } else if (t.includes("fed") || t.includes("interest rate") || t.includes("inflation")) {
      analysis.left = "The Fed should prioritize full employment over inflation fighting. Rate hikes hurt working people while corporations profit.";
      analysis.right = "The Fed must control inflation even if it causes short-term pain. Loose monetary policy created this problem.";
      analysis.truth = "Monetary policy involves tradeoffs between inflation and employment. The Fed's tools are blunt instruments affecting the entire economy.";
    } else if (t.includes("immigration") || t.includes("border")) {
      analysis.left = "Immigrants strengthen the economy and deserve humane treatment. Border enforcement should not violate human rights or separate families.";
      analysis.right = "Secure borders are essential for national sovereignty and safety. Current policies incentivize illegal crossings.";
      analysis.truth = "Immigration has economic benefits and security challenges. The system is outdated and politically exploited by both sides.";
    } else if (t.includes("tech layoff") || t.includes("layoffs")) {
      analysis.left = "Tech companies prioritized profits over people. Workers need stronger protections against sudden mass layoffs.";
      analysis.right = "Companies must adapt to market conditions. Overhiring during the pandemic was unsustainable.";
      analysis.truth = "Tech overhired during COVID boom and corrected as growth slowed. Workers bear the cost of poor forecasting.";
    } else {
      // Generic analysis for unknown topics
      analysis.left = `Progressive view: ${topic} requires government intervention to ensure fairness and protect vulnerable populations from market excesses.`;
      analysis.right = `Conservative view: ${topic} is best addressed through free markets and individual responsibility, not government expansion.`;
      analysis.truth = `The reality of ${topic} is complex, involving tradeoffs between competing values. Simple solutions rarely capture the full picture.`;
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Unfiltered analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
