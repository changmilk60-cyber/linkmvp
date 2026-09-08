// Landing / whitepage links are pasted by hand, and a link without a scheme
// ("example.com/x") is not an external link at all as far as the router is
// concerned — it redirects to that path on our own domain, which is how a
// page ended up at /linkmvp-web-production.up.railway.app/smoketest. Assume
// https when the scheme is missing, and reject anything that still is not a
// usable http(s) address.
export function normalizeExternalUrl(raw: string | null | undefined): string | null {
  const value = (raw || "").trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // A bare word ("asdf") parses fine once https:// is bolted on, so require
    // something that at least looks like a domain.
    if (!url.hostname.includes(".") || url.hostname.startsWith(".") || url.hostname.endsWith(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
