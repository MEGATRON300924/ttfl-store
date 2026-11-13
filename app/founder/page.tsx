import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Code2, Globe2, Store, Building2 } from "lucide-react";

const SITE_URL = "https://ttflstore.name.ng";
const PORTRAIT_URL = "https://zionopaaje.name.ng/zionopaaje.png";

export const metadata: Metadata = {
  title: "Founder — Zion Opaaje",
  description:
    "Meet Zion Opaaje (MegaTron), founder of The Tron Forge Limited and the builder behind TTFL Store and The MAX AI Ecosystem.",
  alternates: { canonical: `${SITE_URL}/founder` },
  openGraph: {
    type: "profile",
    url: `${SITE_URL}/founder`,
    title: "Zion Opaaje — Founder of The Tron Forge Limited",
    description:
      "The person and story behind TTFL Store, The Tron Forge Limited, and The MAX AI Ecosystem.",
    images: [{ url: PORTRAIT_URL, alt: "Zion Opaaje" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zion Opaaje — Founder of The Tron Forge Limited",
    description:
      "The person and story behind TTFL Store, The Tron Forge Limited, and The MAX AI Ecosystem.",
    images: [PORTRAIT_URL],
  },
  robots: { index: true, follow: true },
};

const milestones = [
  {
    date: "1 September 2024",
    label: "The Tron Forge Limited",
    detail: "Founded as the company behind a growing portfolio of technology products and digital services.",
    icon: Building2,
  },
  {
    date: "1 September 2025",
    label: "TTFL Store",
    detail: "Launched as The Tron Forge Limited's multi-vendor online marketplace.",
    icon: Store,
  },
  {
    date: "December 2025",
    label: "The MAX AI Ecosystem",
    detail: "Production began on the connected AI ecosystem being developed under The Tron Forge Limited.",
    icon: Code2,
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://zionopaaje.name.ng/#person",
      name: "Zion Opaaje",
      alternateName: "MegaTron",
      image: PORTRAIT_URL,
      url: "https://zionopaaje.name.ng/",
      jobTitle: "Founder and Technology Builder",
      worksFor: {
        "@type": "Organization",
        "@id": "https://thetronforge.name.ng/#organization",
        name: "The Tron Forge Limited",
        url: "https://thetronforge.name.ng/",
        foundingDate: "2024-09-01",
      },
      sameAs: [
        "https://www.linkedin.com/in/zion-opaaje-302561356/",
        "https://github.com/MEGATRON300924",
      ],
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/founder#webpage`,
      url: `${SITE_URL}/founder`,
      name: "Founder — Zion Opaaje",
      mainEntity: { "@id": "https://zionopaaje.name.ng/#person" },
      isPartOf: { "@type": "WebSite", url: SITE_URL, name: "TTFL Store" },
    },
  ],
};

export default function FounderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="shell py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-graphite-500 dark:text-graphite-400">
          <Link href="/" className="hover:text-ember-600">Home</Link>
          <span className="mx-2">/</span>
          <span aria-current="page">Founder</span>
        </nav>

        <section className="overflow-hidden rounded-3xl border border-graphite-200 bg-white dark:border-graphite-700 dark:bg-graphite-950">
          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[260px_1fr] lg:gap-12 lg:p-14">
            <div className="mx-auto w-full max-w-[220px]">
              <div className="aspect-square overflow-hidden rounded-3xl border border-graphite-200 bg-cloud-100 shadow-card dark:border-graphite-700 dark:bg-graphite-900">
                <img
                  src={PORTRAIT_URL}
                  alt="Portrait of Zion Opaaje, founder of The Tron Forge Limited"
                  className="h-full w-full object-cover"
                  width={600}
                  height={600}
                  fetchPriority="high"
                />
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ember-600">The person behind the venture</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-graphite-950 dark:text-white sm:text-5xl">Zion Opaaje</h1>
              <p className="mt-2 text-base font-semibold text-graphite-600 dark:text-graphite-300">MegaTron · Founder of The Tron Forge Limited</p>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-graphite-600 dark:text-graphite-300 sm:text-base">
                Zion Opaaje is a Nigerian technology entrepreneur and software builder. He founded The Tron Forge Limited to develop practical digital products and services, with a focus on building useful technology for people and businesses.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-graphite-600 dark:text-graphite-300 sm:text-base">
                His work through TTFL includes TTFL Store, the company&apos;s multi-vendor marketplace, and The MAX AI Ecosystem, a connected AI initiative whose production began in December 2025. He is also known online as MegaTron and uses the GitHub identity MEGATRON300924.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="https://zionopaaje.name.ng" className="inline-flex items-center gap-2 rounded-full bg-ember-600 px-5 py-3 text-sm font-bold text-white hover:bg-ember-700">
                  Official website <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/in/zion-opaaje-302561356/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-graphite-200 px-5 py-3 text-sm font-semibold text-graphite-800 hover:border-ember-500 dark:border-graphite-700 dark:text-graphite-100">
                  LinkedIn <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href="https://github.com/MEGATRON300924" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-graphite-200 px-5 py-3 text-sm font-semibold text-graphite-800 hover:border-ember-500 dark:border-graphite-700 dark:text-graphite-100">
                  GitHub <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">The timeline</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-graphite-950 dark:text-white sm:text-3xl">Building across connected ventures</h2>
            <p className="mt-3 text-sm leading-6 text-graphite-600 dark:text-graphite-400">Three milestones mark the development of the company and its products.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {milestones.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="rounded-2xl border border-graphite-200 bg-white p-6 dark:border-graphite-700 dark:bg-graphite-950">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-ember-50 text-ember-700 dark:bg-ember-900/30 dark:text-ember-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="flex items-center gap-2 text-xs font-bold text-ember-700 dark:text-ember-300"><CalendarDays className="h-4 w-4" />{item.date}</p>
                  <h3 className="mt-3 text-lg font-bold text-graphite-950 dark:text-white">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-400">{item.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 border-t border-graphite-200 py-10 dark:border-graphite-800 sm:grid-cols-3">
          <Link href="/about" className="group rounded-2xl border border-graphite-200 p-5 hover:border-ember-500 dark:border-graphite-700">
            <Globe2 className="mb-3 h-5 w-5 text-ember-600" />
            <h3 className="font-bold text-graphite-950 dark:text-white">The Tron Forge Limited</h3>
            <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">Learn about the company behind the ventures.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-ember-600">About TTFL <ArrowUpRight className="h-4 w-4" /></span>
          </Link>
          <a href="https://max-ai.name.ng/founder" className="rounded-2xl border border-graphite-200 p-5 hover:border-ember-500 dark:border-graphite-700">
            <Code2 className="mb-3 h-5 w-5 text-ember-600" />
            <h3 className="font-bold text-graphite-950 dark:text-white">The MAX AI Ecosystem</h3>
            <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">Explore the AI ecosystem and its development.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-ember-600">Visit MAX AI <ArrowUpRight className="h-4 w-4" /></span>
          </a>
          <a href="https://zionopaaje.name.ng" className="rounded-2xl border border-graphite-200 p-5 hover:border-ember-500 dark:border-graphite-700">
            <Globe2 className="mb-3 h-5 w-5 text-ember-600" />
            <h3 className="font-bold text-graphite-950 dark:text-white">Zion Opaaje</h3>
            <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">Visit the official personal website for the full profile.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-ember-600">View profile <ArrowUpRight className="h-4 w-4" /></span>
          </a>
        </section>
      </div>
    </>
  );
}
