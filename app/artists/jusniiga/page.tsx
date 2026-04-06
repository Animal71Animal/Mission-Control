import Link from "next/link";
import Card from "@/components/Card";

export default function JusNiigaPage() {
  return (
    <div>
      <Link href="/artists" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
        ← Back to Artists
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 28, marginTop: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/artists/jusniiga.jpg"
            alt="JusNiiga"
            style={{ borderRadius: 12, width: "100%", height: "auto", objectFit: "cover" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/artists/jusniiga-2.jpg"
            alt="JusNiiga"
            style={{ borderRadius: 12, width: "100%", height: "auto", objectFit: "cover" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/artists/jusniiga-3.jpg"
            alt="JusNiiga"
            style={{ borderRadius: 12, width: "100%", height: "auto", objectFit: "cover" }}
          />
        </div>

        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>
            JusNiiga
          </h1>
          <div style={{
            display: "inline-block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "var(--accent)", background: "rgba(155,93,229,0.15)",
            padding: "3px 10px", borderRadius: 20, marginBottom: 20
          }}>
            Afro EDM
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card title="About">
              <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
                JusNiiga brings Afro EDM fusion to the dancefloor — infectious rhythms layered over electronic energy that moves between continents and crowds. A sound that feels both rooted and forward-moving, built for stages and streaming alike.
              </p>
            </Card>

            <Card title="Details">
              <div style={{ fontSize: "0.875rem", lineHeight: 2 }}>
                <div><strong>Genre:</strong> Afro EDM</div>
                <div><strong>Label:</strong> Wicked Liquid Productions</div>
                <div><strong>Status:</strong> <span style={{ color: "#22c55e" }}>Active</span></div>
                <div><strong>Manager:</strong> ANIMAL (Eric Mills)</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
