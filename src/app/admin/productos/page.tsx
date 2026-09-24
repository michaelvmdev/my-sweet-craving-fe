import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { listAdminProducts } from "@/lib/admin-products";
import ProductsTable from "./ProductsTable";

export default async function AdminProductsPage() {
  if (!(await isAdmin())) redirect("/admin");
  const products = await listAdminProducts();

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#8B1A4A]">Productos</h1>
          <p className="text-gray-500 text-sm">{products.length} en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-[#8B1A4A] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#6B1235] transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
