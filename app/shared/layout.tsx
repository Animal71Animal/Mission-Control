import "../globals.css";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Don't create nested HTML/body - just return children for root layout to handle
  return <>{children}</>;
}
