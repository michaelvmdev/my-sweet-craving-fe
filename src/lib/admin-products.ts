import type { PoolClient } from "pg";
import pool from "@/lib/db";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProductInput = {
  name: string;
  summary: string | null;
  price: number | null;
  promotionalPrice: number | null;
  categoryId: string;
  subCategoryId: string | null;
  featured: boolean;
  slug: string;
  sortOrder: number;
  active: boolean;
  images: string[];
  sizes: string[];
};

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 170);
}

function optionalNumber(value: unknown): number | null | "invalid" {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n < 1_000_000 ? n : "invalid";
}

function stringList(value: unknown): string[] {
  const items = Array.isArray(value) ? value : [];
  return items
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseProductInput(
  body: unknown
): { ok: true; data: ProductInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Datos inválidos" };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { ok: false, error: "El nombre es obligatorio" };
  if (name.length > 150) return { ok: false, error: "El nombre no puede superar 150 caracteres" };

  if (typeof b.categoryId !== "string" || !UUID_RE.test(b.categoryId)) {
    return { ok: false, error: "Selecciona una categoría" };
  }
  let subCategoryId: string | null = null;
  if (b.subCategoryId) {
    if (typeof b.subCategoryId !== "string" || !UUID_RE.test(b.subCategoryId)) {
      return { ok: false, error: "Subcategoría inválida" };
    }
    subCategoryId = b.subCategoryId;
  }

  const price = optionalNumber(b.price);
  const promotionalPrice = optionalNumber(b.promotionalPrice);
  if (price === "invalid") return { ok: false, error: "Precio inválido" };
  if (promotionalPrice === "invalid") return { ok: false, error: "Precio promocional inválido" };
  if (promotionalPrice !== null && (price === null || promotionalPrice >= price)) {
    return {
      ok: false,
      error: "El precio promocional debe ser menor al precio regular",
    };
  }

  const sortOrder = Number(b.sortOrder ?? 0);
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 32767) {
    return { ok: false, error: "El orden debe ser un entero entre 0 y 32767" };
  }

  const summary = typeof b.summary === "string" && b.summary.trim() ? b.summary.trim() : null;

  const slugSource = typeof b.slug === "string" && b.slug.trim() ? b.slug : name;
  const slug = slugify(slugSource);
  if (!slug) return { ok: false, error: "No se pudo generar un slug válido" };

  const images = stringList(b.images);
  for (const url of images) {
    if (url.length > 500 || !/^(https?:\/\/|\/)/i.test(url)) {
      return { ok: false, error: `URL de imagen inválida: ${url.slice(0, 60)}` };
    }
  }

  const sizes = [...new Set(stringList(b.sizes))];
  if (sizes.some((s) => s.length > 50)) {
    return { ok: false, error: "Cada tamaño puede tener máximo 50 caracteres" };
  }

  return {
    ok: true,
    data: {
      name,
      summary,
      price,
      promotionalPrice,
      categoryId: b.categoryId,
      subCategoryId,
      featured: b.featured === true,
      slug,
      sortOrder,
      active: b.active !== false,
      images,
      sizes,
    },
  };
}

export class ProductError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function replaceChildren(client: PoolClient, productId: string, data: ProductInput) {
  // Conserva size_price de los tamaños que se mantienen (no se edita desde el panel).
  const prev = await client.query<{ size_label: string; size_price: string | null }>(
    "SELECT size_label, size_price FROM product_sizes WHERE product_id = $1",
    [productId]
  );
  const prices = new Map(prev.rows.map((r) => [r.size_label, r.size_price]));

  await client.query("DELETE FROM product_images WHERE product_id = $1", [productId]);
  await client.query("DELETE FROM product_sizes WHERE product_id = $1", [productId]);

  if (data.images.length) {
    await client.query(
      `INSERT INTO product_images (product_id, url_image, sort_order)
       SELECT $1, u, (i - 1)::smallint FROM unnest($2::text[]) WITH ORDINALITY AS t(u, i)`,
      [productId, data.images]
    );
  }
  for (const [i, label] of data.sizes.entries()) {
    await client.query(
      `INSERT INTO product_sizes (product_id, size_label, size_price, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [productId, label, prices.get(label) ?? null, i]
    );
  }
}

export async function saveProduct(id: string | null, data: ProductInput): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (data.subCategoryId) {
      const sub = await client.query(
        "SELECT 1 FROM sub_categories WHERE sub_category_id = $1 AND category_id = $2",
        [data.subCategoryId, data.categoryId]
      );
      if (!sub.rowCount) {
        throw new ProductError("La subcategoría no pertenece a la categoría elegida", 400);
      }
    }

    const values = [
      data.name,
      data.summary,
      data.price,
      data.promotionalPrice,
      data.categoryId,
      data.subCategoryId,
      data.featured,
      data.slug,
      data.sortOrder,
      data.active,
    ];

    let productId: string;
    if (id) {
      const res = await client.query(
        `UPDATE products SET
           product_name = $1, product_summary = $2, product_unit_price = $3,
           product_promotional_price = $4, category_id = $5, sub_category_id = $6,
           featured = $7, product_slug = $8, sort_order = $9, product_active = $10
         WHERE product_id = $11
         RETURNING product_id`,
        [...values, id]
      );
      if (!res.rowCount) throw new ProductError("Producto no encontrado", 404);
      productId = res.rows[0].product_id;
    } else {
      const res = await client.query(
        `INSERT INTO products
           (product_name, product_summary, product_unit_price, product_promotional_price,
            category_id, sub_category_id, featured, product_slug, sort_order, product_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING product_id`,
        values
      );
      productId = res.rows[0].product_id;
    }

    await replaceChildren(client, productId, data);
    await client.query("COMMIT");
    return productId;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    if (err instanceof ProductError) throw err;
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      throw new ProductError("Ya existe otro producto con ese slug. Cambia el slug o el nombre.", 409);
    }
    if (code === "23503") throw new ProductError("La categoría seleccionada no existe", 400);
    throw err;
  } finally {
    client.release();
  }
}

const PRODUCT_SELECT = `
  SELECT
    p.product_id                          AS id,
    p.product_name                        AS name,
    p.product_summary                     AS summary,
    p.product_unit_price::float8          AS price,
    p.product_promotional_price::float8   AS "promotionalPrice",
    p.category_id                         AS "categoryId",
    p.sub_category_id                     AS "subCategoryId",
    p.featured,
    p.product_slug                        AS slug,
    p.sort_order                          AS "sortOrder",
    p.product_active                      AS active,
    COALESCE((SELECT array_agg(url_image ORDER BY sort_order)
              FROM product_images WHERE product_id = p.product_id), ARRAY[]::text[]) AS images,
    COALESCE((SELECT array_agg(size_label ORDER BY sort_order)
              FROM product_sizes WHERE product_id = p.product_id), ARRAY[]::text[]) AS sizes
  FROM products p`;

export type AdminProduct = {
  id: string;
  name: string;
  summary: string | null;
  price: number | null;
  promotionalPrice: number | null;
  categoryId: string;
  subCategoryId: string | null;
  featured: boolean;
  slug: string | null;
  sortOrder: number;
  active: boolean;
  images: string[];
  sizes: string[];
};

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  if (!UUID_RE.test(id)) return null;
  const { rows } = await pool.query(`${PRODUCT_SELECT} WHERE p.product_id = $1`, [id]);
  return rows[0] ?? null;
}

export type AdminProductRow = AdminProduct & { categoryName: string; categoryIcon: string | null };

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const { rows } = await pool.query(
    `SELECT pr.*, c.category_name AS "categoryName", c.category_icon AS "categoryIcon"
     FROM (${PRODUCT_SELECT}) pr
     JOIN categories c ON c.category_id = pr."categoryId"
     ORDER BY pr.active DESC, c.sort_order, pr."sortOrder", pr.name`
  );
  return rows;
}

export type AdminCategory = {
  id: string;
  name: string;
  icon: string | null;
  subCategories: { id: string; name: string }[];
};

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const { rows } = await pool.query(
    `SELECT c.category_id AS id, c.category_name AS name, c.category_icon AS icon,
            COALESCE((SELECT json_agg(json_build_object('id', s.sub_category_id, 'name', s.sub_category_name)
                                      ORDER BY s.sub_category_name)
                      FROM sub_categories s
                      WHERE s.category_id = c.category_id AND s.sub_category_active = TRUE),
                     '[]'::json) AS "subCategories"
     FROM categories c
     WHERE c.category_active = TRUE
     ORDER BY c.sort_order`
  );
  return rows;
}

export async function setProductActive(id: string, active: boolean): Promise<boolean> {
  const res = await pool.query("UPDATE products SET product_active = $1 WHERE product_id = $2", [
    active,
    id,
  ]);
  return (res.rowCount ?? 0) > 0;
}
