import Link from "next/link";
import Card from "@/components/Card";

const CLIENT_ID = "d910e1504a60401d978f61c8dcc3258d";
const CLIENT_SECRET = "ac1769b3ff77460aa19ba7e4fdf10d3b";
const ARTIST_ID = "46iTWdydkf05rvSmmrbhDw";

async function getSpotifyData() {
  try {
    const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
      next: { revalidate: 3600 },
    });
    const { access_token } = await tokenRes.json();
    const headers = { Authorization: `Bearer ${access_token}` };

    const [artistRes, albumsRes] = await Promise.all([
      fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?limit=8&include_groups=album,single`, { headers, next: { revalidate: 3600 } }),
    ]);

    const artist = await artistRes.json();
    const albums = await albumsRes.json();

    return {
      followers: artist.followers?.total ?? null,
      popularity: artist.popularity ?? null,
      genres: artist.genres ?? [],
      releases: (albums.items || []).map((a: { name: string; album_type: string; release_date: string; external_urls: { spotify: string }; images: { url: string }[] }) => ({
        name: a.name,
        type: a.album_type,
        date: a.release_date,
        url: a.external_urls.spotify,
        image: a.images?.[0]?.url || null,
      })),
    };
  } catch {
    return null;
  }
}

export default async function AnimalPage() {
  const spotify = await getSpotifyData();

  return (
    <div>
      <Link href="/artists" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
        ← Back to Artists
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, marginTop: 12 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <img
            src="/artists/animal.jpg"
            alt="ANIMAL"
            width={300}
            height={300}
            style={{ borderRadius: 12, width: "100%", height: "auto", objectFit: "cover" }}
          />

          <Card title="Details">
            <div style={{ fontSize: "0.875rem", lineHeight: 2 }}>
              <div><strong>Genre:</strong> DJ / Producer</div>
              <div><strong>Label:</strong> Wicked Liquid Productions</div>
              <div><strong>Role:</strong> Founder, A&amp;R, DJ, Producer</div>
              <div><strong>Status:</strong> <span style={{ color: "#22c55e" }}>Active</span></div>
              {spotify?.followers && <div><strong>Spotify Followers:</strong> {spotify.followers.toLocaleString()}</div>}
              {spotify?.popularity && <div><strong>Popularity:</strong> {spotify.popularity}/100</div>}
            </div>
          </Card>

          <Card title="Links">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="https://open.spotify.com/artist/46iTWdydkf05rvSmmrbhDw" target="_blank" rel="noopener noreferrer"
                style={{ display: "block", textAlign: "center", background: "#1DB954", color: "#000", fontWeight: 600, fontSize: "0.8rem", padding: "9px", borderRadius: 8, textDecoration: "none" }}>
                Open on Spotify ↗
              </a>
              <a href="https://artists.spotify.com/c/artist/46iTWdydkf05rvSmmrbhDw/home" target="_blank" rel="noopener noreferrer"
                style={{ display: "block", textAlign: "center", background: "rgba(29,185,84,0.1)", color: "#1DB954", fontWeight: 600, fontSize: "0.8rem", padding: "9px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(29,185,84,0.3)" }}>
                Spotify for Artists ↗
              </a>
              <a href="https://animal-talent-manager.surge.sh" target="_blank" rel="noopener noreferrer"
                style={{ display: "block", textAlign: "center", background: "rgba(6,182,212,0.1)", color: "#06b6d4", fontWeight: 600, fontSize: "0.8rem", padding: "9px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(6,182,212,0.3)" }}>
                Pitch Deck ↗
              </a>
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>ANIMAL</h1>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", background: "rgba(6,182,212,0.15)", color: "#06b6d4", padding: "3px 10px", borderRadius: 20 }}>
                WLP
              </span>
            </div>
            <div style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", background: "rgba(155,93,229,0.15)", padding: "3px 10px", borderRadius: 20, marginBottom: 14 }}>
              DJ / Producer
            </div>
          </div>

          <Card title="Bio">
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
              Eric Mills (ANIMAL) is a DJ, producer, and musician with 25+ years in the industry. Drummer/percussionist since age 8 — his first musical love — with vocals, guitar, and keys in his arsenal. Studied music education at ECU and audio engineering at SAE Institute NYC — trained under Danny Wyatt (Curtis Mayfield, Norah Jones), John Siket (Phish, DMB), and Mike White (AC/DC, Whitney Houston).
            </p>
          </Card>

          <Card title="Highlights">
            <div style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 2 }}>
              <div>🏠 Held residencies and made guest appearances at some of the most iconic venues: The Playboy Mansion (LA), Winter Music Conference (MIA), The Groove Cruise (MIA), Mynt Lounge (MIA), Tongue and Groove (ATL), Opera/Eleven50 (ATL), Havana Room (ATL)</div>
              <div>🎤 Opened for arena acts and festival headliners across hip-hop, pop, and electronic music</div>
              <div>🎛️ Official remixes via Crooklyn Clan for hip-hop royalty (Eminem, Snoop, Jay-Z, Missy Elliott), pop/rock/electronic icons (Justin Timberlake, Usher, Lorde, John Legend, Linkin Park, Krewella)</div>
              <div>📻 Launched Raleigh, NC's first-ever FM broadcast EDM mixshow — Pulse 96.9 / 102.5, which he hosted for 3 years</div>
            </div>
          </Card>

          {/* Spotify embed */}
          <Card title="Spotify">
            <iframe
              src={`https://open.spotify.com/embed/artist/${ARTIST_ID}?utm_source=generator&theme=0`}
              width="100%"
              height="280"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: 10 }}
            />
          </Card>

          {/* Releases */}
          {spotify?.releases && spotify.releases.length > 0 && (
            <Card title="Releases">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                {spotify.releases.map((r: { name: string; type: string; date: string; url: string; image: string | null }) => (
                  <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div style={{ background: "var(--bg)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                      {r.image && <img src={r.image} alt={r.name} width={130} height={130} style={{ width: "100%", display: "block" }} />}
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>{r.type} · {r.date}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
