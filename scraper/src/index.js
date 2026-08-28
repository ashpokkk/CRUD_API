const fs = require("fs/promises");
const cheerio = require("cheerio");

const START_URL = "https://books.toscrape.com/";
const USER_AGENT =
  "FlyRankInternship-A9/1.0 (+https://github.com/ashpokkk/CRUD_API)";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheFileFor(pageUrl) {
  const url = new URL(pageUrl);

  if (url.pathname === "/") {
    return "scraper/cache/catalogue-page-1.html";
  }

  const pageName = url.pathname.split("/").pop();
  return `scraper/cache/${pageName}`;
}

async function fetchPage(pageUrl) {
  const cacheFile = cacheFileFor(pageUrl);

  // Check cache first
  try {
    const cachedHtml = await fs.readFile(cacheFile, "utf8");

    console.log(`CACHE HIT ${cacheFile}`);
    console.log(
      `Size: ${Buffer.byteLength(cachedHtml, "utf8")} bytes`
    );

    return cachedHtml;
  } catch {
    // Cache doesn't exist, so fetch from the site
  }

  console.log(`FETCH ${pageUrl}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  let response;

  try {
    response = await fetch(pageUrl, {
      headers: {
        "User-Agent": USER_AGENT
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  console.log(`Status: ${response.status}`);

  if (response.status !== 200) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  const size = Buffer.byteLength(html, "utf8");

  await fs.mkdir("scraper/cache", { recursive: true });
  await fs.writeFile(cacheFile, html);

  console.log(`Size: ${size} bytes`);
  console.log(`Saved to ${cacheFile}`);

  return html;
}

function extractBookUrls(html, pageUrl) {
  const $ = cheerio.load(html);
  const urls = [];

  $("article.product_pod h3 a").each((_, element) => {
    const href = $(element).attr("href");

    if (href) {
      const absoluteUrl = new URL(href, pageUrl).href;
      urls.push(absoluteUrl);
    }
  });

  return urls;
}

function getNextPageUrl(html, pageUrl) {
  const $ = cheerio.load(html);
  const nextHref = $("li.next a").attr("href");

  if (!nextHref) {
    return null;
  }

  return new URL(nextHref, pageUrl).href;
}

async function main() {
  let currentUrl = START_URL;
  let cataloguePages = 0;
  const discoveredUrls = [];

  while (cataloguePages < 3 && currentUrl) {
    if (cataloguePages > 0) {
      await sleep(500);
    }

    const html = await fetchPage(currentUrl);

    cataloguePages++;

    const bookUrls = extractBookUrls(html, currentUrl);
    discoveredUrls.push(...bookUrls);

    currentUrl = getNextPageUrl(html, currentUrl);
  }

  const uniqueUrls = [...new Set(discoveredUrls)];

  console.log(`catalogue_pages=${cataloguePages}`);
  console.log(`discovered=${discoveredUrls.length}`);
  console.log(`unique_urls=${uniqueUrls.length}`);
}

main().catch((error) => {
  console.error(`Scraper failed: ${error.message}`);
  process.exitCode = 1;
});