"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// El panel /admin tiene su propio shell: oculta header, footer y botón de WhatsApp del sitio.
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
