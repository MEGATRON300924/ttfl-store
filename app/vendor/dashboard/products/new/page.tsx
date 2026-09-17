import { ProductForm } from "@/components/product-form";

export const metadata = { title: "List a new product" };

export default function NewProductPage() {
  return (
    <div className="shell max-w-2xl py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">Vendor listing</p>
        <h1 className="mt-1 text-2xl font-bold text-graphite-900">List a new product</h1>
        <p className="mt-2 text-sm leading-6 text-graphite-500">Add the basic product details first. We’ll guide you through the optional details, variations and buying method.</p>
      </div>
      <ProductForm />
    </div>
  );
}
