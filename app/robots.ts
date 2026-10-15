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
        "/cart",
        "/orders",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/notifications",
        "/vendor/",
        "/affiliate/dashboard",
        "/partners/dashboard",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
