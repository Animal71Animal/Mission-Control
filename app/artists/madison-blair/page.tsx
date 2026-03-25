import Link from "next/link";
import Card from "@/components/Card";

export default function MadisonBlairPage() {
  return (
    <div>
      <Link href="/artists" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
        ← Back to Artists
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 28, marginTop: 12 }}>
        <div>
          <img
            src="/artists/madison-blair.jpg"
            alt="Madison Blair"
            width={320}
            height={400}
            style={{ borderRadius: 12, width: "100%", height: "auto", objectFit: "cover" }}
          />
        </div>

        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>
            Madison Blair
          </h1>
          <div style={{
            display: "inline-block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "var(--accent)", background: "rgba(155,93,229,0.15)",
            padding: "3px 10px", borderRadius: 20, marginBottom: 20
          }}>
            Pop
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card title="About">
              <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
                Madison Blair is a bright, energetic pop artist built for mainstream radio and streaming. High visual appeal and a sound that crosses comfortably into Top 40. Ready for brand deals and sync licensing opportunities.
              </p>
            </Card>

            <Card title="Details">
              <div style={{ fontSize: "0.875rem", lineHeight: 2 }}>
                <div><strong>Genre:</strong> Pop</div>
                <div><strong>Label:</strong> Wicked Liquid Productions</div>
                <div><strong>Status:</strong> <span style={{ color: "#22c55e" }}>Active</span></div>
                <div><strong>Manager:</strong> ANIMAL (Eric Mills)</div>
              </div>
            </Card>

            <Card title="Video Prompts">
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>
                <a href="/docs/video-prompts" style={{color:"var(--accent2)",textDecoration:"none",fontWeight:600}}>📄 View Kling AI Video Prompts ↗</a>
                <code style={{ color: "var(--accent2)", background: "var(--bg)", padding: "1px 6px", borderRadius: 4 }}>
                  /docs/video-prompts
                </code>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
