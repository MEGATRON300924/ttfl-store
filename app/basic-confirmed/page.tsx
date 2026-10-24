"use client";

import { CheckCircle2, ShieldCheck, MessageCircle, ArrowUpRight, Megaphone, CreditCard } from "lucide-react";

const whatsappMessage = "Hello The Tron Forge Limited, I have completed payment for the Basic Advertising Plan. Please verify my payment and guide me on the next steps. My Paystack payment reference is: ";
const whatsappUrl = `https://wa.me/12502556589?text=${encodeURIComponent(whatsappMessage)}`;

export default function BasicConfirmedPage() {
  return (
    <main className="relative isolate overflow-hidden bg-[#f6f7fb] px-4 py-12 text-slate-900 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -right-20 top-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <img src="/ttflstore.png" alt="TTFL Store logo" className="h-12 w-12 rounded-xl object-contain" />
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-slate-900">THE TRON FORGE LIMITED</p>
            <p className="mt-1 text-xs font-medium tracking-[0.18em] text-slate-500">ADVERTISING SERVICES</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_-30px_rgba(15,23,42,0.24)]">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-9 text-center text-white sm:px-12 sm:py-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-inner">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2.2} aria-hidden="true" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-50">Basic Advertising Plan</p>
            <h1 className="mx-auto mt-3 max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">Thank you for your payment!</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-emerald-50 sm:text-base">
              Thank you for choosing The Tron Forge Limited for your advertising. You’re one step closer to getting your campaign started.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-blue-100 p-2.5 text-blue-700"><Megaphone className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <h2 className="font-bold text-slate-900">Your next step: contact our team</h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    Tap the WhatsApp button below to tell us you’ve completed payment. Please share your Paystack transaction reference or receipt so our team can verify it and help you with the advertising setup.
                  </p>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-center font-bold text-white shadow-lg shadow-emerald-900/10 hover:bg-[#1fbd5b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Continue to WhatsApp
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <div className="mt-5 flex items-start gap-3 rounded-xl px-1 py-2 text-sm text-slate-500">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <p><span className="font-semibold text-slate-700">Payment verification:</span> this page is your return page after checkout. Your payment and campaign will be confirmed by our team after the transaction is verified.</p>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-2 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 sm:flex-row sm:gap-3">
              <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" aria-hidden="true" /> Secure checkout powered by Paystack</span>
              <span className="hidden sm:inline">•</span>
              <span>The Tron Forge Limited</span>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          If you have already received a Paystack receipt, keep it handy when messaging us. Thank you for supporting The Tron Forge Limited.
        </p>
      </div>
    </main>
  );
}
