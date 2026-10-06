import Link from "next/link";
import { BookOpen, CarFront, Home, MessageCircle, PackageSearch, SearchCheck, ShieldCheck, MessagesSquare } from "lucide-react";

const faqs = [
  ["How do I track an order?", "Open Track an order and enter your TTFL order number. Signed-in customers can track their orders without entering a Product ID."],
  ["Can I report a vehicle or property?", "Yes. Choose TTFL Cars or TTFL Homes when reporting a problem. You will not be asked for a Product ID for Cars or Homes listings."],
  ["Can I report a TTFL Store product?", "Yes. Select TTFL Store Products when submitting a report. For product-related issues, the Product ID can help our support team identify the exact listing."],
  ["Can I contact support about my account?", "Yes. Use Report a problem and choose Account or website issue if the problem is not about a marketplace listing."],
  ["How do I see support replies?", "Open My reports to read TTFL Support responses and reply to an open conversation."],
];

export default function SupportPage() {
  return (
    <div className="shell py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL Support</p>
          <h1 className="mt-2 text-3xl font-bold text-graphite-900">How can we help?</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Get help with TTFL Store, TTFL Cars, TTFL Homes, your account, orders, and marketplace listings.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/orders/track" className="rounded-card border border-graphite-200 bg-white p-5 hover:border-ember-600">
            <PackageSearch className="h-5 w-5 text-ember-600" /><p className="mt-3 font-semibold text-graphite-900">Track an order</p><p className="mt-1 text-sm text-graphite-600">Follow your order and delivery status.</p>
          </Link>
          <Link href="/support/report" className="rounded-card border border-graphite-200 bg-white p-5 hover:border-ember-600">
            <MessageCircle className="h-5 w-5 text-ember-600" /><p className="mt-3 font-semibold text-graphite-900">Report a problem</p><p className="mt-1 text-sm text-graphite-600">Tell TTFL what went wrong.</p>
          </Link>
          <Link href="/support/reports" className="rounded-card border border-graphite-200 bg-white p-5 hover:border-ember-600">
            <MessagesSquare className="h-5 w-5 text-ember-600" /><p className="mt-3 font-semibold text-graphite-900">My reports</p><p className="mt-1 text-sm text-graphite-600">Read replies and continue support conversations.</p>
          </Link>
          <Link href="/error-codes" className="rounded-card border border-graphite-200 bg-white p-5 hover:border-ember-600">
            <SearchCheck className="h-5 w-5 text-ember-600" /><p className="mt-3 font-semibold text-graphite-900">Error code checker</p><p className="mt-1 text-sm text-graphite-600">Find what a TTFL error code means.</p>
          </Link>
        </div>

        <section className="mt-9">
          <h2 className="text-xl font-bold text-graphite-900">Support for every TTFL marketplace</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-card border border-graphite-200 bg-white p-5"><PackageSearch className="h-5 w-5 text-ember-600"/><h3 className="mt-3 font-semibold text-graphite-900">TTFL Store Products</h3><p className="mt-1 text-sm leading-6 text-graphite-600">Orders, products, payments, delivery and marketplace issues.</p></div>
            <div className="rounded-card border border-graphite-200 bg-white p-5"><CarFront className="h-5 w-5 text-ember-600"/><h3 className="mt-3 font-semibold text-graphite-900">TTFL Cars</h3><p className="mt-1 text-sm leading-6 text-graphite-600">Vehicles, dealers, listings, inspections and vehicle-related problems.</p></div>
            <div className="rounded-card border border-graphite-200 bg-white p-5"><Home className="h-5 w-5 text-ember-600"/><h3 className="mt-3 font-semibold text-graphite-900">TTFL Homes</h3><p className="mt-1 text-sm leading-6 text-graphite-600">Properties, agents, listings, inspections and property-related problems.</p></div>
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-xl font-bold text-graphite-900">Frequently asked questions</h2>
          <div className="mt-4 flex flex-col gap-3">
            {faqs.map(([q, a]) => <details key={q} className="rounded-card border border-graphite-200 bg-white p-4"><summary className="cursor-pointer font-semibold text-graphite-900">{q}</summary><p className="mt-2 text-sm leading-6 text-graphite-600">{a}</p></details>)}
          </div>
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-card bg-verified-100 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-verified-700" />
          <div><p className="font-semibold text-graphite-900">Protect your account</p><p className="mt-1 text-sm text-graphite-700">Never share your password, payment PIN, or authentication codes with a seller or support agent.</p></div>
        </div>
      </div>
    </div>
  );
}
