import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { listAdminCategories } from "@/lib/admin-products";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  if (!(await isAdmin())) redirect("/admin");
  const categories = await listAdminCategories();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#8B1A4A] mb-6">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
