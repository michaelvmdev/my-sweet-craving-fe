import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import ProductsView from "./ProductsView";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explora nuestra selección de postres artesanales: tortas, queques, pyes de limón y maracuyá, cheesecakes, crema volteada, bocaditos y más.",
};

export default function ProductosPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="bg-[#FAFAFA] border-b border-[#B8914A]/20 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block text-[#B8914A] text-xs font-medium tracking-[0.22em] uppercase mb-4 border-b border-[#B8914A]/30 pb-1">
                Nuestro Menú
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C0E08] mb-4">
                Nuestros Productos
              </h1>
              <p className="text-[#1C0E08]/50 text-base sm:text-lg max-w-2xl">
                Cada postre es elaborado con ingredientes frescos y técnicas
                artesanales. Elige tu favorito y pídelo por WhatsApp.
              </p>
            </div>
            <div className="shrink-0 w-full max-w-xs">
              <Image
                src="/productos.jpg"
                alt="Menú Mi Dulce Antojo"
                width={800}
                height={1200}
                className="w-full h-auto shadow-xl border border-[#B8914A]/20"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-10 h-10 border border-[#B8914A]/40 mx-auto mb-4 animate-pulse" />
              <p className="text-[#1C0E08]/40 text-sm">Cargando productos...</p>
            </div>
          </div>
        }
      >
        <ProductsView />
      </Suspense>
    </>
  );
}
