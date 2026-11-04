import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = {
  title: "About The Tron Forge Limited",
  description: "Learn about The Tron Forge Limited and the TTFL Store multi-vendor marketplace.",
  openGraph: {
    title: "About The Tron Forge Limited | TTFL Store",
    description: "Learn who operates TTFL Store and how the marketplace works.",
    images: ["/ttflstore.png"],
  },
};

export default function AboutPage() {
  return (
    <SeoContentPage
      eyebrow="The Tron Forge Limited"
      title="A marketplace built to connect buyers and sellers"
      description="TTFL Store is a multi-vendor commerce platform operated by The Tron Forge Limited. It helps customers discover products from independent vendors and gives approved sellers tools to present their stores, manage listings and handle orders."
      sections={[
        {
          title: "Who operates TTFL Store",
          body: "TTFL Store is operated by The Tron Forge Limited. The company is responsible for the marketplace platform, its website experience, account and vendor tools, platform policies and customer support channels. TTFL Store is not presented as a government service or as an official representative of any product manufacturer or independent vendor.",
        },
        {
          title: "How the marketplace works",
          body: "Independent vendors create storefronts and submit product listings. Customers can browse categories, compare available listing information, review seller details and use the purchase or contact method shown on a listing. Depending on the listing, an order may be processed through TTFL Store checkout, an external vendor destination or WhatsApp. The available method is shown on the relevant product page.",
        },
        {
          title: "Vendor responsibility",
          body: "Vendors are responsible for the accuracy and legality of their listings, product condition and authenticity, current prices and stock, fulfilment, and customer obligations associated with their products. TTFL Store provides marketplace tools and safeguards but does not claim that every vendor or product has been independently inspected.",
        },
        {
          title: "Shopping information",
          body: "Product pages may display descriptions, images, specifications, variations, seller information, ratings, delivery estimates and availability. Customers should review the listing and confirm any important details with the seller before purchasing, especially for high-value, used or made-to-order items.",
        },
        {
          title: "Payments and support",
          body: "Where TTFL Store checkout is available, payment status is confirmed through the payment provider integration before an order is treated as paid. Customers can use the help centre to find order guidance or contact support about account, payment, delivery, listing and marketplace concerns.",
        },
        {
          title: "Our marketplace standards",
          body: "TTFL Store prohibits counterfeit and stolen goods, deceptive listings, fraudulent payment requests, review manipulation, unlawful products and abuse of the platform. Customers and vendors can report suspicious activity through the support process. Reports are reviewed and do not, by themselves, establish that an allegation is true.",
        },
        {
          title: "Independent vendors and brands",
          body: "Vendor names, product brands, trademarks and logos belong to their respective owners. A listing or seller profile does not imply endorsement by a manufacturer or brand owner. Verification indicators describe the marketplace's own checks and are not a guarantee of product quality or future performance.",
        },
        {
          title: "Part of The Tron Forge Limited",
          body: "TTFL Store is one of the digital products operated by The Tron Forge Limited. For help with the marketplace, use the public Help Centre or Contact Us page. For information about how account, order and advertising information is handled, read the Privacy Policy.",
        },
      ]}
      actions={[
        { href: "/shop", label: "Explore the marketplace" },
        { href: "/trust", label: "Trust and safety" },
        { href: "/contact", label: "Contact us" },
      ]}
    />
  );
}
