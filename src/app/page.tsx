export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import pool from "@/lib/db";

const WA_BASE = "https://wa.me/51967636632";

const COLOR_PALETTE = [
  "from-amber-50 to-yellow-50",
  "from-rose-50 to-pink-50",
  "from-orange-50 to-amber-50",
  "from-yellow-50 to-orange-50",
  "from-purple-50 to-pink-50",
  "from-green-50 to-emerald-50",
  "from-cyan-50 to-blue-50",
  "from-violet-50 to-purple-50",
];

const ABOUT_VALUES = [
  {
    title: "Ingredientes Frescos",
    description: "Seleccionamos los mejores ingredientes naturales para cada creación.",
    icon: (
      <svg className="w-5 h-5 text-[#B8914A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-4 2.5-4 7a4 4 0 008 0c0-4.5-4-7-4-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v9" />
      </svg>
    ),
  },
  {
    title: "Hecho a Mano",
    description: "Cada postre es elaborado artesanalmente con dedicación y cuidado.",
    icon: (
      <svg className="w-5 h-5 text-[#B8914A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
  },
  {
    title: "Con Amor",
    description: "Ponemos amor en cada receta para que sientas la diferencia.",
    icon: (
      <svg className="w-5 h-5 text-[#B8914A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: "Personalizado",
    description: "Diseñamos postres únicos para tus momentos más especiales.",
    icon: (
      <svg className="w-5 h-5 text-[#B8914A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const [featuredRes, categoriesRes] = await Promise.all([
    pool.query(`
      SELECT
        p.product_id          AS id,
        p.product_name        AS name,
        p.product_summary     AS summary,
        p.product_unit_price        AS price,
        p.product_promotional_price AS promotional_price,
        p.product_slug              AS slug,
        c.category_slug,
        c.category_name,
        c.category_icon,
        c.sort_order          AS category_order,
        (
          SELECT url_image FROM product_images
          WHERE product_id = p.product_id
          ORDER BY sort_order LIMIT 1
        )                     AS cover_image
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      WHERE p.product_active = TRUE AND p.featured = TRUE
      ORDER BY p.sort_order
      LIMIT 4
    `),
    pool.query(`
      SELECT category_slug AS id, category_name AS name, category_icon AS icon
      FROM categories
      WHERE category_active = TRUE
      ORDER BY sort_order
    `),
  ]);

  const featuredProducts = featuredRes.rows;
  const categories       = categoriesRes.rows;

  return (
    <>
      {/* ── HERO ── */}
      <section className="bg-[#FAFAFA] py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block text-[#B8914A] text-xs font-medium tracking-[0.22em] uppercase mb-6 border-b border-[#B8914A]/30 pb-1">
                Postres Artesanales · Lima
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1C0E08] leading-[0.95] mb-6">
                El arte de
                <br />
                <em className="text-[#B8914A] not-italic">endulzar</em>
              </h1>
              <p className="text-[#1C0E08]/50 text-lg leading-relaxed mb-9 max-w-lg mx-auto lg:mx-0">
                Tortas, cheesecakes, pies y bocaditos artesanales hechos con
                ingredientes frescos para tus momentos especiales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/productos"
                  className="px-8 py-3.5 bg-[#1C0E08] text-white font-medium text-sm tracking-wide hover:bg-[#B8914A] transition-colors text-center"
                >
                  Ver Productos
                </Link>
                <a
                  href={WA_BASE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 border border-[#B8914A] text-[#B8914A] font-medium text-sm tracking-wide hover:bg-[#B8914A] hover:text-white transition-colors text-center"
                >
                  Hacer un Pedido
                </a>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Mi Dulce Antojo - Postres Artesanales"
                width={400}
                height={400}
                className="w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── THIN GOLD DIVIDER / STATS ── */}
      <section className="border-y border-[#B8914A]/20 bg-[#FAFAFA] py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "100%",    label: "Artesanal" },
              { value: `${categories.length}+`, label: "Categorías" },
              { value: "★ 5.0",  label: "Calidad" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#B8914A]">{stat.value}</p>
                <p className="text-[#1C0E08]/40 text-xs mt-1 tracking-widest uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-16 lg:py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#B8914A] font-medium text-xs tracking-[0.22em] uppercase mb-2">
                Lo más pedido
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C0E08]">
                Especialidades de la Casa
              </h2>
            </div>
            <Link
              href="/productos"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-[#B8914A] hover:text-[#1C0E08] transition-colors font-medium border-b border-[#B8914A]/40 pb-0.5"
            >
              Ver todo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => {
              const gradient =
                COLOR_PALETTE[(product.category_order - 1) % COLOR_PALETTE.length] ??
                "from-amber-50 to-yellow-50";
              return (
                <div
                  key={product.id}
                  className="bg-white overflow-hidden hover:shadow-md transition-all duration-300 group border border-[#1C0E08]/08 hover:border-[#B8914A]/40"
                >
                  <Link href={`/productos/${product.slug}`} className="block">
                    <div className={`relative h-44 bg-gradient-to-br ${gradient}`}>
                      <Image
                        src={product.cover_image ?? "/product_image_not_found.webp"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.promotional_price != null && (
                        <span className="absolute top-3 right-3 bg-[#B8914A] text-white text-[9px] font-semibold px-2 py-0.5 tracking-wide z-10 uppercase">
                          Oferta
                        </span>
                      )}
                      <span className="absolute bottom-2 left-2 text-[8px] text-white/80 bg-black/35 px-2 py-0.5 z-10">
                        Imagen referencial
                      </span>
                    </div>
                  </Link>
                  <div className="p-5 border-t border-[#1C0E08]/05">
                    <p className="text-[#B8914A] text-[9px] font-medium uppercase tracking-[0.18em] mb-1.5">
                      {product.category_icon} {product.category_name}
                    </p>
                    <h3 className="font-serif text-base font-semibold text-[#1C0E08] mb-1 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[#1C0E08]/40 text-xs leading-relaxed mb-4 line-clamp-2">
                      {product.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.promotional_price != null ? (
                          <>
                            <span className="text-xs text-[#1C0E08]/30 line-through leading-tight">
                              S/ {product.price}
                            </span>
                            <span className="font-bold text-[#B8914A] text-sm leading-tight">
                              Desde S/ {product.promotional_price}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-[#1C0E08] text-sm">
                            {product.price != null
                              ? `Desde S/ ${product.price}`
                              : "Consultar"}
                          </span>
                        )}
                      </div>
                      <a
                        href={`${WA_BASE}?text=${encodeURIComponent(
                          `Hola! Me interesa el ${product.name}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-[#25D366] text-white px-3 py-1.5 hover:bg-[#1da851] transition-colors font-medium"
                      >
                        Pedir
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#1C0E08] text-[#1C0E08] text-sm font-medium hover:bg-[#1C0E08] hover:text-white transition-colors tracking-wide"
            >
              Ver todos los productos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-16 lg:py-20 bg-[#F4EEE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#B8914A] font-medium text-xs tracking-[0.22em] uppercase mb-2">
              Nuestra Promesa
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C0E08]">
              ¿Por qué elegir Mi Dulce Antojo?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ABOUT_VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-[#FAFAFA] p-7 border border-[#1C0E08]/08 hover:border-[#B8914A]/40 transition-colors"
              >
                <div className="w-10 h-10 border border-[#B8914A]/30 flex items-center justify-center mb-5">
                  {v.icon}
                </div>
                <h3 className="font-serif text-sm font-semibold text-[#1C0E08] mb-2 tracking-wide">
                  {v.title}
                </h3>
                <p className="text-[#1C0E08]/45 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 lg:py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#B8914A] font-medium text-xs tracking-[0.22em] uppercase mb-2">
              Explora
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C0E08]">
              Nuestros Productos
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.id}`}
                className="flex flex-col items-center gap-3 p-5 border border-[#1C0E08]/08 text-[#1C0E08]/60 hover:border-[#B8914A] hover:text-[#B8914A] transition-all group"
              >
                <span className="text-2xl group-hover:scale-105 transition-transform duration-300">
                  {cat.icon}
                </span>
                <span className="text-xs font-medium text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 lg:py-20 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center border border-[#B8914A]/30 py-14">
          <p className="text-[#B8914A] font-medium text-xs tracking-[0.22em] uppercase mb-4">
            Eventos especiales
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C0E08] mb-4">
            ¿Tienes un evento especial?
          </h2>
          <p className="text-[#1C0E08]/50 text-base mb-8 leading-relaxed">
            Personalizamos el postre perfecto para tu ocasión. Escríbenos y te
            ayudamos a elegir.
          </p>
          <a
            href={`${WA_BASE}?text=${encodeURIComponent(
              "Hola! Quiero hacer un pedido especial."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 text-sm font-semibold hover:bg-[#1da851] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Escríbenos por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
