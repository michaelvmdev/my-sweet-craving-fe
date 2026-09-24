import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import {
  UUID_RE,
  ProductError,
  getAdminProduct,
  parseProductInput,
  saveProduct,
  setProductActive,
} from "@/lib/admin-products";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const parsed = parseProductInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await saveProduct(id, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 });
  }
}

// Desactivar / reactivar (baja lógica). No existe DELETE: los productos nunca se borran.
export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (typeof body?.active !== "boolean") {
    return NextResponse.json({ error: "Falta el campo active (boolean)" }, { status: 400 });
  }

  const found = await setProductActive(id, body.active);
  if (!found) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  revalidatePath("/", "layout");
  return NextResponse.json({ id, active: body.active });
}
