import Link from "next/link";

const artists = [
  {
    name: "ANIMAL",
    genre: "DJ / Producer",
    image: "/artists/animal.jpg",
    desc: "Eric Mills. DJ, producer, 25+ years. WLP founder.",
    href: "/artists/animal",
    badge: "wlp",
    checklist: [
      { label: "Photos", done: true },
      { label: "Bio", done: true },
      { label: "Spotify Page", done: true },
      { label: "Press Kit", done: true },
      { label: "Pitch Deck", done: true },
      { label: "EPK", done: true },
    ],
  },
  {
    name: "JusNiiga",
    genre: "Afro EDM",
    image: "/artists/jusniiga.jpg",
    desc: "Afro EDM fusion — infectious rhythms meet electronic energy. A sound that bridges continents and dancefloors.",
    href: "/artists/jusniiga",
    badge: "wlp",
    checklist: [
      { label: "Photos", done: true },
      { label: "Bio", done: false },
      { label: "Intro Video", done: false },
      { label: "Social Profiles", done: false },
      { label: "Press Kit", done: false },
      { label: "First Release", done: false },
    ],
  },
  {
    name: "Kade Rivers",
    genre: "Rock",
    image: "/artists/kade-rivers.jpg",
    desc: "Guitar-forward rock that hits before you process it. Classic credibility meets modern production — mainstream-ready without losing the edge.",
    href: "/artists/kade-rivers",
    badge: "ai",
    checklist: [
      { label: "AI Photos", done: true },
      { label: "Bio", done: true },
      { label: "Intro Video", done: false },
      { label: "Social Profiles", done: false },
      { label: "Press Kit", done: false },
      { label: "First Release", done: false },
    ],
  },
  {
    name: "Madison Blair",
    genre: "Pop",
    image: "/artists/madison-blair.jpg",
    desc: "Bright, energetic pop built for radio and streaming. High visual appeal with a sound that crosses comfortably into Top 40.",
    href: "/artists/madison-blair",
    badge: "ai",
    checklist: [
      { label: "AI Photos", done: true },
      { label: "Bio", done: true },
      { label: "Intro Video", done: false },
      { label: "Social Profiles", done: false },
      { label: "Press Kit", done: false },
      { label: "First Release", done: true },
    ],
  },
  {
    name: "Aria Vale",
    genre: "Electronic / Pop",
    image: "/artists/aria-vale.jpg",
    desc: "Electronic and pop woven together — pulsing synths, crystalline vocals, and a visual presence that cuts through the noise.",
    href: "/artists/aria-vale",
    badge: "ai",
    checklist: [
      { label: "AI Photos", done: true },
      { label: "Bio", done: true },
      { label: "Intro Video", done: false },
      { label: "Social Profiles", done: false },
      { label: "Press Kit", done: false },
      { label: "First Release", done: false },
    ],
  },
];

export default function ArtistsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
        🎤 Artists
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        WLP artist roster · Click an artist to view their page
      </p>

      {/* Artist cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {artists.map((a) => (
          <Link key={a.name} href={a.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ width: "100%", height: 220, background: "var(--bg)", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={a.image} 
                  alt={a.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 6 }}>{a.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "var(--accent)", background: "rgba(155,93,229,0.15)",
                    padding: "1px 7px", borderRadius: 20,
                  }}>
                    {a.genre}
                  </span>
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#06b6d4",
                    background: "rgba(6,182,212,0.1)",
                    padding: "1px 7px", borderRadius: 20,
                  }}>
                    {a.badge === "wlp" ? "Artist" : "AI Artist"}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>{a.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Checklists Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {artists.map((a) => (
          <div key={`${a.name}-checklist`} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 14px" }}>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 12, color: "var(--text)" }}>{a.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {a.checklist.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem" }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                    background: item.done ? "#22c55e" : "var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", color: item.done ? "#fff" : "transparent",
                  }}>
                    ✓
                  </span>
                  <span style={{ color: item.done ? "var(--text)" : "var(--muted)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{
                height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: "linear-gradient(90deg, #9b5de5, #c77dff)",
                  width: `${(a.checklist.filter(i => i.done).length / a.checklist.length) * 100}%`,
                }} />
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6, textAlign: "right" }}>
                {a.checklist.filter(i => i.done).length}/{a.checklist.length} complete
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
