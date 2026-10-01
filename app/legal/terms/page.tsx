import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "TTFL Store Terms and Conditions for customers, vendors and marketplace use.",
  openGraph: { title: "Terms of Service | TTFL Store", description: "Read the TTFL Store Terms and Conditions.", images: ["/ttflstore.png"] },
};

export default function TermsPage() {
  return (
    <SeoContentPage
      eyebrow="Legal · Version 2026-10-01-v1"
      title="TTFL Store Terms and Conditions"
      description="These Terms govern the use of TTFL Store by customers, vendors, staff and visitors. They are written to make the marketplace rules clear before you use account, shopping or vendor features."
      sections={[
        {
          title: "1. About TTFL Store",
          body: "TTFL Store is a marketplace operated by The Tron Forge Limited. TTFL Store provides technology that allows independent vendors to list products or services and customers to discover, order and communicate about them. Unless TTFL Store expressly says otherwise, the vendor remains responsible for the products, descriptions, prices, fulfilment and customer obligations attached to its listings.",
        },
        {
          title: "2. Accounts and accurate information",
          body: "You must provide accurate information and keep your account details up to date. Keep your password, sessions and verification information secure. Do not use another person's account, impersonate another person or create accounts to evade a restriction. TTFL Store may suspend or restrict accounts involved in fraud, abuse, unlawful activity or material violations of these Terms.",
        },
        {
          title: "3. Customer responsibilities",
          body: "Customers must provide accurate delivery and contact information, use supported payment methods honestly, inspect listings before ordering and communicate respectfully with vendors and TTFL Store support. Customers must not use the marketplace to facilitate fraud, harassment, unlawful transactions or payment deception.",
        },
        {
          title: "4. Vendor responsibilities",
          body: "Vendors must list products and services accurately, use genuine and lawful products, disclose relevant condition or limitations, keep prices and stock current, fulfil accepted orders within the stated or agreed timeframe, communicate with customers appropriately and cooperate with TTFL Store investigations. Counterfeit, stolen, fraudulent, prohibited or unlawfully supplied goods are not allowed.",
        },
        {
          title: "5. Orders, payments and fulfilment",
          body: "An order contains the information shown at checkout, including the applicable vendor items, price, delivery details and payment status. Payments are processed through supported payment providers. Vendors are responsible for fulfilment of their own accepted orders. Refunds, cancellations, returns and disputes are handled according to the applicable TTFL Store policies, the order details and applicable law.",
        },
        {
          title: "6. Reviews and store ratings",
          body: "Only customers who completed eligible purchases may submit reviews. Reviews should describe the customer's genuine experience. Customers may rate areas such as delivery, customer service, product quality, description accuracy and value for money. TTFL Store may investigate, hide or remove reviews that are fraudulent, abusive, unlawful, unrelated, or otherwise violate the marketplace rules. TTFL Store does not remove genuine negative feedback simply because a vendor disagrees with it.",
        },
        {
          title: "7. Store safety warnings",
          body: "TTFL Store may display a caution notice when recent verified customer reviews contain a repeated pattern of poor experiences. A caution notice is an informational signal, not a finding that a vendor is a scam or that every order from that vendor will fail. Customers should read the underlying reviews and make their own purchasing decision. Vendors may report reviews or provide evidence through TTFL Store's review and support processes.",
        },
        {
          title: "8. Reporting stores and suspicious activity",
          body: "Customers may report suspected scams, counterfeit products, misleading listings, off-platform payment requests, non-delivery, harassment or other suspicious activity. Reports should contain truthful information and useful evidence where available. Submitting a report does not automatically establish wrongdoing. TTFL Store may investigate and take proportionate marketplace action.",
        },
        {
          title: "9. Vendor dashboard and Max AI analytics",
          body: "Vendor analytics are provided to help vendors understand store performance. Max AI may use store analytics supplied through TTFL Store to explain traffic, products, orders, revenue, conversion signals, reviews and other operational metrics. Analytics are scoped to the vendor's store. Vendors must not attempt to access another vendor's analytics or use analytics information to harm another user.",
        },
        {
          title: "10. Rewards, promotions and marketplace tools",
          body: "Rewards points, promotions, subscriptions, featured placements, coupons and other tools are subject to their displayed rules. TTFL Store may change, pause or discontinue a feature where reasonably necessary for security, technical operation, marketplace integrity or product updates. Existing paid transactions remain subject to the terms shown for the relevant transaction.",
        },
        {
          title: "11. Prohibited conduct",
          body: "You must not use TTFL Store for scams, money laundering, fraudulent payment activity, counterfeit or stolen goods, unlawful goods or services, malicious code, harassment, review manipulation, account abuse, unauthorised data collection, attempts to bypass security, or transactions intended to evade TTFL Store's marketplace safeguards.",
        },
        {
          title: "12. Privacy and personal information",
          body: "TTFL Store processes personal information as described in its Privacy Policy and applicable data-protection requirements. Personal information should only be collected, shared or used through TTFL Store features for legitimate marketplace purposes. Do not post another person's private information in reviews, reports, listings or messages.",
        },
        {
          title: "13. Complaints and disputes",
          body: "Customers and vendors should first use TTFL Store support and the available order, report or dispute processes. Provide accurate records such as order numbers, receipts, messages and relevant evidence when requested. TTFL Store may ask both sides for information before resolving a marketplace complaint.",
        },
        {
          title: "14. Changes to these Terms",
          body: "TTFL Store may update these Terms as the marketplace develops or when legal, security or operational requirements change. When a material update requires renewed acceptance, the platform may ask you to review and accept the new version before continuing to use affected account features.",
        },
        {
          title: "15. Acceptance",
          body: "By selecting “Agree and continue” after reviewing the current Terms, you confirm that you have had an opportunity to read them and agree to follow the marketplace rules applicable to your use of TTFL Store. Your acceptance records the current Terms version and the time of acceptance.",
        },
      ]}
    />
  );
}
