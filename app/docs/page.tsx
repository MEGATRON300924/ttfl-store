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


const errorCodes = [
  ["AUTH-001","Invalid credentials","The email or password is incorrect.","Check the login details or use Forgot Password."],
  ["AUTH-002","Account not found","No matching TTFL Store account was found.","Check the email address or create an account."],
  ["AUTH-003","Account disabled","The account cannot authenticate while disabled.","Contact TTFL Store support."],
  ["AUTH-004","Session expired","The current login session has expired.","Sign in again."],
  ["AUTH-005","Unauthorized","The requested feature requires authentication.","Sign in and try again."],
  ["AUTH-006","Forbidden","The account does not have permission for the requested action.","Check the account role or contact support."],
  ["PASS-001","Reset request failed","The password reset request could not be completed.","Try requesting the reset link again."],
  ["PASS-002","Reset token invalid","The password reset link or token is invalid.","Request a new password reset link."],
  ["PASS-003","Reset token expired","The password reset link has expired.","Request a new password reset link."],
  ["PASS-004","Password mismatch","The new password fields do not match.","Enter the same password in both fields."],
  ["PASS-005","Password rejected","The new password does not meet the password requirements.","Choose a stronger valid password."],
  ["EMAIL-001","Email not sent","A requested TTFL Store email could not be sent.","Try again and check the email address."],
  ["EMAIL-002","Email delivery delayed","An email may have been accepted for delivery but has not arrived yet.","Check inbox, spam, and promotions folders."],
  ["EMAIL-003","Invalid email","The supplied email address is invalid.","Enter a valid email address."],
  ["ACC-001","Registration failed","Account creation could not be completed.","Review the information and try again."],
  ["ACC-002","Email already registered","An account already uses that email address.","Sign in or use Forgot Password."],
  ["ACC-003","Verification required","Email verification is required before the requested action can continue.","Check the verification email and verify the account."],
  ["VEN-001","Vendor account not found","The requested vendor account could not be found.","Check the account details or contact support."],
  ["VEN-002","Vendor registration failed","Vendor registration could not be completed.","Review the information and try again."],
  ["VEN-003","Vendor access denied","The account does not have vendor access.","Use the correct vendor account or contact support."],
  ["VEN-004","Storefront unavailable","The vendor storefront is currently unavailable.","Retry later or contact the vendor/support."],
  ["VEN-005","Product creation failed","A vendor could not create the product listing.","Review the product information and try again."],
  ["VEN-006","Product update failed","A vendor could not update the product listing.","Review the information and try again."],
  ["VEN-007","Product deletion failed","A vendor could not delete the product listing.","Retry or contact support."],
  ["VEN-008","Insufficient vendor permissions","The vendor account lacks permission for the requested action.","Check the vendor role/plan or contact support."],
  ["PROD-001","Product not found","The requested product does not exist or is no longer available.","Search the marketplace for the product again."],
  ["PROD-002","Product unavailable","The product exists but cannot currently be purchased.","Try again later or choose another product."],
  ["PROD-004","Inventory unavailable","The requested quantity is not available.","Reduce the quantity or choose another product."],
  ["CART-001","Cart unavailable","The shopping cart could not be loaded.","Refresh the page and try again."],
  ["CART-002","Add to cart failed","The product could not be added to the cart.","Retry and check product availability."],
  ["CART-003","Remove from cart failed","The cart item could not be removed.","Refresh the cart and retry."],
  ["CART-004","Invalid quantity","The requested quantity is invalid.","Enter a valid quantity."],
  ["CART-005","Item unavailable","A cart item is no longer available.","Remove the unavailable item and continue."],
  ["CHECK-001","Checkout unavailable","Checkout could not be started.","Refresh and try again later."],
  ["CHECK-002","Invalid checkout information","Required checkout information is missing or invalid.","Review and correct the checkout details."],
  ["CHECK-003","Order creation failed","The order could not be created.","Do not make another payment until the order/payment status is confirmed."],
  ["PAY-001","Payment initialization failed","A payment session could not be created.","Start checkout again."],
  ["PAY-002","Payment failed","The payment provider reported a failed payment.","Confirm whether money was deducted before trying again."],
  ["PAY-003","Payment cancelled","The payment process was cancelled.","Return to checkout and retry if needed."],
  ["PAY-004","Payment pending","The payment has not reached a final state.","Wait for confirmation and avoid an immediate duplicate payment."],
  ["PAY-005","Payment verification failed","TTFL could not verify the payment result.","If money was deducted, keep the transaction reference and contact support; do not pay again yet."],
  ["PAY-006","Payment reference missing","A required payment reference is missing.","If money was deducted, contact support with the available transaction details."],
  ["PAY-007","Payment amount mismatch","The payment amount does not match the expected order amount.","Do not retry the payment; contact support."],
  ["PAY-008","Payment already processed","The payment reference has already been processed.","Do not pay again; check the order/payment status."],
  ["PAY-009","Payment timeout","The payment operation took too long to complete.","Check whether money was deducted before retrying."],
  ["PAY-010","Payment provider unavailable","The payment provider is temporarily unavailable.","Try again later."],
  ["ORD-001","Order not found","The requested order could not be found.","Check the order number and account."],
  ["ORD-002","Order creation failed","The order could not be created.","Check the payment/order status before trying again."],
  ["ORD-004","Order cancellation failed","The order could not be cancelled through the requested action.","Contact support."],
  ["ORD-005","Order already cancelled","The order is already cancelled.","No further cancellation is required."],
  ["ORD-006","Order already completed","The order is already marked completed.","Contact support if that status appears incorrect."],
  ["API-001","Invalid request","The request sent to the TTFL Store service is invalid.","Review the action and try again."],
  ["API-002","Missing required field","A required field was not supplied.","Complete the required information and retry."],
  ["API-005","Rate limit exceeded","Too many requests were made in a short period.","Wait briefly before trying again."],
  ["API-006","Internal server error","The service encountered an unexpected server-side error.","Retry later; contact support if it persists."],
  ["API-007","Service unavailable","A required service is temporarily unavailable.","Retry later."],
  ["API-008","Request timeout","The service did not respond within the expected time.","Check the connection and retry."],
  ["DB-001","Database connection failed","The application could not connect to its database.","Retry later; escalate to technical support if persistent."],
  ["DB-003","Database timeout","A database operation took too long.","Retry later."],
  ["SEC-001","Security validation failed","A security validation check failed.","Retry normally or contact support if it continues."],
  ["SEC-002","Invalid authentication token","The authentication token is invalid.","Sign in again."],
  ["SEC-003","Authentication token expired","The authentication token has expired.","Sign in again."],
  ["SEC-004","Suspicious request blocked","A security control blocked the request.","Retry normally; contact support if a legitimate request is repeatedly blocked."],
  ["SYS-001","Unexpected error","An unexpected application error occurred.","Retry and contact support if it persists."],
  ["SYS-002","Service temporarily unavailable","The requested service is temporarily unavailable.","Try again later."],
  ["SYS-003","Maintenance mode","The requested service is under maintenance.","Try again after maintenance is complete."],
  ["SYS-004","Network error","The connection to the service failed.","Check the internet connection and retry."],
  ["SYS-005","Request timeout","The operation timed out before completion.","Retry the operation."],
] as const;
\nfunction FeatureCard({ feature }: { feature: Feature }) {
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

        <section className="mt-10 rounded-card border border-graphite-200 bg-white p-6 dark:border-graphite-700 dark:bg-graphite-900">
          <div className="flex items-start gap-3">
            <Activity className="mt-0.5 h-5 w-5 text-ember-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">07 · Error codes & troubleshooting</p>
              <h2 className="mt-1 text-2xl font-bold text-graphite-900 dark:text-white">TTFL Store error code reference</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-graphite-600 dark:text-graphite-400">
                This section is designed as a customer-support reference and can also be supplied to an AI assistant. When a customer gives an error code, use the exact code below, explain its meaning in plain language, and give the listed next step. Do not invent a meaning for an unknown code.
              </p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-graphite-200 dark:border-graphite-700">
                  <th className="px-3 py-3 font-bold text-graphite-900 dark:text-white">Code</th>
                  <th className="px-3 py-3 font-bold text-graphite-900 dark:text-white">Meaning</th>
                  <th className="px-3 py-3 font-bold text-graphite-900 dark:text-white">What it means</th>
                  <th className="px-3 py-3 font-bold text-graphite-900 dark:text-white">Recommended action</th>
                </tr>
              </thead>
              <tbody>
                {errorCodes.map(([code, title, meaning, action]) => (
                  <tr key={code} className="border-b border-graphite-100 align-top dark:border-graphite-800">
                    <td className="px-3 py-3 font-mono text-xs font-bold text-ember-700 dark:text-ember-300">{code}</td>
                    <td className="px-3 py-3 font-semibold text-graphite-900 dark:text-white">{title}</td>
                    <td className="px-3 py-3 leading-5 text-graphite-600 dark:text-graphite-400">{meaning}</td>
                    <td className="px-3 py-3 leading-5 text-graphite-600 dark:text-graphite-400">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-card bg-cloud-100 p-4 dark:bg-graphite-950">
              <p className="text-sm font-bold text-graphite-900 dark:text-white">For MAX / Meta AI customer support</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-graphite-600 dark:text-graphite-400">
                <li>• Quote the exact error code the customer provided.</li>
                <li>• Explain the documented meaning without adding unsupported causes.</li>
                <li>• Give the documented next step and link to the TTFL Store Error Code Checker when appropriate.</li>
                <li>• If the code is unknown, ask for the exact code/message instead of guessing.</li>
              </ul>
            </div>
            <div className="rounded-card bg-cloud-100 p-4 dark:bg-graphite-950">
              <p className="text-sm font-bold text-graphite-900 dark:text-white">Security and payment rules</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-graphite-600 dark:text-graphite-400">
                <li>• Never ask for a password, OTP, PIN, CVV, full card number, authentication token, or other secret.</li>
                <li>• For payment errors, first determine whether the customer's money was deducted.</li>
                <li>• If money may have been deducted, do not tell the customer to make a duplicate payment until the status is confirmed.</li>
                <li>• Safe support references include an order number, transaction reference, or Product ID when needed.</li>
              </ul>
            </div>
          </div>
          <div className="mt-5 rounded-card border border-graphite-200 p-4 dark:border-graphite-700">
            <p className="text-sm font-bold text-graphite-900 dark:text-white">Customer support escalation</p>
            <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">
              If the documented recovery step does not resolve the issue, collect the non-sensitive reference needed to investigate (for example order number or transaction reference), describe what happened, and direct the customer to TTFL Store support. Never claim that a refund, payment reversal, delivery update, account change, or other administrative action has happened unless the system confirms it.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-card border border-graphite-200 bg-graphite-950 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-400">08 · AI knowledge-base guidance</p>
          <h2 className="mt-1 text-2xl font-bold">TTFL Store information for AI assistants</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-bold">Use this documentation as the TTFL Store reference</h3>
              <p className="mt-1 text-sm leading-6 text-white/70">An AI assistant answering TTFL Store customer questions should use the documented features, workflows, error codes, and security rules on this page. It should not invent policies, prices, refunds, delivery promises, product availability, or backend actions that are not documented or confirmed by the live system.</p>
            </div>
            <div>
              <h3 className="font-bold">When information is missing</h3>
              <p className="mt-1 text-sm leading-6 text-white/70">Ask a focused follow-up question or direct the customer to support. For an unknown error code, request the exact code and message. For order or payment issues, request only safe references such as the order number or transaction reference.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/error-codes" className="rounded-card bg-white px-4 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100">Open Error Code Checker</Link>
            <Link href="/support" className="rounded-card border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">Open Support</Link>
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
