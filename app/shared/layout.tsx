import type { Metadata } from "next";
import "../globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Shared Document",
  description: "Public shared document",
};

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh", margin: 0, padding: 0 }}>
        <AnimatedBackground />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
          <main style={{ flex: 1, padding: "32px", overflowY: "auto", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
