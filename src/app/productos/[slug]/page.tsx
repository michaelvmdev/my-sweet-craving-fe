export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import ImageCarousel from "./ImageCarousel";

const WA_BASE = "https://wa.me/51967636632";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { rows } = await pool.query(
    `SELECT
       p.product_id                AS id,
       p.product_name              AS name,
       p.product_summary           AS summary,
       p.product_unit_price        AS price,
       p.product_promotional_price AS promotional_price,
       p.featured,
       p.product_slug              AS slug,
       c.category_name,
       c.category_slug,
       c.category_icon,
       (
         SELECT COALESCE(array_agg(url_image ORDER BY sort_order), ARRAY[]::text[])
         FROM product_images WHERE product_id = p.product_id
       ) AS images,
       (
         SELECT COALESCE(array_agg(size_label ORDER BY sort_order), ARRAY[]::text[])
         FROM product_sizes WHERE product_id = p.product_id
       ) AS sizes
     FROM products p
     JOIN categories c ON c.category_id = p.category_id
     WHERE p.product_slug = $1 AND p.product_active = TRUE`,
    [slug]
  );

  if (!rows[0]) notFound();
  const p = rows[0];

  const waText = encodeURIComponent(`Hola! Quisiera pedir: ${p.name}`);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── Breadcrumb ── */}
      <div className="bg-[#FAFAFA] border-b border-[#B8914A]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-[#1C0E08]/40">
          <Link href="/" className="hover:text-[#B8914A] transition-colors">Inicio</Link>
          <span>›</span>
          <Link href="/productos" className="hover:text-[#B8914A] transition-colors">Productos</Link>
          <span>›</span>
          <span className="text-[#B8914A] font-medium truncate">{p.name}</span>
        </div>
      </div>

      {/* ── Detalle ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Imagen */}
          <div className="relative">
            {p.promotional_price != null && (
              <span className="absolute -top-3 -right-3 z-20 bg-[#B8914A] text-white text-[9px] font-semibold px-3 py-1 uppercase tracking-wide">
                Oferta
              </span>
            )}
            <ImageCarousel images={p.images} name={p.name} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Categoría */}
            <span className="inline-flex items-center gap-1.5 text-[#B8914A] text-xs font-medium uppercase tracking-[0.18em]">
              <span>{p.category_icon}</span>
              {p.category_name}
            </span>

            {/* Nombre */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C0E08] leading-tight">
              {p.name}
            </h1>

            {/* Precio */}
            <div className="border-y border-[#B8914A]/20 py-4 flex items-baseline gap-3">
              {p.promotional_price != null ? (
                <>
                  <span className="text-3xl font-bold text-[#B8914A]">
                    S/ {p.promotional_price}
                  </span>
                  <span className="text-lg text-[#1C0E08]/30 line-through">
                    S/ {p.price}
                  </span>
                  <span className="text-xs border border-[#B8914A]/40 text-[#B8914A] px-2 py-0.5">
                    Precio especial
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[#1C0E08]">
                  {p.price != null ? `Desde S/ ${p.price}` : "Consultar precio"}
                </span>
              )}
            </div>

            {/* Descripción */}
            {p.summary && (
              <p className="text-[#1C0E08]/55 leading-relaxed text-base">{p.summary}</p>
            )}

            {/* Tamaños */}
            {p.sizes.length > 0 && (
              <div>
                <p className="text-[#B8914A] text-[9px] font-medium uppercase tracking-[0.22em] mb-3">
                  Tamaños disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map((size: string) => (
                    <span
                      key={size}
                      className="px-4 py-1.5 border border-[#B8914A]/40 text-[#B8914A] text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA WhatsApp */}
            <a
              href={`${WA_BASE}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 text-base font-semibold hover:bg-[#1da851] transition-colors mt-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pedir por WhatsApp
            </a>

            {/* Volver */}
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-sm text-[#1C0E08]/40 hover:text-[#B8914A] transition-colors mt-1"
            >
              ← Volver a productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
