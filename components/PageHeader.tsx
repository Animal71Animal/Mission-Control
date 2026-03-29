interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {icon && <span style={{ fontSize: "2rem" }}>{icon}</span>}
        <h1 style={{ 
          fontSize: "1.75rem", 
          fontWeight: 700, 
          margin: 0,
          background: "linear-gradient(135deg, #c77dff, #9b5de5)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.95rem" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
