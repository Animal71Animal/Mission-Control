import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface NewsArticle {
  title: string;
  description: string;
  source: { name: string };
  url: string;
}

interface NewsResponse {
  articles: NewsArticle[];
}

export async function GET(request: NextRequest) {
  if (!NEWS_API_KEY) {
    return NextResponse.json({ error: "NEWS_API_KEY not configured" }, { status: 500 });
  }

  try {
    const [techRes, aiRes, musicRes] = await Promise.all([
      fetch(`https://newsapi.org/v2/top-headlines?category=technology&pageSize=5&apiKey=${NEWS_API_KEY}`),
      fetch(`https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI&pageSize=5&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`),
      fetch(`https://newsapi.org/v2/everything?q=music+industry+OR+music+production&pageSize=5&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`),
    ]);

    const [techData, aiData, musicData] = (await Promise.all([
      techRes.json(),
      aiRes.json(),
      musicRes.json(),
    ])) as NewsResponse[];

    const stories = [
      ...(techData.articles || []).map((a) => ({
        title: a.title,
        summary: a.description || "No summary available",
        source: a.source?.name || "Unknown",
        url: a.url,
        category: "Tech",
      })),
      ...(aiData.articles || []).map((a) => ({
        title: a.title,
        summary: a.description || "No summary available",
        source: a.source?.name || "Unknown",
        url: a.url,
        category: "AI",
      })),
      ...(musicData.articles || []).map((a) => ({
        title: a.title,
        summary: a.description || "No summary available",
        source: a.source?.name || "Unknown",
        url: a.url,
        category: "Music",
      })),
    ];

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
