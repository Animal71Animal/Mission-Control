"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function RootLayoutWrapper() {
  const pathname = usePathname();
  const isShared = pathname.startsWith("/shared");

  if (isShared) {
    return null; // Don't render sidebar on shared pages
  }

  return <Sidebar />;
}
