import Link from "next/link";
import {
  Activity,
  BarChart3,
  BookOpen,
  Box,
  CheckCircle2,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LockKeyhole,
  Megaphone,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const customerSteps = [
  ["Create an account", "Register or sign in to your TTFL account so orders and account activity can be associated with you."],
  ["Find products", "Browse the marketplace, search by keyword, open a product page, or visit a vendor storefront."],
  ["Check the buying method", "A product may use TTFL checkout, an external purchase link, or a direct WhatsApp/contact flow depending on the vendor's setup."],
  ["Checkout", "For products using TTFL checkout, review your cart, delivery information, discounts, and final total before continuing to Paystack."],
  ["Pay securely", "Complete the available Paystack payment method. TTFL verifies the payment before treating the order as paid."],
  ["Keep your order number", "Your order number is the main reference for confirmation, support, and tracking."],
  ["Track and receive", "Use your account or the tracking tools to follow order progress and vendor delivery updates."],
];

const vendorFeatures: Feature[] = [
  { icon: Store, title: "Store profile", description: "Manage your public store identity, branding, description, contact information, badges, and customer-facing details." },
  { icon: Package, title: "Product management", description: "Create and edit listings, set prices and stock, choose the selling method, manage images, and maintain Product IDs." },
  { icon: ShoppingBag, title: "Order fulfilment", description: "View vendor orders, move fulfilment through available statuses, and publish delivery or tracking information." },
  { icon: Truck, title: "Delivery tracking", description: "Use the tracking workflow to publish checkpoint updates. Final delivery details can include a motorcycle, car, truck, rider, or third-party tracking reference." },
  { icon: BarChart3, title: "Analytics", description: "Review the performance information available to your store, including product activity, referrals, revenue, and other marketplace metrics." },
  { icon: CreditCard, title: "Plans, commissions & payouts", description: "Review your vendor plan, applicable commission information, balances, and payout workflow." },
  { icon: Megaphone, title: "Promotion tools", description: "Use available featured placements, promotions, sponsored opportunities, and coupon features when enabled for your store." },
  { icon: ShieldCheck, title: "Vendor status", description: "Vendor access depends on account and store status. Pending, approved, suspended, and other administrative states can affect available tools." },
];

const adminFeatures: Feature[] = [
  { icon: LayoutDashboard, title: "Dashboard", description: "The administrative control centre for marketplace operations, alerts, platform activity, and high-level oversight." },
  { icon: Users, title: "Vendors", description: "Review applications, approve or reject stores, suspend or manage vendors, and maintain vendor information and tiers." },
  { icon: Package, title: "Products", description: "Moderate marketplace listings, inspect Product IDs, and suspend or reinstate products when necessary." },
  { icon: ShoppingBag, title: "Orders & payments", description: "Review order state, payment state, vendor fulfilment, refunds, and other operational information available to administrators." },
  { icon: HelpCircle, title: "Support", description: "Work customer support conversations, assign issues, respond as an agent, and resolve or close cases." },
  { icon: BarChart3, title: "Analytics", description: "Review marketplace and vendor reporting tools available to the administration area." },
  { icon: Megaphone, title: "Featured content", description: "Manage featured products, stores, promotions, and their active lifecycle." },
  { icon: LockKeyhole, title: "Security & audit", description: "Use protected administrative controls and audit information for sensitive actions. Never share administrator credentials." },
];

const commonQuestions = [
  ["Where do I find my Product ID?", "Product IDs are associated with marketplace products and are used by TTFL in product and tracking workflows. Open the relevant product or order information to find the identifier when it is exposed."],
  ["What happens after I pay?", "The payment is verified by the TTFL backend before the order is finalized as paid. Once confirmed, the order can move into fulfilment and tracking."],
  ["Can I track an order without an account?", "Public tracking is available only through the current signed tracking flow. If you have an account, using the authenticated order area provides the normal ownership-protected experience."],
  ["Why can a vendor use different buying methods?", "TTFL supports marketplace listings with different selling methods. A product may use TTFL checkout, an external link, or a direct WhatsApp/contact route."],
  ["What should I do if payment or delivery has a problem?", "Keep your order number and use the support/report tools. Do not send passwords, card details, OTPs, or other private credentials to support."],
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
      <Icon className="h-5 w-5 text-ember-600" />
      <h3 className="mt-3 text-sm font-bold text-graphite-900 dark:text-white">{feature.title}</h3>
      <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">{feature.description}</p>
    </div>
  );
}

function ImageGuide({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-card border border-dashed border-graphite-300 bg-cloud-100 p-5 dark:border-graphite-700 dark:bg-graphite-950">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-graphite-600 dark:text-graphite-400" />
        <p className="text-sm font-bold text-graphite-900 dark:text-white">Image suggestion: {title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-graphite-600 dark:text-graphite-400">{description}</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="shell py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ember-600">TTFL Store documentation</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-graphite-900 dark:text-white sm:text-4xl">Everything you need to use TTFL Store</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-graphite-600 dark:text-graphite-400 sm:text-base">
            A detailed guide to shopping, selling, orders, payments, delivery tracking, support, vendor tools, and administration on TTFL Store.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            [UserRound, "Customers", "Shop, pay, manage orders, and get help."],
            [Store, "Vendors", "Build a store, sell products, fulfil orders, and track performance."],
            [ShieldCheck, "Administrators", "Moderate the marketplace and operate protected platform tools."],
          ].map(([Icon, title, description]) => {
            const Component = Icon as LucideIcon;
            return (
              <div key={String(title)} className="rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
                <Component className="h-5 w-5 text-ember-600" />
                <h2 className="mt-3 text-base font-bold text-graphite-900 dark:text-white">{String(title)}</h2>
                <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">{String(description)}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-ember-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">01 · Customers</p>
              <h2 className="text-2xl font-bold text-graphite-900 dark:text-white">How shopping on TTFL Store works</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {customerSteps.map(([title, description], index) => (
              <div key={title} className="flex gap-4 rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ember-100 font-mono text-xs font-bold text-ember-700 dark:bg-ember-950 dark:text-ember-300">{index + 1}</span>
                <div>
                  <h3 className="text-sm font-bold text-graphite-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-card border border-graphite-200 bg-white p-6 dark:border-graphite-700 dark:bg-graphite-900">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 text-ember-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">Payments</p>
              <h2 className="mt-1 text-xl font-bold text-graphite-900 dark:text-white">What happens during checkout?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite-600 dark:text-graphite-400">
                TTFL calculates the order from server-side product and cart data. When checkout is available, the customer is sent to Paystack to complete payment. TTFL then verifies the payment reference, amount, currency, and payment status before finalizing the order. A successful confirmation moves the order into the appropriate fulfilment flow.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {["Cart total", "Checkout", "Paystack", "Verified order"].map((label, index) => (
              <div key={label} className="rounded-card border border-graphite-100 bg-cloud-100 p-4 text-center dark:border-graphite-800 dark:bg-graphite-950">
                <span className="text-xs font-bold uppercase tracking-wider text-graphite-500">Step {index + 1}</span>
                <p className="mt-1 text-sm font-bold text-graphite-900 dark:text-white">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 rounded-card bg-cloud-100 p-4 text-xs leading-5 text-graphite-600 dark:bg-graphite-950 dark:text-graphite-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verified-700" />
            <p>Never send your card PIN, OTP, password, or other authentication secret to TTFL support or a vendor.</p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-ember-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">02 · Vendors</p>
              <h2 className="text-2xl font-bold text-graphite-900 dark:text-white">Running a TTFL Store</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-graphite-600 dark:text-graphite-400">Vendors get a dedicated dashboard after entering the vendor workflow. Store status and administrative approval determine which tools are available.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{vendorFeatures.map((feature) => <FeatureCard key={feature.title} feature={feature} />)}</div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-ember-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">03 · Tracking</p>
              <h2 className="text-2xl font-bold text-graphite-900 dark:text-white">Understanding order tracking</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-card border border-graphite-200 bg-white p-6 dark:border-graphite-700 dark:bg-graphite-900">
              <h3 className="text-base font-bold text-graphite-900 dark:text-white">Tracking checkpoints</h3>
              <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-400">Vendors can update an order through the available tracking checkpoints. Customers see the published progress rather than internal administrative data.</p>
              <div className="mt-5 space-y-3">
                {["Checkpoint 1", "Checkpoint 2", "Checkpoint 3", "Checkpoint 4", "Checkpoint 5 · delivery details"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-cloud-100 font-mono text-xs font-bold text-graphite-700 dark:bg-graphite-800 dark:text-graphite-200">{index + 1}</span>
                    <span className="text-graphite-700 dark:text-graphite-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <ImageGuide title="Order tracking timeline" description="Show an order detail screen with a horizontal or vertical five-step timeline. The active checkpoint should be visually emphasized, completed checkpoints should show a check mark, and the final checkpoint can display vehicle type, rider information, or an external tracking reference when provided." />
          </div>
        </section>

        <section className="mt-10 rounded-card border border-graphite-200 bg-white p-6 dark:border-graphite-700 dark:bg-graphite-900">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-verified-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-verified-700">04 · Administrators</p>
              <h2 className="mt-1 text-xl font-bold text-graphite-900 dark:text-white">Administration guide</h2>
              <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-400">The admin area is for authorized platform operators. Use it to moderate marketplace activity, manage vendors, oversee operational issues, and review sensitive platform information.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{adminFeatures.map((feature) => <FeatureCard key={feature.title} feature={feature} />)}</div>
          <div className="mt-5 rounded-card bg-graphite-900 p-5 text-sm leading-6 text-white">
            <p className="font-bold">Suggested operational workflow</p>
            <p className="mt-1 text-white/75">Dashboard → pending vendor applications → product moderation → orders and payment issues → support → analytics → security and audit review.</p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-ember-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">05 · Platform concepts</p>
              <h2 className="text-2xl font-bold text-graphite-900 dark:text-white">Important things to understand</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              [Search, "Product discovery", "Search and storefront browsing are separate from checkout. Always open the product page to confirm the current buying method before expecting TTFL checkout."],
              [Box, "Product IDs", "TTFL Product IDs provide a stable product reference for marketplace and operational workflows."],
              [LockKeyhole, "Account security", "Authentication and protected API operations are handled by the platform. Do not attempt to bypass access controls or share account credentials."],
              [Users, "Vendor separation", "A vendor manages their own store and fulfilment information, while platform administration handles marketplace-level moderation and protected operations."],
            ].map(([Icon, title, description]) => {
              const Component = Icon as LucideIcon;
              return <div key={String(title)} className="rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900"><Component className="h-5 w-5 text-graphite-600 dark:text-graphite-400" /><h3 className="mt-3 text-sm font-bold text-graphite-900 dark:text-white">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">{String(description)}</p></div>;
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-ember-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">06 · Visual documentation</p>
              <h2 className="text-2xl font-bold text-graphite-900 dark:text-white">Recommended screenshots and diagrams</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-graphite-600 dark:text-graphite-400">These descriptions can be used later when adding real screenshots to the documentation. They intentionally describe what the image should teach rather than pretending a screenshot exists.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ImageGuide title="Homepage and product discovery" description="Show the TTFL Store homepage with navigation, search, featured products, product cards, and a clear path into a product detail page." />
            <ImageGuide title="Product detail and buying method" description="Show a product detail page with product images, title, price, stock, seller/store information, and the correct purchase action such as Add to cart, external link, or WhatsApp." />
            <ImageGuide title="Checkout and Paystack handoff" description="Show the cart summary followed by the checkout delivery form and a separate visual explaining that payment continues through Paystack before TTFL confirms the order." />
            <ImageGuide title="Vendor dashboard" description="Show the vendor dashboard navigation with store management, products, orders, analytics, payouts, and available promotion tools." />
            <ImageGuide title="Admin dashboard" description="Show the protected admin control centre with vendor moderation, product moderation, orders, support, analytics, and security/audit tools." />
            <ImageGuide title="Order confirmation" description="Show the post-payment confirmation screen containing the order number, payment confirmation state, order summary, and links into order details or tracking." />
          </div>
        </section>

        <section className="mt-10 rounded-card border border-graphite-200 bg-white p-6 dark:border-graphite-700 dark:bg-graphite-900">
          <div className="flex items-center gap-3"><HelpCircle className="h-5 w-5 text-ember-600" /><h2 className="text-xl font-bold text-graphite-900 dark:text-white">Frequently asked questions</h2></div>
          <div className="mt-5 divide-y divide-graphite-100 dark:divide-graphite-800">
            {commonQuestions.map(([question, answer]) => (
              <details key={question} className="group py-4">
                <summary className="cursor-pointer list-none pr-6 text-sm font-bold text-graphite-900 dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-400">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 flex flex-wrap gap-3">
          <Link href="/support" className="rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-800 hover:border-ember-600 dark:border-graphite-700 dark:text-graphite-200">Help centre</Link>
          <Link href="/orders/track" className="rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">Track an order</Link>
          <Link href="/support/report" className="rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-800 hover:border-ember-600 dark:border-graphite-700 dark:text-graphite-200">Report a problem</Link>
        </section>
      </div>
    </div>
  );
}
