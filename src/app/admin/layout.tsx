import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdmin } from "@/lib/admin-auth";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await isAdmin();

  return (
    <div className="min-h-screen bg-[#FDF6F0] md:flex">
      {authed && <AdminNav />}
      <div className="flex-1 min-w-0 p-4 sm:p-8">{children}</div>
    </div>
  );
}
