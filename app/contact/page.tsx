import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = {
  title: "Contact TTFL Store",
  description: "Contact The Tron Forge Limited about TTFL Store orders, accounts, vendor listings and marketplace support.",
  openGraph: {
    title: "Contact TTFL Store | The Tron Forge Limited",
    description: "Find the official support channels for TTFL Store.",
    images: ["/ttflstore.png"],
  },
};

export default function ContactPage() {
  return (
    <SeoContentPage
      eyebrow="The Tron Forge Limited · Customer support"
      title="Contact TTFL Store"
      description="TTFL Store is operated by The Tron Forge Limited. Use the official Help Centre to find guidance or open a support conversation about an order, account, vendor listing, payment or other marketplace issue."
      sections={[
        {
          title: "Customer and order support",
          body: "For an order, delivery, payment, return or refund issue, sign in and submit a Report a Problem request. Select TTFL Store Products and include your order number so the support team can locate the relevant transaction. You can follow replies from My Reports.",
        },
        {
          title: "Account and website support",
          body: "For sign-in problems, account access, website errors or other technical issues, use the Report a Problem form and select Account / website. Include the page address, the steps that caused the problem and any TTFL error reference shown on screen. Never include passwords or authentication codes.",
        },
        {
          title: "Vendor support",
          body: "Vendors can use the Help Centre and the support process for store applications, product listings, orders, payouts, subscriptions and dashboard issues. Include your store name and the relevant product or order reference.",
        },
        {
          title: "Company and marketplace information",
          body: "TTFL Store is a multi-vendor marketplace operated by The Tron Forge Limited. For details about the marketplace, read About TTFL Store. For information about data handling and privacy requests, read the Privacy Policy.",
        },
        {
          title: "Official support channels",
          body: "To protect order and account information, TTFL Store uses its authenticated support conversation system for case-specific enquiries. The public Help Centre is available for general guidance. Support requests should be submitted through the official ttflstore.name.ng website.",
        },
      ]}
      actions={[
        { href: "/support", label: "Open Help Centre" },
        { href: "/support/report", label: "Report a problem" },
        { href: "/support/reports", label: "My reports" },
        { href: "/about", label: "About The Tron Forge Limited" },
      ]}
    />
  );
}
