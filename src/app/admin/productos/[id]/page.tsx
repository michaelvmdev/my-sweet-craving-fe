import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminProduct, listAdminCategories } from "@/lib/admin-products";
import ProductForm from "../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;

  const [product, categories] = await Promise.all([getAdminProduct(id), listAdminCategories()]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#8B1A4A] mb-6">Editar producto</h1>
      <ProductForm key={product.id} categories={categories} product={product} />
    </div>
  );
}
