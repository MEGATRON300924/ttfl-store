import { ProductForm } from "@/components/product-form";

export const metadata = { title: "List a new product" };

export default function NewProductPage() {
  return (
    <div className="shell max-w-2xl py-8">
      <h1 className="text-xl font-bold text-graphite-900">List a new product</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
