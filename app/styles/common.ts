// Shared style utilities for Mission Control pages
// Centralizes common inline style patterns to reduce duplication

export const styles = {
  // Page headers
  pageHeader: {
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: "1.8rem",
    fontWeight: 700,
    margin: 0,
    background: "linear-gradient(135deg, #9b5de5, #c77dff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  pageSubtitle: {
    color: "var(--muted)",
    marginTop: 6,
    fontSize: "0.9rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: "0 0 8px",
    color: "var(--text)",
  },
  sectionSubtitle: {
    color: "var(--muted)",
    margin: "0 0 28px",
    fontSize: "0.875rem",
  },

  // Cards
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 20,
  },
  cardWithAccent: (accentColor: string) => ({
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderLeft: `4px solid ${accentColor}`,
    borderRadius: 8,
    padding: 20,
  }),
  cardHighlighted: (accentColor: string) => ({
    background: "var(--card)",
    border: `1px solid ${accentColor}`,
    borderLeft: `4px solid ${accentColor}`,
    borderRadius: 8,
    padding: 20,
    boxShadow: `0 0 16px ${accentColor}20`,
  }),

  // Grids
  grid4Col: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 16,
  },
  grid3Col: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
    marginBottom: 16,
  },

  // Tables / Lists
  tableHeader: {
    display: "grid",
    padding: "0 0 8px",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.7rem",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  tableRow: (isLast: boolean) => ({
    display: "grid",
    padding: "10px 0",
    borderBottom: isLast ? "none" : "1px solid var(--border)",
    fontSize: "0.85rem",
    alignItems: "center",
  }),

  // Stats
  statValue: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "var(--accent2)",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "var(--muted)",
    marginTop: 4,
  },

  // Text colors
  textMuted: { color: "var(--muted)" },
  textAccent: { color: "var(--accent2)", fontWeight: 600 },
  textBody: {
    fontSize: "0.875rem",
    color: "var(--text)",
    lineHeight: 1.6,
  },

  // Form elements
  input: {
    padding: "12px 16px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: "0.95rem",
    outline: "none",
  },
  button: (isDisabled: boolean) => ({
    padding: "12px 24px",
    background: isDisabled ? "#6b3fa8" : "#9b5de5",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.7 : 1,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  }),

  // Tags / Chips
  tag: (color: string) => ({
    display: "inline-block",
    padding: "4px 10px",
    background: "var(--card)",
    border: `1px solid ${color}40`,
    borderRadius: 20,
    color,
    fontSize: "0.78rem",
    cursor: "pointer",
    transition: "border-color 0.15s",
  }),

  // Loading / Error states
  loadingContainer: {
    textAlign: "center" as const,
    padding: "60px 20px",
    color: "var(--muted)",
  },
  errorContainer: {
    padding: 16,
    background: "rgba(224,92,92,0.1)",
    border: "1px solid rgba(224,92,92,0.3)",
    borderRadius: 8,
    color: "#e05c5c",
    fontSize: "0.9rem",
  },
};

// Dot colors for link lists (used in WLP page)
export const dotColors: Record<string, string> = {
  purple: "#7f5af0",
  green: "#2cb67d",
  red: "#ff6b6b",
  yellow: "#ffd166",
  blue: "#4fc3f7",
  orange: "#ff9800",
  pink: "#f06292",
  teal: "#26c6da",
  white: "#e0e0e0",
};

// Section header component styles
export const sectionHeaderStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid var(--border)",
  },
  icon: {
    fontSize: "1.2rem",
  },
  title: {
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "var(--muted)",
    margin: 0,
  },
};
