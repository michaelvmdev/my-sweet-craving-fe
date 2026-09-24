"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminCategory, AdminProduct } from "@/lib/admin-products";

const input =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A4A]/30 focus:border-[#8B1A4A]";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

export default function ProductForm({
  categories,
  product,
}: {
  categories: AdminCategory[];
  product?: AdminProduct;
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [subCategoryId, setSubCategoryId] = useState(product?.subCategoryId ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [promotionalPrice, setPromotionalPrice] = useState(product?.promotionalPrice?.toString() ?? "");
  const [sortOrder, setSortOrder] = useState((product?.sortOrder ?? 0).toString());
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [images, setImages] = useState((product?.images ?? []).join("\n"));
  const [sizes, setSizes] = useState((product?.sizes ?? []).join("\n"));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const subCategories = categories.find((c) => c.id === categoryId)?.subCategories ?? [];
  const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: data });
        const json = await res.json().catch(() => null);
        if (res.status === 401) {
          router.refresh(); // sesión vencida: vuelve al login
          break;
        }
        if (!res.ok) {
          setError(`${file.name}: ${json?.error ?? "no se pudo subir"}`);
          break;
        }
        uploaded.push(json.url);
      }
    } finally {
      if (uploaded.length) setImages((prev) => [...lines(prev), ...uploaded].join("\n"));
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages(lines(images).filter((u) => u !== url).join("\n"));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          summary,
          categoryId,
          subCategoryId: subCategoryId || null,
          price,
          promotionalPrice,
          sortOrder,
          featured,
          active,
          images: lines(images),
          sizes: lines(sizes),
        }),
      });
      if (res.status === 401) {
        router.refresh(); // sesión vencida: vuelve al login
        return;
      }
      if (!res.ok) {
        setError((await res.json().catch(() => null))?.error ?? "No se pudo guardar");
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 sm:p-8 grid gap-5 max-w-3xl"
    >
      <Field label="Nombre *">
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={150} required />
      </Field>

      <Field label="Slug (URL)" hint="Déjalo vacío para generarlo desde el nombre. Cambiarlo rompe enlaces antiguos.">
        <input className={input} value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={170} placeholder="torta-de-chocolate" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Categoría *">
          <select
            className={input}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubCategoryId("");
            }}
            required
          >
            <option value="">Selecciona…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subcategoría">
          <select
            className={input}
            value={subCategoryId}
            onChange={(e) => setSubCategoryId(e.target.value)}
            disabled={subCategories.length === 0}
          >
            <option value="">Ninguna</option>
            {subCategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Descripción">
        <textarea className={input} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Precio (S/)" hint="Vacío = consultar precio">
          <input className={input} type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Precio promocional (S/)" hint="Opcional, menor al precio">
          <input className={input} type="number" min="0" step="0.01" value={promotionalPrice} onChange={(e) => setPromotionalPrice(e.target.value)} />
        </Field>
        <Field label="Orden" hint="Menor = aparece primero">
          <input className={input} type="number" min="0" max="32767" step="1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="images" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Imágenes
          </label>
          <textarea id="images" className={`${input} font-mono text-xs`} rows={4} value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://… o /uploads/…" />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={onFiles} className="hidden" />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="shrink-0 whitespace-nowrap rounded-full border border-[#8B1A4A] text-[#8B1A4A] px-4 py-1.5 text-xs font-semibold hover:bg-rose-50 disabled:opacity-60"
            >
              {uploading ? "Subiendo…" : "📷 Subir archivo"}
            </button>
            <span className="text-xs text-gray-400">JPG, PNG, WEBP o GIF · máx. 5 MB</span>
          </div>
          <span className="text-xs text-gray-400">Pega una URL o sube un archivo, una por línea. La primera es la portada.</span>
          {lines(images).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {lines(images).map((url, i) => (
                <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-[#8B1A4A]/80 text-white text-[9px] text-center">Portada</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Quitar imagen"
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] leading-4 text-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Field label="Tamaños / presentaciones" hint="Uno por línea (ej. Pequeña, Mediana).">
          <textarea className={input} rows={4} value={sizes} onChange={(e) => setSizes(e.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[#8B1A4A] w-4 h-4" />
          Destacado en el inicio
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#8B1A4A] w-4 h-4" />
          Activo (visible en la web)
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-[#8B1A4A] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#6B1235] transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </button>
        <Link
          href="/admin/productos"
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
