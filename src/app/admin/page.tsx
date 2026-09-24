import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import pool from "@/lib/db";
import LoginForm from "./LoginForm";

export default async function AdminHome() {
  if (!(await isAdmin())) return <LoginForm />;

  const { rows } = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE product_active)::int     AS active,
            COUNT(*) FILTER (WHERE NOT product_active)::int AS inactive
     FROM products`
  );
  const { active, inactive } = rows[0];

  const cards = [
    {
      href: "/admin/productos",
      icon: "🍰",
      title: "Productos",
      text: `${active} activos · ${inactive} desactivados. Edita o desactiva productos.`,
    },
    {
      href: "/admin/productos/nuevo",
      icon: "➕",
      title: "Nuevo producto",
      text: "Agrega un producto al catálogo.",
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-[#8B1A4A] mb-1">Panel de administración</h1>
      <p className="text-gray-500 mb-8">¿Qué quieres gestionar hoy?</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm hover:shadow-md hover:border-[#8B1A4A]/40 transition"
          >
            <div className="text-3xl mb-3">{c.icon}</div>
            <h2 className="font-serif text-xl font-bold text-[#2d1b1b]">{c.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
