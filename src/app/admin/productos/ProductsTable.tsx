"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminProductRow } from "@/lib/admin-products";

type Filter = "all" | "active" | "inactive";

export default function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (filter === "all" || (filter === "active") === p.active) &&
        (!q || p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q))
    );
  }, [products, query, filter]);

  async function toggle(p: AdminProductRow) {
    if (p.active && !confirm(`¿Desactivar "${p.name}"? Dejará de mostrarse en la web.`)) return;
    setBusyId(p.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      if (res.status === 401) {
        router.refresh(); // sesión vencida: vuelve al login
        return;
      }
      if (!res.ok) {
        setError((await res.json().catch(() => null))?.error ?? "No se pudo actualizar");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o categoría…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A4A]/30 focus:border-[#8B1A4A]"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Desactivados</option>
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-rose-50 text-left text-xs uppercase tracking-wider text-[#8B1A4A]">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 hidden xl:table-cell">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((p) => (
                <tr key={p.id} className={p.active ? "" : "bg-gray-50 text-gray-400"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-rose-50 flex items-center justify-center">
                          {p.categoryIcon ?? "🍰"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[#2d1b1b]">
                          {p.name} {p.featured && <span title="Destacado">⭐</span>}
                        </p>
                        <p className="text-xs text-gray-400 xl:hidden">
                          {p.categoryIcon} {p.categoryName}
                        </p>
                        <p className="text-xs text-gray-400 hidden xl:block">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
                    {p.categoryIcon} {p.categoryName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.price == null ? (
                      "Consultar"
                    ) : p.promotionalPrice != null ? (
                      <>
                        <span className="font-semibold">S/ {p.promotionalPrice}</span>{" "}
                        <span className="line-through text-gray-400">S/ {p.price}</span>
                      </>
                    ) : (
                      `S/ ${p.price}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {p.active ? "Activo" : "Desactivado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="rounded-full border border-[#8B1A4A] text-[#8B1A4A] px-3 py-1 text-xs font-semibold hover:bg-rose-50"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => toggle(p)}
                        disabled={busyId === p.id}
                        className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                          p.active
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {p.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    No hay productos que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
