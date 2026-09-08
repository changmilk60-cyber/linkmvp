// Crawlers and link-preview fetchers that should see the landing page rather
// than the sales page. Matching is deliberately broad: sending a real visitor
// to the landing page by mistake is a far smaller problem than showing the
// sales page to a reviewer, so anything that looks automated counts.
const BOT_PATTERNS = [
  // Meta / Facebook
  "facebookexternalhit", "facebookcatalog", "facebot", "meta-externalagent",
  // search engines
  "googlebot", "adsbot-google", "google-inspectiontool", "mediapartners-google",
  "bingbot", "adidxbot", "yandexbot", "baiduspider", "duckduckbot", "slurp", "applebot",
  // chat apps / link previews
  "twitterbot", "linkedinbot", "whatsapp", "telegrambot", "discordbot", "slackbot",
  "skypeuripreview", "line-poker", "pinterest", "redditbot", "embedly", "quora link preview",
  // generic automation
  "bot", "crawler", "crawling", "spider", "scraper", "preview", "validator",
  "headlesschrome", "phantomjs", "puppeteer", "playwright", "python-requests",
  "curl/", "wget", "axios", "go-http-client", "java/", "okhttp", "libwww-perl",
];

// Clients whose whole User-Agent is one bare word. Matched exactly rather than
// as a substring, which a word this short would otherwise trip on.
const BOT_EXACT = new Set(["node", "undici", "curl", "wget", "axios", "python", "java"]);

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = (userAgent || "").trim().toLowerCase();
  // No User-Agent at all is a script, never a browser.
  if (!ua) return true;
  if (BOT_EXACT.has(ua)) return true;
  return BOT_PATTERNS.some((p) => ua.includes(p));
}
