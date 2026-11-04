import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "How TTFL Store customers can raise order, return, cancellation and refund requests.",
  openGraph: {
    title: "Returns & Refunds | TTFL Store",
    description: "Understand the TTFL Store process for returns, cancellations and refunds.",
    images: ["/ttflstore.png"],
  },
};

export default function RefundsPage() {
  return (
    <SeoContentPage
      eyebrow="Customer support"
      title="Returns, cancellations and refunds"
      description="This page explains how to raise an order issue on TTFL Store. Eligibility depends on the item, the listing and order terms, the reason for the request and applicable consumer-protection law. Review the product listing before ordering and keep your order reference."
      sections={[
        {
          title: "1. Before placing an order",
          body: "Review the product description, specifications, images, condition, selected variation, price, delivery estimate and seller details. If a detail is unclear or important to your decision, ask the seller to confirm it in writing before paying. Keep a copy of the listing and order confirmation.",
        },
        {
          title: "2. When to raise a request",
          body: "Contact TTFL Store promptly if an order is not delivered as expected, arrives damaged, is materially different from its listing, appears counterfeit, or if you believe a payment or seller interaction was fraudulent. Include the order number, product name, a clear explanation and relevant photographs or messages where available.",
        },
        {
          title: "3. How to submit a request",
          body: "Sign in to TTFL Store and use the Help Centre's Report a Problem form. Select TTFL Store Products and include your order number. You can also open your account order history where available. Do not send card numbers, payment PINs, passwords or one-time codes to a vendor or support agent.",
        },
        {
          title: "4. Review and resolution",
          body: "TTFL Store may review the order record and ask the customer and vendor for relevant information. Depending on the circumstances, the available resolution may include delivery follow-up, a return arrangement, cancellation, replacement or refund. A request is not automatically approved; the decision depends on the evidence, the applicable listing and order terms, payment status and applicable law.",
        },
        {
          title: "5. Vendor obligations",
          body: "Vendors must honour the product description, condition, price and fulfilment commitments shown when an order is accepted. Vendors must cooperate with reasonable order investigations and must not pressure customers to withdraw truthful complaints or move payment to an unprotected channel.",
        },
        {
          title: "6. Refund processing",
          body: "Where a refund is approved for a payment made through Paystack or another payment provider, the payment provider's processing rules and the original payment method may affect when the funds appear. TTFL Store will use the available transaction record to confirm the refund status. A refund should not be treated as complete until its status is confirmed.",
        },
        {
          title: "7. Exceptions and legal rights",
          body: "Some products or services may have specific return conditions disclosed before purchase. Nothing on this page is intended to remove a consumer right that cannot lawfully be excluded. If a listing-specific policy conflicts with applicable law, applicable law takes priority.",
        },
        {
          title: "8. Keep your evidence",
          body: "Keep your order confirmation, payment receipt, product photographs, delivery records and relevant messages until the issue is resolved. Submit truthful information only; knowingly false reports or manipulated evidence may result in account action.",
        },
      ]}
      actions={[
        { href: "/support", label: "Visit the Help Centre" },
        { href: "/support/report?marketplace=STORE", label: "Report an order problem" },
        { href: "/legal/terms", label: "Terms and Conditions" },
      ]}
    />
  );
}
