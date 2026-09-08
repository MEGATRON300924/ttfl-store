import type { MetadataRoute } from "next";

const SITE_URL = "https://ttflstore.name.ng";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/vendor/dashboard",
        "/account",
        "/checkout",
        "/orders/",
        "/login",
        "/reset-password",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
