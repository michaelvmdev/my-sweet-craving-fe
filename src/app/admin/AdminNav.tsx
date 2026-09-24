"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "Inicio", icon: "🏠", exact: true },
  { href: "/admin/productos", label: "Productos", icon: "🍰", exact: false },
  { href: "/admin/productos/nuevo", label: "Nuevo producto", icon: "➕", exact: true },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(item: (typeof items)[number]) {
    if (item.exact) return pathname === item.href;
    // "Productos" queda activo en el listado y en la edición, pero no en "nuevo".
    return pathname.startsWith(item.href) && pathname !== "/admin/productos/nuevo";
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <aside className="bg-[#6B1235] text-white md:w-60 md:min-h-screen md:sticky md:top-0 md:self-start shrink-0">
      <div className="px-5 py-4 md:py-6 flex items-center justify-between md:block">
        <div>
          <p className="font-serif text-lg font-bold leading-tight">Mi Dulce Antojo</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">Administración</p>
        </div>
      </div>

      <nav className="flex md:flex-col gap-1 px-3 pb-3 md:pb-0 overflow-x-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item) ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex flex-col gap-1 px-3 mt-6 border-t border-white/10 pt-4">
        <Link
          href="/"
          target="_blank"
          className="rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
        >
          ↗ Ver sitio
        </Link>
        <button
          onClick={logout}
          className="text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
        >
          ⎋ Cerrar sesión
        </button>
      </div>
      <div className="md:hidden flex gap-1 px-3 pb-3">
        <Link href="/" target="_blank" className="rounded-xl px-3 py-2 text-xs text-white/75 hover:bg-white/10">
          ↗ Ver sitio
        </Link>
        <button onClick={logout} className="rounded-xl px-3 py-2 text-xs text-white/75 hover:bg-white/10">
          ⎋ Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
