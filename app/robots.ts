import type { MetadataRoute } from "next";

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
      ],
    },
    sitemap: "https://store.thetronforge.com/sitemap.xml",
  };
}
