export function isVideoUrl(url: string) {
  const value = url.toLowerCase();
  return value.includes("/video/upload/") || /\.(mp4|webm|mov|m4v|ogv)(?:[?#].*)?$/.test(value);
}

export function optimizeVideoUrl(url: string) {
  if (!isVideoUrl(url)) return url;
  if (url.includes("/q_auto/") || url.includes("/f_auto:video/")) return url;
  return url.replace("/video/upload/", "/video/upload/q_auto/f_auto:video/");
}
