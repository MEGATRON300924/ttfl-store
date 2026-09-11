"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Landmark,
  Package,
  Rocket,
  ShoppingBag,
  Store,
  Wallet,
  X,
  Zap,
} from "lucide-react";

const STORAGE_KEY = "ttfl.vendorDashboardTutorial.v1";

type Props = {
  open?: boolean;
};

const sections = [
  {
    icon: Package,
    title: "My products",
    body: "Add, edit, and manage everything you sell. You can see your products, update prices and stock, and create new listings.",
  },
  {
    icon: ShoppingBag,
    title: "Orders",
    body: "This is where you manage customer orders. Check what was ordered and keep an eye on the order status while you prepare and fulfil it.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "See how your store is performing, including product views, clicks, revenue, and best-selling products.",
  },
  {
    icon: Wallet,
    title: "Payouts",
    body: "Connect your bank account and see your sales, earnings, and pending settlements. TTFL Store uses Paystack for settlements.",
  },
  {
    icon: CreditCard,
    title: "Subscription",
    body: "Choose and manage your vendor plan. Plans can change how many products you can list and the marketplace commission rate that applies to your sales.",
  },
  {
    icon: Store,
    title: "Store settings & public profile",
    body: "Update your store information, branding, storefront appearance, and public profile. These are the details customers see when they visit your store.",
  },
  {
    icon: Zap,
    title: "Promote, Flash deals & Coupons",
    body: "Use these tools to market your products. Promotions can help customers discover your products, while Flash deals and Coupons let you offer special discounts.",
  },
  {
    icon: Rocket,
    title: "Launch campaigns",
    body: "Use launches when you want to prepare a product for a planned release. A Coming Soon product can be shown before it is available for normal purchase.",
  },
];

export function VendorDashboardTutorial({ open = false }: Props) {
  const [visible, setVisible] = useState(open);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "completed") setVisible(true);
    } catch {
      // If storage is unavailable, the dashboard still works normally.
    }
  }, [open]);

  function finish() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "completed");
    } catch {
      // The tutorial can still be closed if storage is unavailable.
    }
    setVisible(false);
  }

  if (!visible) return null;

  const isLast = step === sections.length - 1;
  const current = sections[step];
  const CurrentIcon = current.icon;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-graphite-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="vendor-tutorial-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card border border-graphite-200 bg-white shadow-2xl dark:border-graphite-700 dark:bg-graphite-950">
        <div className="sticky top-0 flex items-center justify-between border-b border-graphite-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-graphite-800 dark:bg-graphite-950/95">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">TTFL Store Vendor Guide</p>
            <h2 id="vendor-tutorial-title" className="mt-1 text-lg font-bold text-graphite-900 dark:text-white">Welcome to your vendor dashboard 👋</h2>
          </div>
          <button type="button" onClick={finish} aria-label="Close tutorial" className="rounded-full p-2 text-graphite-500 hover:bg-cloud-100 hover:text-graphite-900 dark:hover:bg-graphite-800 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          {step === 0 && (
            <div className="mb-6 rounded-card border border-ember-200 bg-ember-50 p-4 dark:border-ember-500/30 dark:bg-ember-950/20">
              <p className="text-sm leading-6 text-graphite-700 dark:text-graphite-300">
                This quick guide explains the dashboard in simple terms. You do not need to be technical to use TTFL Store. You can come back to the <strong>Vendor tutorials</strong> section on your dashboard whenever you need help.
              </p>
            </div>
          )}

          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-800 dark:bg-graphite-800 dark:text-white">
              <CurrentIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Step {step + 1} of {sections.length}</p>
              <h3 className="mt-1 text-xl font-bold text-graphite-900 dark:text-white">{current.title}</h3>
              <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-300">{current.body}</p>
            </div>
          </div>

          {current.title === "My products" && (
            <div className="mt-5 rounded-card border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-800 dark:bg-graphite-900">
              <p className="font-semibold text-graphite-900 dark:text-white">What does “Coming Soon” mean?</p>
              <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-300">Coming Soon is for a product you want customers to know about before it is available to buy normally. You can publish the product early, show when it is expected to launch, and let interested customers join the waitlist. When the product is ready, you can make it available normally.</p>
              <p className="mt-2 text-sm font-medium text-graphite-700 dark:text-graphite-200">Use it for new products, upcoming stock, pre-launch announcements, or planned releases.</p>
            </div>
          )}

          {current.title === "Subscription" && (
            <div className="mt-5 rounded-card border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-800 dark:bg-graphite-900">
              <p className="font-semibold text-graphite-900 dark:text-white">Plans in simple terms</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-graphite-600 dark:text-graphite-300">
                <li><strong className="text-graphite-900 dark:text-white">Free:</strong> good for getting started. It has the plan's product limit and commission rate shown on the page.</li>
                <li><strong className="text-graphite-900 dark:text-white">Paid plans:</strong> generally give you more capacity and/or a lower commission rate, depending on the plan.</li>
                <li><strong className="text-graphite-900 dark:text-white">Choose a plan:</strong> select the plan that fits your store. Paid plans may send you to Paystack to complete payment.</li>
              </ul>
              <p className="mt-2 text-xs leading-5 text-graphite-500">Always check the exact price, product limit, commission, billing period, and features shown on your Subscription page before choosing a plan.</p>
            </div>
          )}

          {current.title === "Payouts" && (
            <div className="mt-5 rounded-card border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-800 dark:bg-graphite-900">
              <p className="font-semibold text-graphite-900 dark:text-white">How payout works</p>
              <ol className="mt-2 space-y-2 text-sm leading-6 text-graphite-600 dark:text-graphite-300">
                <li><strong className="text-graphite-900 dark:text-white">1.</strong> A customer pays for an order.</li>
                <li><strong className="text-graphite-900 dark:text-white">2.</strong> Your plan's TTFL Store commission is applied.</li>
                <li><strong className="text-graphite-900 dark:text-white">3.</strong> Your share goes through Paystack settlement.</li>
                <li><strong className="text-graphite-900 dark:text-white">4.</strong> You normally do not need to request a manual payout for every order.</li>
              </ol>
            </div>
          )}

          <div className="mt-6 flex gap-1" aria-label="Tutorial progress">
            {sections.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-ember-600" : "bg-cloud-200 dark:bg-graphite-800"}`} />)}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="rounded-card border border-graphite-300 px-4 py-2.5 text-sm font-semibold text-graphite-800 disabled:opacity-40 dark:border-graphite-700 dark:text-white">Back</button>
            <button type="button" onClick={isLast ? finish : () => setStep((value) => Math.min(sections.length - 1, value + 1))} className="rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">{isLast ? "Finish tutorial" : "Next"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VendorTutorialsSection() {
  const [open, setOpen] = useState(false);
  const [troubleOpen, setTroubleOpen] = useState(false);

  return (
    <section className="mt-8 rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-800 dark:bg-graphite-800 dark:text-white"><BookOpen className="h-5 w-5" /></span>
        <div>
          <h2 className="font-bold text-graphite-900 dark:text-white">Vendor tutorials</h2>
          <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-300">Need a reminder? Open the dashboard guide again or check the common sign-in fix below.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => setOpen(true)} className="flex items-start gap-3 rounded-card border border-graphite-200 p-4 text-left hover:border-ember-600 dark:border-graphite-700 dark:hover:border-ember-500">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-ember-600" />
          <span><span className="block text-sm font-semibold text-graphite-900 dark:text-white">Open vendor tutorial</span><span className="mt-0.5 block text-xs leading-5 text-graphite-500">Learn what each dashboard section does.</span></span>
        </button>
        <button type="button" onClick={() => setTroubleOpen((value) => !value)} className="flex items-start gap-3 rounded-card border border-graphite-200 p-4 text-left hover:border-ember-600 dark:border-graphite-700 dark:hover:border-ember-500">
          <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-ember-600" />
          <span><span className="block text-sm font-semibold text-graphite-900 dark:text-white">Authentication problem?</span><span className="mt-0.5 block text-xs leading-5 text-graphite-500">Fix “Authentication required” after being away.</span></span>
        </button>
      </div>

      {troubleOpen && (
        <div className="mt-4 rounded-card border border-gold-200 bg-gold-50 p-4 dark:border-gold-500/30 dark:bg-gold-950/20">
          <p className="font-semibold text-graphite-900 dark:text-white">If you see “Authentication required” while adding a product</p>
          <p className="mt-1 text-sm leading-6 text-graphite-700 dark:text-graphite-300">This can happen if you have not opened your store for a while and your login session has expired. It does not mean your store or product is broken.</p>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-graphite-700 dark:text-graphite-300">
            <li><strong className="text-graphite-900 dark:text-white">1.</strong> Go to your <Link href="/account" className="font-semibold text-ember-600 underline">Account</Link> page.</li>
            <li><strong className="text-graphite-900 dark:text-white">2.</strong> Log out of your TTFL Store account.</li>
            <li><strong className="text-graphite-900 dark:text-white">3.</strong> Sign in again with your vendor account.</li>
            <li><strong className="text-graphite-900 dark:text-white">4.</strong> Return to the vendor dashboard and start the product process again.</li>
          </ol>
          <p className="mt-3 text-xs leading-5 text-graphite-600 dark:text-graphite-400">If the address bar is still showing <strong>ttflstore.name.ng/vendor/dashboard</strong>, you can change it to <strong>ttflstore.name.ng/account</strong>, then log out and sign in again.</p>
        </div>
      )}

      {open && <VendorDashboardTutorial open onClose={undefined} />}
    </section>
  );
}
