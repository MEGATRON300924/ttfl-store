import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Tron Forge Limited and TTFL Store collect, use, disclose and protect personal information, including information used for advertising.",
  openGraph: {
    title: "Privacy Policy | TTFL Store",
    description: "Read how TTFL Store handles account, order, payment, cookie and advertising information.",
    images: ["/ttflstore.png"],
  },
};

export default function PrivacyPage() {
  return (
    <SeoContentPage
      eyebrow="Legal · Privacy"
      title="TTFL Store Privacy Policy"
      description="This policy explains how The Tron Forge Limited handles information when you visit or use TTFL Store, including our marketplace, customer accounts, vendor tools, support services and advertising. Please read it together with our Terms and Conditions."
      sections={[
        {
          title: "1. Who is responsible for your information",
          body: "TTFL Store is operated by The Tron Forge Limited. For information processed through TTFL Store, The Tron Forge Limited is the service operator responsible for explaining the purposes of processing and handling privacy enquiries. Independent vendors may separately be responsible for information they collect directly from customers outside TTFL Store.",
        },
        {
          title: "2. Information we collect",
          body: "Depending on the features you use, information may include your name, email address, phone number, account credentials and preferences; delivery and billing details; orders, payment status and transaction references; vendor/store profile and listing information; reviews, support reports and messages; and technical information such as IP address, browser type, device information, approximate location derived from network information, log events and cookie identifiers. We request precise location only where a feature needs it and the relevant permission is provided.",
        },
        {
          title: "3. How we use information",
          body: "We use information to create and secure accounts, display marketplace listings, process and verify orders, coordinate delivery and customer support, communicate service updates, manage vendor tools, prevent fraud and abuse, maintain records, troubleshoot errors, improve the service and meet legal obligations. We use information for advertising measurement and delivery where advertising features are enabled and permitted.",
        },
        {
          title: "4. Payments and payment providers",
          body: "Payments on TTFL Store may be processed by Paystack or another payment provider presented at checkout. The payment provider processes payment credentials through its own systems. TTFL Store receives transaction information needed to confirm and manage an order; we do not ask customers to send full card numbers, PINs or one-time passwords to sellers or support agents. Payment providers' own privacy notices also apply.",
        },
        {
          title: "5. Vendors and other service providers",
          body: "When you place an order, relevant order and delivery information is shared with the vendor responsible for fulfilling it. We may also use service providers for hosting, storage, payment processing, communications, security, analytics and technical operations. They receive information only as needed to provide or support the relevant service, subject to applicable obligations. We may disclose information where required by law, to protect users and the marketplace, or in connection with a business reorganisation.",
        },
        {
          title: "6. Cookies and similar technologies",
          body: "TTFL Store and service providers may use cookies, local storage, pixels, web beacons, server logs and similar technologies. These technologies can support sign-in and session security, remember preferences and cart state, understand site usage, measure campaigns, prevent fraud and support advertising. Some cookies are necessary for core site functions; others depend on the services enabled and applicable consent requirements. You can manage cookies through your browser settings, although blocking essential cookies may affect site functionality.",
        },
        {
          title: "7. Google AdSense and third-party advertising",
          body: "If Google AdSense or another advertising service is enabled on a page, Google and its advertising partners may use cookies, web beacons, IP addresses, device identifiers or similar technologies to serve, measure, limit or personalise advertisements, detect invalid activity and understand ad performance. Third-party vendors, including Google, may place and read cookies on your browser or use web beacons and IP addresses as a result of ad serving on TTFL Store. Advertising partners process information under their own policies and settings. Google requires publishers serving ads to users in the European Economic Area, the United Kingdom and Switzerland to use a Google-certified consent management platform for applicable consent requirements. Google ads are therefore disabled on the TTFL Store Europe storefront until the required consent-management configuration is in place. For details about Google's advertising data practices, read Google's explanation of how it uses data when you use its partners' sites or apps.",
        },
        {
          title: "8. Advertising choices",
          body: "You can review or change Google's advertising personalisation settings through your Google Account or Google's Ads Settings where those controls are available. You can also manage or delete cookies through your browser. If a consent notice is presented in your region, use it to make or change the choices offered there. Disabling personalised advertising does not necessarily stop all advertising; contextual or non-personalised ads may still appear.",
        },
        {
          title: "9. International processing and transfers",
          body: "Some service providers may process information in countries other than the country where you are located. Where information is transferred internationally, The Tron Forge Limited will take steps required by applicable data-protection law to protect it and support lawful processing.",
        },
        {
          title: "10. Retention and security",
          body: "We retain information for as long as reasonably necessary for the purposes described in this policy, including account and order administration, dispute handling, security, legal and accounting requirements. Retention periods vary by information type and context. We use technical and organisational safeguards intended to protect information, but no internet transmission or storage system can be guaranteed to be completely secure.",
        },
        {
          title: "11. Your privacy rights",
          body: "Depending on applicable law, you may have rights to request access to, correction of, deletion of or restriction of certain personal information, to object to certain processing, or to withdraw consent where processing relies on consent. Requests may require identity verification and may be subject to lawful exceptions. In Nigeria, privacy rights and obligations are governed in part by the Nigeria Data Protection Act 2023 and applicable regulations.",
        },
        {
          title: "12. Children's privacy",
          body: "TTFL Store is a general marketplace and is not designed to target children with personalised advertising. Users should not submit another person's personal information unless they are authorised to do so. If you believe a child has provided personal information inappropriately, contact TTFL Store through the support channel so the matter can be reviewed.",
        },
        {
          title: "13. Changes to this policy",
          body: "We may update this policy when our services, technology, legal obligations or advertising arrangements change. The latest version will be published on this page with its updated date. Material changes may also be communicated through the website or account notices where appropriate.",
        },
        {
          title: "14. Contact and privacy requests",
          body: "For privacy questions or requests relating to TTFL Store information, use the Contact Us page or submit a support report. Please do not include passwords, payment PINs or one-time authentication codes in a privacy request. We may ask for information needed to verify your identity and locate the relevant records.",
        },
      ]}
      actions={[
        { href: "https://policies.google.com/technologies/partner-sites?hl=en", label: "How Google uses data" },
        { href: "/contact", label: "Contact TTFL Store" },
        { href: "/legal/terms", label: "Terms and Conditions" },
      ]}
    />
  );
}
