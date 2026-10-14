import { api } from "@/lib/api-client";

function decodeBase64Url(value: string) {
  const padded = value + "=".repeat((4 - value.length % 4) % 4);
  const binary = window.atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function enableWebPush(): Promise<string> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) throw new Error("This browser does not support web push notifications.");
  if (Notification.permission !== "granted") throw new Error("Allow notifications in your browser settings first.");
  const keyResult = await api.get<{ publicKey: string | null; configured: boolean }>("/api/notifications/web-push/public-key");
  if (!keyResult.configured || !keyResult.publicKey) throw new Error("Web push is not configured on the TTFL Store server yet. Please try again later.");
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeBase64Url(keyResult.publicKey) });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error("The browser returned an incomplete push subscription. Please try again.");
  await api.post("/api/notifications/web-push/subscriptions", { endpoint: json.endpoint, expirationTime: json.expirationTime ?? null, keys: json.keys });
  return "Web push is enabled on this device. Notifications can arrive even when TTFL Store is not open, as long as your browser or device allows them.";
}
