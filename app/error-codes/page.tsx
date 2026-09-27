"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Search, ShieldCheck } from "lucide-react";

type ErrorCode = {
  code: string;
  title: string;
  meaning: string;
  action: string;
  category: string;
};

const ERROR_CODES: ErrorCode[] = [
  { code: "AUTH-001", title: "Invalid credentials", meaning: "The email and password combination is incorrect.", action: "Check the login details or use Forgot Password.", category: "Authentication" },
  { code: "AUTH-002", title: "Account not found", meaning: "No matching account was found for the supplied details.", action: "Check the email address or register if you do not have an account.", category: "Authentication" },
  { code: "AUTH-003", title: "Account disabled", meaning: "The account cannot currently authenticate.", action: "Contact TTFL Store support.", category: "Authentication" },
  { code: "AUTH-004", title: "Session expired", meaning: "Your login session has expired.", action: "Sign in again.", category: "Authentication" },
  { code: "AUTH-005", title: "Unauthorized", meaning: "This feature requires authentication.", action: "Sign in and try again.", category: "Authentication" },
  { code: "AUTH-006", title: "Forbidden", meaning: "Your account does not have permission for this action.", action: "Check your account role or contact support.", category: "Authentication" },
  { code: "PASS-001", title: "Reset request failed", meaning: "A password reset request could not be completed.", action: "Try requesting the reset link again.", category: "Password" },
  { code: "PASS-002", title: "Reset token invalid", meaning: "The password reset link is not valid.", action: "Request a new password reset link.", category: "Password" },
  { code: "PASS-003", title: "Reset token expired", meaning: "The password reset link has expired.", action: "Request a new reset link.", category: "Password" },
  { code: "PASS-004", title: "Password mismatch", meaning: "The two new passwords do not match.", action: "Enter the same password in both fields.", category: "Password" },
  { code: "PASS-005", title: "Password rejected", meaning: "The new password does not meet the password requirements.", action: "Choose a stronger password that meets the requirements.", category: "Password" },
  { code: "EMAIL-001", title: "Email not sent", meaning: "The requested email could not be sent.", action: "Try again shortly and check the email address.", category: "Email" },
  { code: "EMAIL-002", title: "Email delivery delayed", meaning: "The email may have been accepted but has not arrived yet.", action: "Check your inbox, spam, junk and promotions folders.", category: "Email" },
  { code: "EMAIL-003", title: "Invalid email", meaning: "The supplied email address is invalid.", action: "Enter a valid email address.", category: "Email" },
  { code: "ACC-001", title: "Registration failed", meaning: "Account creation could not be completed.", action: "Check the supplied information and try again.", category: "Account" },
  { code: "ACC-002", title: "Email already registered", meaning: "An account may already exist with this email.", action: "Try signing in or resetting the password.", category: "Account" },
  { code: "ACC-003", title: "Verification required", meaning: "The account requires email verification.", action: "Verify the email address before continuing.", category: "Account" },
  { code: "VEN-001", title: "Vendor account not found", meaning: "The requested vendor account could not be found.", action: "Check the vendor account details or contact support.", category: "Vendor" },
  { code: "VEN-002", title: "Vendor registration failed", meaning: "Vendor registration could not be completed.", action: "Check the registration information and try again.", category: "Vendor" },
  { code: "VEN-003", title: "Vendor access denied", meaning: "The account does not have the required vendor permissions.", action: "Sign in with the correct vendor account or contact support.", category: "Vendor" },
  { code: "VEN-004", title: "Storefront unavailable", meaning: "The requested vendor storefront cannot currently be accessed.", action: "Try again later or contact the vendor/support.", category: "Vendor" },
  { code: "VEN-005", title: "Product creation failed", meaning: "A vendor could not create the requested product.", action: "Check the product information and try again.", category: "Vendor" },
  { code: "VEN-006", title: "Product update failed", meaning: "A vendor could not update the product.", action: "Check the product information and try again.", category: "Vendor" },
  { code: "VEN-007", title: "Product deletion failed", meaning: "A vendor could not delete the product.", action: "Try again or contact support.", category: "Vendor" },
  { code: "VEN-008", title: "Insufficient vendor permissions", meaning: "The vendor account does not have permission for the requested action.", action: "Check the vendor plan/role or contact support.", category: "Vendor" },
  { code: "PROD-001", title: "Product not found", meaning: "The requested product does not exist or is unavailable.", action: "Search for the product again or browse the store.", category: "Product" },
  { code: "PROD-002", title: "Product unavailable", meaning: "The product exists but cannot currently be purchased.", action: "Check availability later or choose another product.", category: "Product" },
  { code: "PROD-004", title: "Inventory unavailable", meaning: "The requested quantity is not available.", action: "Reduce the quantity or choose another product.", category: "Product" },
  { code: "CART-001", title: "Cart unavailable", meaning: "The shopping cart could not be loaded.", action: "Refresh the page and try again.", category: "Cart" },
  { code: "CART-002", title: "Add to cart failed", meaning: "The product could not be added to the cart.", action: "Try again or check product availability.", category: "Cart" },
  { code: "CART-003", title: "Remove from cart failed", meaning: "The product could not be removed from the cart.", action: "Refresh and try again.", category: "Cart" },
  { code: "CART-004", title: "Invalid quantity", meaning: "The requested product quantity is invalid.", action: "Enter a valid quantity.", category: "Cart" },
  { code: "CART-005", title: "Item unavailable", meaning: "A cart item is no longer available.", action: "Remove the unavailable item and continue shopping.", category: "Cart" },
  { code: "CHECK-001", title: "Checkout unavailable", meaning: "Checkout could not be started.", action: "Refresh and try again later.", category: "Checkout" },
  { code: "CHECK-002", title: "Invalid checkout information", meaning: "Required checkout information is missing or invalid.", action: "Review your checkout details.", category: "Checkout" },
  { code: "CHECK-003", title: "Order creation failed", meaning: "The order could not be created.", action: "Do not make another payment until the order/payment status is confirmed.", category: "Checkout" },
  { code: "PAY-001", title: "Payment initialization failed", meaning: "A payment session could not be created.", action: "Try starting the payment again.", category: "Payment" },
  { code: "PAY-002", title: "Payment failed", meaning: "The payment provider reported a failed payment.", action: "Confirm whether money was deducted before retrying.", category: "Payment" },
  { code: "PAY-003", title: "Payment cancelled", meaning: "The payment was cancelled before completion.", action: "Return to checkout and retry if you still want to purchase.", category: "Payment" },
  { code: "PAY-004", title: "Payment pending", meaning: "The payment has not reached a final state.", action: "Wait for verification and do not pay again immediately.", category: "Payment" },
  { code: "PAY-005", title: "Payment verification failed", meaning: "TTFL Store could not verify the payment successfully.", action: "If money was deducted, keep the transaction reference and contact support. Do not pay again yet.", category: "Payment" },
  { code: "PAY-006", title: "Payment reference missing", meaning: "A required payment reference was not received.", action: "Contact support if money was deducted.", category: "Payment" },
  { code: "PAY-007", title: "Payment amount mismatch", meaning: "The payment amount does not match the expected order amount.", action: "Do not retry payment. Contact TTFL Store support.", category: "Payment" },
  { code: "PAY-008", title: "Payment already processed", meaning: "The payment reference has already been processed.", action: "Do not pay again. Check your order/payment status.", category: "Payment" },
  { code: "PAY-009", title: "Payment timeout", meaning: "The payment process took too long or timed out.", action: "Check whether money was deducted before retrying.", category: "Payment" },
  { code: "PAY-010", title: "Payment provider unavailable", meaning: "The payment provider is temporarily unavailable.", action: "Try again later.", category: "Payment" },
  { code: "ORD-001", title: "Order not found", meaning: "The requested order could not be found.", action: "Check the order number and account.", category: "Order" },
  { code: "ORD-002", title: "Order creation failed", meaning: "The order could not be created.", action: "Check the payment/order status before trying again.", category: "Order" },
  { code: "ORD-004", title: "Order cancellation failed", meaning: "The order could not be cancelled.", action: "Contact support if cancellation is still required.", category: "Order" },
  { code: "ORD-005", title: "Order already cancelled", meaning: "The order has already been cancelled.", action: "No further cancellation is required.", category: "Order" },
  { code: "ORD-006", title: "Order already completed", meaning: "The order has reached a completed state.", action: "Contact support if you believe this is incorrect.", category: "Order" },
  { code: "API-001", title: "Invalid request", meaning: "The submitted request is invalid.", action: "Check the information and try again.", category: "API" },
  { code: "API-002", title: "Missing required field", meaning: "A required field was not supplied.", action: "Complete the required information and try again.", category: "API" },
  { code: "API-005", title: "Rate limit exceeded", meaning: "Too many requests were made in a short period.", action: "Wait a moment and try again.", category: "API" },
  { code: "API-006", title: "Internal server error", meaning: "An unexpected server error occurred.", action: "Try again shortly. Contact support if it continues.", category: "API" },
  { code: "API-007", title: "Service unavailable", meaning: "A requested backend service is temporarily unavailable.", action: "Try again later.", category: "API" },
  { code: "API-008", title: "Request timeout", meaning: "The backend did not respond in time.", action: "Check your connection and try again.", category: "API" },
  { code: "DB-001", title: "Database connection failed", meaning: "The application could not connect to its database.", action: "Try again later. This normally requires technical support.", category: "System" },
  { code: "DB-003", title: "Database timeout", meaning: "A database operation took too long.", action: "Try again later.", category: "System" },
  { code: "SEC-001", title: "Security validation failed", meaning: "A security validation check failed.", action: "Try again normally. Contact support if it persists.", category: "Security" },
  { code: "SEC-002", title: "Invalid authentication token", meaning: "The authentication token is invalid.", action: "Sign in again.", category: "Security" },
  { code: "SEC-003", title: "Authentication token expired", meaning: "The authentication token has expired.", action: "Sign in again.", category: "Security" },
  { code: "SEC-004", title: "Suspicious request blocked", meaning: "A security mechanism blocked the request.", action: "Try again normally. Contact support if you believe it is a mistake.", category: "Security" },
  { code: "SYS-001", title: "Unexpected error", meaning: "An unexpected application error occurred.", action: "Try again. Contact support if the problem continues.", category: "System" },
  { code: "SYS-002", title: "Service temporarily unavailable", meaning: "A TTFL Store service is temporarily unavailable.", action: "Try again later.", category: "System" },
  { code: "SYS-003", title: "Maintenance mode", meaning: "A feature or service is temporarily unavailable for maintenance.", action: "Try again when the service is available.", category: "System" },
  { code: "SYS-004", title: "Network error", meaning: "A network connection could not be established.", action: "Check your internet connection and try again.", category: "System" },
  { code: "SYS-005", title: "Request timeout", meaning: "The requested operation timed out.", action: "Try again.", category: "System" },
];

export default function ErrorCodeCheckerPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ErrorCode | null>(null);
  const [copied, setCopied] = useState(false);

  const matches = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return ERROR_CODES;
    return ERROR_CODES.filter((item) =>
      [item.code, item.title, item.meaning, item.category].some((field) =>
        field.toLowerCase().includes(value)
      )
    );
  }, [query]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function choose(code: ErrorCode) {
    setSelected(code);
    setCopied(false);
  }

  return (
    <div className="shell py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL Store Support</p>
          <h1 className="mt-2 text-3xl font-bold text-graphite-900">Error Code Checker</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-graphite-600">
            Enter a TTFL Store error code to understand what happened and what to do next.
          </p>
        </div>

        <div className="mx-auto mt-7 max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-graphite-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search an error code, e.g. PAY-005"
              className="w-full rounded-card border border-graphite-200 bg-white py-4 pl-12 pr-4 text-sm font-mono outline-none focus:border-ember-600 focus:ring-2 focus:ring-ember-100"
              aria-label="Search TTFL Store error codes"
            />
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="rounded-card border border-graphite-200 bg-white">
            <div className="flex items-center justify-between border-b border-graphite-100 px-4 py-3">
              <p className="text-sm font-semibold text-graphite-900">Error codes</p>
              <p className="text-xs text-graphite-500">{matches.length} found</p>
            </div>

            {matches.length === 0 ? (
              <div className="p-10 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-graphite-300" />
                <p className="mt-3 font-semibold text-graphite-900">No matching error code</p>
                <p className="mt-1 text-sm text-graphite-500">
                  Check the code and try again. Do not guess an unknown code.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-graphite-100">
                {matches.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => choose(item)}
                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-cloud-50 ${selected?.code === item.code ? "bg-cloud-50" : ""}`}
                  >
                    <code className="mt-0.5 shrink-0 rounded-[6px] bg-ember-100 px-2 py-1 font-mono text-xs font-bold text-ember-700">
                      {item.code}
                    </code>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-graphite-900">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-graphite-500">{item.meaning}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-card border border-graphite-200 bg-white p-5 lg:sticky lg:top-24">
            {!selected ? (
              <div className="py-10 text-center">
                <Search className="mx-auto h-8 w-8 text-graphite-300" />
                <p className="mt-3 font-semibold text-graphite-900">Select an error code</p>
                <p className="mt-1 text-sm leading-5 text-graphite-500">
                  The meaning and recommended next step will appear here.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-600">
                  {selected.category}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all font-mono text-xl font-bold text-graphite-900">
                    {selected.code}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyCode(selected.code)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] border border-graphite-200 px-3 py-2 text-xs font-semibold text-graphite-800 hover:bg-cloud-100"
                    aria-label={`Copy ${selected.code}`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <h2 className="mt-4 text-lg font-bold text-graphite-900">{selected.title}</h2>

                <div className="mt-4 rounded-[8px] bg-cloud-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">What it means</p>
                  <p className="mt-1 text-sm leading-6 text-graphite-800">{selected.meaning}</p>
                </div>

                <div className="mt-3 rounded-[8px] bg-verified-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-verified-700">What to do</p>
                  <p className="mt-1 text-sm leading-6 text-graphite-800">{selected.action}</p>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-graphite-500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-verified-600" />
                  <span>Never send your password, OTP, PIN, CVV, or authentication token to support.</span>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
