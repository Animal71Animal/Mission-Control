"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WeatherData {
  temp: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
}

interface NewsStory {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
}

interface AnalysisResult {
  left: string;
  right: string;
  truth: string;
  topic: string;
}

// News API key is now handled server-side for security

function LoadingDots() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 400);
    return () => clearInterval(iv);
  }, []);
  return <span style={{ color: "#9b5de5" }}>{dots}</span>;
}

function AnalysisCards({ result }: { result: AnalysisResult }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginTop: 16,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderLeft: "4px solid #4a90d9",
          borderRadius: 8,
          padding: "14px 16px",
        }}
      >
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4a90d9", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🔵 Left
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{result.left}</p>
      </div>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderLeft: "4px solid #e05c5c",
          borderRadius: 8,
          padding: "14px 16px",
        }}
      >
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e05c5c", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🔴 Right
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{result.right}</p>
      </div>
      <div
        style={{
          background: "rgba(0, 200, 124, 0.05)",
          border: "1px solid rgba(0, 200, 124, 0.2)",
          borderLeft: "4px solid #00c87c",
          borderRadius: 8,
          padding: "14px 16px",
        }}
      >
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00c87c", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ⚖️ Truth
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{result.truth}</p>
      </div>
    </div>
  );
}

function NewsStoryCard({ story }: { story: NewsStory }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeStory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/unfiltered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: story.title }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const categoryColors: Record<string, { bg: string; color: string }> = {
    Tech: { bg: "#1a2f3d", color: "#63b3ed" },
    AI: { bg: "#2d1f4a", color: "#b794f4" },
    Music: { bg: "#1f2d1f", color: "#68d391" },
  };
  const tagStyle = categoryColors[story.category] || { bg: "#1e1e2e", color: "#aaa" };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 18px",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "2px 7px",
              borderRadius: 4,
              display: "inline-block",
              marginBottom: 6,
              background: tagStyle.bg,
              color: tagStyle.color,
            }}
          >
            {story.category}
          </span>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.4, color: "var(--text)", margin: 0 }}>
            {story.title}
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
            {story.summary}
          </p>
          <span style={{ fontSize: "0.7rem", color: "#666" }}>Source: {story.source}</span>
        </div>
        <button
          onClick={analyzeStory}
          disabled={loading}
          style={{
            background: loading ? "rgba(155,93,229,0.3)" : "rgba(155,93,229,0.15)",
            border: "1px solid rgba(155,93,229,0.4)",
            color: loading ? "#aaa" : "#9b5de5",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          {loading ? (
            <>Analyzing<LoadingDots /></>
          ) : analysis ? (
            "Re-analyze ↺"
          ) : (
            "Analyze →"
          )}
        </button>
      </div>

      {error && <p style={{ color: "#e05c5c", fontSize: "0.8rem", marginTop: 8 }}>⚠️ {error}</p>}
      {analysis && !loading && <AnalysisCards result={analysis} />}
    </div>
  );
}

export default function BriefPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [news, setNews] = useState<NewsStory[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Fetch weather on mount
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=43.6166&longitude=-116.2008&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America/Boise")
      .then((r) => r.json())
      .then((data) => {
        const current = data.current;
        const daily = data.daily;
        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: getWeatherCondition(current.weather_code),
          high: Math.round(daily.temperature_2m_max[0]),
          low: Math.round(daily.temperature_2m_min[0]),
          humidity: current.relative_humidity_2m,
        });
        setWeatherLoading(false);
      })
      .catch(() => setWeatherLoading(false));
  }, []);

  // Fetch news on mount
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setNews(data.stories || []);
        setNewsLoading(false);
      } catch (e) {
        setNewsError("Failed to load news");
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>
          ☀️ Morning Brief
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.875rem" }}>
          {todayStr} · Updated every page load
        </p>
      </div>

      {/* Schedule card — Phone call */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        fontSize: "0.9rem",
      }}>
        <span>📞 <strong style={{ color: "var(--text)" }}>Daily Briefing Call</strong></span>
        <span style={{ color: "var(--border)" }}>·</span>
        <span style={{ color: "var(--muted)" }}>10:00 AM MDT</span>
        <span style={{ color: "var(--border)" }}>·</span>
        <span style={{ color: "var(--muted)" }}>PriScylla Claw 🦞</span>
      </div>

      {/* Weather */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 14 }}>
          🌤️ Weather — Boise, ID
        </div>
        {weatherLoading ? (
          <div style={{ color: "var(--muted)", padding: "20px" }}>Loading weather...</div>
        ) : weather ? (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "3rem" }}>⛅</div>
            <div>
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>
                {weather.temp}°F
              </span>
              <span style={{ fontSize: "0.9rem", color: "var(--muted)", marginLeft: 12 }}>
                ↑ {weather.high}° · ↓ {weather.low}°
              </span>
            </div>
            <div style={{ height: 40, width: 1, background: "var(--border)" }} />
            <div>
              <span style={{ fontSize: "1rem", color: "var(--text)" }}>{weather.condition}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginLeft: 12 }}>
                Humidity: {weather.humidity}%
              </span>
            </div>
          </div>
        ) : (
          <div style={{ color: "#e05c5c" }}>Failed to load weather</div>
        )}
      </div>

      {/* Unfiltered */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>⚖️ Unfiltered</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "4px 0 0" }}>Any story — left narrative, right narrative, and the truth.</p>
          </div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <UnfilteredWidget />
        </div>
      </div>

      {/* News Stories */}
      <div>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 14 }}>
          📰 Top Stories — Tech, AI & Music
        </div>
        {newsLoading ? (
          <div style={{ color: "var(--muted)", padding: "20px" }}>Loading news stories...</div>
        ) : newsError ? (
          <div style={{ color: "#e05c5c", padding: "20px" }}>{newsError}</div>
        ) : (
          news.map((story, i) => <NewsStoryCard key={i} story={story} />)
        )}
      </div>
    </div>
  );
}

function UnfilteredWidget() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const hotTopics = ["US Tariffs 2026", "Gaza Ceasefire", "AI Regulation", "Federal Reserve", "Immigration Policy", "Tech Layoffs"];

  const analyze = async (t: string) => {
    if (!t.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/unfiltered", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: t }) });
      const data = await res.json();
      setResult(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze(topic)}
          placeholder="Type any topic..."
          style={{ flex: 1, background: "var(--bg, #0d0d12)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: "0.9rem", outline: "none" }}
        />
        <button onClick={() => analyze(topic)} disabled={loading} style={{ background: "#9b5de5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem", opacity: loading ? 0.6 : 1 }}>
          {loading ? "..." : "Analyze"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {hotTopics.map((t) => (
          <button key={t} onClick={() => { setTopic(t); analyze(t); }} style={{ background: "transparent", border: "1px solid #9b5de5", color: "#9b5de5", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      {loading && <div style={{ color: "var(--muted)", fontSize: "0.85rem", padding: "12px 0" }}>Searching across the spectrum...</div>}
      {result && (
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 12 }}>⚖️ <strong style={{ color: "var(--text)" }}>{result.topic}</strong></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {[
              { label: "🔵 Left Narrative", color: "#4a90d9", text: result.left },
              { label: "🔴 Right Narrative", color: "#e05c5c", text: result.right },
              { label: "⚖️ Most Likely Truth", color: "#00c87c", text: result.truth },
            ].map((card) => (
              <div key={card.label} style={{ background: "var(--bg, #0d0d12)", border: `1px solid var(--border)`, borderLeft: `4px solid ${card.color}`, borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: card.color, marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.6 }}>{card.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm",
  };
  return conditions[code] || "Unknown";
}
