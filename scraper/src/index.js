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

function detailCacheFileFor(bookUrl) {
  const url = new URL(bookUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  // Example:
  // /catalogue/a-light-in-the-attic_1000/index.html
  // -> a-light-in-the-attic_1000
  const bookName = parts[parts.length - 2];

  return `scraper/cache/books-${bookName}.html`;
}

async function fetchPage(pageUrl, cacheFile) {
  try {
    const cachedHtml = await fs.readFile(cacheFile, "utf8");

    console.log(`CACHE HIT ${cacheFile}`);
    console.log(
      `Size: ${Buffer.byteLength(cachedHtml, "utf8")} bytes`
    );

    return {
      html: cachedHtml,
      fetchedAt: null,
      fromCache: true
    };
  } catch {
    // Cache doesn't exist, so fetch from the site.
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

  const fetchedAt = new Date().toISOString();
  const html = await response.text();
  const size = Buffer.byteLength(html, "utf8");

  await fs.mkdir("scraper/cache", { recursive: true });
  await fs.writeFile(cacheFile, html);

  console.log(`Size: ${size} bytes`);
  console.log(`Saved to ${cacheFile}`);

  return {
    html,
    fetchedAt,
    fromCache: false
  };
}

function extractBookUrls(html, pageUrl) {
  const $ = cheerio.load(html);
  const books = [];

  $("article.product_pod h3 a").each((_, element) => {
    const href = $(element).attr("href");

    if (href) {
      books.push(new URL(href, pageUrl).href);
    }
  });

  return books;
}

function getNextPageUrl(html, pageUrl) {
  const $ = cheerio.load(html);
  const nextHref = $("li.next a").attr("href");

  if (!nextHref) {
    return null;
  }

  return new URL(nextHref, pageUrl).href;
}

function extractRawRecord(html, productUrl, sourcePage, fetchedAt) {
  const $ = cheerio.load(html);

  const productArea = $("article.product_page");

  const title = productArea.find("div.product_main h1").text().trim() || null;

  const priceText =
    productArea.find("div.product_main .price_color").text().trim() || null;

  const availabilityText =
    productArea.find("div.product_main .availability").text().trim() || null;

  const ratingText =
    productArea
      .find("div.product_main .star-rating")
      .attr("class")
      ?.replace("star-rating", "")
      .trim() || null;

  const descriptionElement = productArea.find("#product_description + p");

  const description = descriptionElement.length
    ? descriptionElement.text().trim()
    : null;

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description: description || null,
    source_page: sourcePage,
    fetched_at: fetchedAt
  };
}

async function main() {
  let currentUrl = START_URL;
  let cataloguePages = 0;
  const discoveredBooks = [];

  while (cataloguePages < 3 && currentUrl) {
    if (cataloguePages > 0) {
      await sleep(500);
    }

    const cacheFile = cacheFileFor(currentUrl);
    const result = await fetchPage(currentUrl, cacheFile);

    cataloguePages++;

    const bookUrls = extractBookUrls(result.html, currentUrl);

    bookUrls.forEach((productUrl) => {
      discoveredBooks.push({
        productUrl,
        sourcePage: currentUrl
      });
    });

    currentUrl = getNextPageUrl(result.html, currentUrl);
  }

  const uniqueBooks = [
    ...new Map(
      discoveredBooks.map((book) => [book.productUrl, book])
    ).values()
  ];

  const rawRecords = [];

  for (let i = 0; i < uniqueBooks.length; i++) {
    const { productUrl, sourcePage } = uniqueBooks[i];

    if (i > 0) {
      await sleep(500);
    }

    const cacheFile = detailCacheFileFor(productUrl);

    const result = await fetchPage(productUrl, cacheFile);

    const fetchedAt =
      result.fetchedAt || new Date().toISOString();

    const record = extractRawRecord(
      result.html,
      productUrl,
      sourcePage,
      fetchedAt
    );

    rawRecords.push(record);
  }

  console.log(`catalogue_pages=${cataloguePages}`);
  console.log(`detail_pages=${rawRecords.length}`);

  console.log("Sample raw record:");
  console.log(JSON.stringify(rawRecords[0], null, 2));
}

main().catch((error) => {
  console.error(`Scraper failed: ${error.message}`);
  process.exitCode = 1;
});