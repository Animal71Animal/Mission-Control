"use client";

import Link from "next/link";
import Card from "@/components/Card";

const artists = [
  {
    name: "ANIMAL",
    genre: "DJ / Producer",
    image: "/artists/animal.jpg",
    href: "/artists/animal",
    badge: "WLP Founder",
    badgeColor: "#06b6d4",
  },
  {
    name: "Kade Rivers",
    genre: "Rock",
    image: "/kade-rivers.jpg",
    href: "/artists/kade-rivers",
    badge: "WLP",
    badgeColor: "#9b5de5",
  },
  {
    name: "Madison Blair",
    genre: "Pop",
    image: "/artists/madison-blair.jpg",
    href: "/artists/madison-blair",
    badge: "WLP",
    badgeColor: "#9b5de5",
  },
  {
    name: "Aria Vale",
    genre: "Electronic / Pop",
    image: "/artists/aria-vale.jpg",
    href: "/artists/aria-vale",
    badge: "WLP",
    badgeColor: "#9b5de5",
  },
];

export default function ArtistsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
        🎤 Artists
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        WLP roster — AI artists and ANIMAL
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
        {artists.map((artist) => (
          <Link key={artist.name} href={artist.href} style={{ textDecoration: "none" }}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <img
                src={artist.image}
                alt={artist.name}
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text)" }}>{artist.name}</h3>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: artist.badgeColor,
                    background: `${artist.badgeColor}20`, padding: "2px 8px", borderRadius: 20,
                  }}>
                    {artist.badge}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>{artist.genre}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
