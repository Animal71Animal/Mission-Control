export default function Card({
  title,
  children,
  className = "",
  style = {},
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent2)",
            marginBottom: 14,
            margin: "0 0 14px 0",
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
