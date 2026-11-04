import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description: "How TTFL Store supports safer marketplace listings, payments, reviews and customer reporting.",
  openGraph: {
    title: "Trust & Safety | TTFL Store",
    description: "Read about seller checks, listing standards, payments and reporting on TTFL Store.",
    images: ["/ttflstore.png"],
  },
};

export default function TrustPage() {
  return (
    <SeoContentPage
      eyebrow="Trust & safety"
      title="Safer shopping starts with clear information"
      description="TTFL Store provides marketplace tools and reporting channels intended to help customers make informed decisions and help vendors operate responsibly. No online marketplace can guarantee that every listing, seller or transaction is risk-free."
      sections={[
        {
          title: "Seller applications and verification",
          body: "Vendors must complete the marketplace's application and approval process before operating an approved store. A Verified indicator means the account or store has passed the checks represented by that badge. It is not a guarantee of a product's authenticity, condition, safety, quality or future fulfilment.",
        },
        {
          title: "Accurate product listings",
          body: "Vendors must provide truthful product names, descriptions, images, specifications, prices, stock and condition information. Listings must not contain counterfeit or stolen goods, unlawful products, deceptive claims, copied material used without permission or images that infringe another person's rights. Customers should compare listing details and ask questions before purchasing where needed.",
        },
        {
          title: "Payments",
          body: "When TTFL Store checkout is used, payments are handled through the payment provider shown during checkout. Customers should confirm that they are using the genuine TTFL Store website and should not share card PINs, passwords or one-time authentication codes with sellers or support staff. Be cautious if a seller asks you to pay through an unrelated personal account.",
        },
        {
          title: "Reviews and seller feedback",
          body: "Reviews should reflect genuine customer experiences. TTFL Store may investigate suspected fake reviews, review manipulation, abusive content or conflicts of interest. Genuine negative feedback is not prohibited simply because a seller disagrees with it.",
        },
        {
          title: "Reporting suspicious activity",
          body: "Customers can report suspected counterfeit products, misleading listings, non-delivery, payment requests outside the stated checkout flow, impersonation or other marketplace concerns through the Report a Problem form. Include the listing URL, order reference and supporting evidence where possible. A report is an allegation for review, not an automatic finding of wrongdoing.",
        },
        {
          title: "Order issues and refunds",
          body: "If a product is not delivered, arrives damaged or materially differs from its listing, contact TTFL Store promptly through the support process. Keep the order number, receipt, photographs and relevant messages. See the Returns & Refunds page for the steps and factors considered.",
        },
        {
          title: "Account and payment security",
          body: "Use a unique password, sign out of shared devices and never share authentication codes. TTFL Store support will not need your password, payment PIN or one-time code to investigate a report. Report suspicious messages or requests through the Help Centre.",
        },
        {
          title: "How to get help",
          body: "The public Help Centre contains order guidance and common answers. Signed-in customers can submit a protected support report and follow the conversation from their account. Read the Privacy Policy to understand how marketplace and advertising information is handled.",
        },
      ]}
      actions={[
        { href: "/support", label: "Help Centre" },
        { href: "/support/report", label: "Report a problem" },
        { href: "/support/refunds", label: "Returns and refunds" },
        { href: "/legal/privacy", label: "Privacy Policy" },
      ]}
    />
  );
}
