import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarClock, PackageCheck, Rocket } from "lucide-react";
import { ProductForm, type ProductListingType } from "@/components/product-form";

export const metadata = { title: "Add a product" };

const productTypes: { id: ProductListingType; title: string; description: string; detail: string; icon: typeof PackageCheck }[] = [
  { id: "normal", title: "Normal product", description: "Ready to sell and fulfil now.", detail: "Customers can purchase through your selected buying method.", icon: PackageCheck },
  { id: "coming-soon", title: "Coming Soon product", description: "Announce a product before it launches.", detail: "Customers can join the waitlist. No order or payment is taken.", icon: Rocket },
  { id: "pre-order", title: "Pre-order product", description: "Accept reservations before the product is ready.", detail: "Customers pay in full through TTFL Store checkout and see the expected release date.", icon: CalendarClock },
];

export default function NewProductPage({ searchParams }: { searchParams?: { type?: string } }) {
  const selectedType = productTypes.find((item) => item.id === searchParams?.type)?.id;
  return (
    <div className="shell max-w-3xl py-8">
      <div className="mb-6">
        <Link href="/vendor/dashboard/products" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-graphite-500 hover:text-ember-600"><ArrowLeft className="h-4 w-4" />Back to products</Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">Vendor listing</p>
        <h1 className="mt-1 text-2xl font-bold text-graphite-900 dark:text-white">{selectedType ? "Create " + productTypes.find((item) => item.id === selectedType)?.title.toLowerCase() : "What type of product are you adding?"}</h1>
        <p className="mt-2 text-sm leading-6 text-graphite-500">{selectedType ? "Add the details below. You can review your listing before publishing." : "Choose the listing type that matches where your product is in its selling journey."}</p>
      </div>
      {!selectedType ? <div className="grid gap-3 md:grid-cols-3">{productTypes.map(({ id, title, description, detail, icon: Icon }) => <Link key={id} href={"/vendor/dashboard/products/new?type=" + id} className="group flex min-h-[230px] flex-col rounded-2xl border border-graphite-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-ember-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 dark:border-graphite-700 dark:bg-graphite-900"><span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-ember-50 text-ember-700 dark:bg-ember-950/40 dark:text-ember-300"><Icon className="h-6 w-6" /></span><h2 className="text-base font-bold text-graphite-900 group-hover:text-ember-700 dark:text-white">{title}</h2><p className="mt-2 text-sm text-graphite-600 dark:text-graphite-300">{description}</p><p className="mt-3 flex-1 text-xs leading-5 text-graphite-500">{detail}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ember-700">Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div> : <><Link href="/vendor/dashboard/products/new" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ember-700 hover:underline"><ArrowLeft className="h-4 w-4" />Change product type</Link><ProductForm productType={selectedType} /></>}
    </div>
  );
}
