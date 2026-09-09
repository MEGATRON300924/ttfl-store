import { ComingSoonProductForm } from "@/components/coming-soon-product-form";

export const metadata = { title: "Create Coming Soon product" };

export default function ComingSoonProductPage() {
  return (
    <div className="shell max-w-2xl py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">Launch campaigns</p>
        <h1 className="mt-1 text-xl font-bold text-graphite-900 dark:text-white">Create a Coming Soon product</h1>
        <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">Build a product teaser first, then schedule its launch. Pricing and selling details are not required until it is ready.</p>
      </div>
      <div className="mt-6"><ComingSoonProductForm /></div>
    </div>
  );
}
