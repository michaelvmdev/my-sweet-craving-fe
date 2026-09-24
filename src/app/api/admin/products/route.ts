import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { ProductError, listAdminProducts, parseProductInput, saveProduct } from "@/lib/admin-products";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json(await listAdminProducts());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();

  const parsed = parseProductInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const id = await saveProduct(null, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 });
  }
}
