import { headers } from "next/headers";

/**
 * TTFL Store currently targets Nigeria for AdSense delivery.
 * Ads remain disabled for requests outside Nigeria until the appropriate
 * Google-certified consent configuration is enabled for those regions.
 */
export function canServeAdSenseForRequest(): boolean {
  const requestHeaders = headers();
  const host = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const country = (
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    ""
  ).trim().toUpperCase();

  return country === "NG" && host !== "europe.ttflstore.name.ng";
}
