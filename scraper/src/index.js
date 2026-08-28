const fs = require("fs/promises");
const cheerio = require("cheerio");
const { bookSchema } = require("./schema");

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

function normalizePrice(priceText) {
  if (!priceText) {
    return null;
  }

  const match = priceText.match(/£\s*([\d.]+)/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function normalizeRecord(record) {
  return {
    ...record,
    price_gbp: normalizePrice(record.price_text)
  };
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
    const error = new Error(
      `Fetch failed with status ${response.status}`
    );

    error.status = response.status;

    throw error;
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

async function fetchBookPage(productUrl, cacheFile) {
  try {
    return await fetchPage(productUrl, cacheFile);
  } catch (error) {
    const status = error.status;

    // Never retry 404 or 403
    if (status === 404 || status === 403) {
      throw error;
    }

    // Retry once for timeout or 5xx
    if (error.name === "AbortError" || (status >= 500 && status <= 599)) {
      console.log(`RETRY ${productUrl}`);

      await sleep(1000);

      return await fetchPage(productUrl, cacheFile);
    }

    throw error;
  }
}

async function main() {
  const runStartedAt = new Date();
  const runStartTime = Date.now();

  let pagesFetched = 0;
  let cacheHits = 0;
  let failedPages = 0;

  let currentUrl = START_URL;
  let cataloguePages = 0;
  const discoveredBooks = [];

  while (cataloguePages < 3 && currentUrl) {
    if (cataloguePages > 0) {
      await sleep(500);
    }

    const cacheFile = cacheFileFor(currentUrl);
    const result = await fetchPage(currentUrl, cacheFile);

    if (result.fromCache) {
      cacheHits++;
    } else {
      pagesFetched++;
    }

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

  uniqueBooks.push({
    productUrl: "https://books.toscrape.com/catalogue/fake-book-for-testing/index.html",
    sourcePage: START_URL
  });

  const rawRecords = [];

  for (let i = 0; i < uniqueBooks.length; i++) {
    const { productUrl, sourcePage } = uniqueBooks[i];

    if (i > 0) {
      await sleep(500);
    }

    const cacheFile = detailCacheFileFor(productUrl);

    try {
      const result = await fetchBookPage(productUrl, cacheFile);

      if (result.fromCache) {
        cacheHits++;
      } else {
        pagesFetched++;
      }

      const fetchedAt =
        result.fetchedAt || new Date().toISOString();

      const record = extractRawRecord(
        result.html,
        productUrl,
        sourcePage,
        fetchedAt
      );

      rawRecords.push(record);
    } catch (error) {
      failedPages++;

      console.error(
        `FAILED ${productUrl}: ${error.message}`
      );
    }
  }

  const validRecords = [];
  const errors = [];

  for (const rawRecord of rawRecords) {
    const normalizedRecord = normalizeRecord(rawRecord);

    const result = bookSchema.safeParse(normalizedRecord);

    if (result.success) {
      validRecords.push(result.data);
    } else {
      errors.push({
        product_url: rawRecord.product_url,
        reason: result.error.issues
          .map((issue) => issue.message)
          .join("; ")
      });
    }
  }

  const uniqueRecords = [
    ...new Map(
      validRecords.map((record) => [record.product_url, record])
    ).values()
  ];

  await fs.mkdir("scraper/output", { recursive: true });

  await fs.writeFile(
    "scraper/output/books.json",
    JSON.stringify(uniqueRecords, null, 2)
  );

  await fs.writeFile(
    "scraper/output/errors.json",
    JSON.stringify(errors, null, 2)
  );

  const durationMs = Date.now() - runStartTime;

  const runReport = {
    start_time: runStartedAt.toISOString(),
    duration_ms: durationMs,
    pages_fetched: pagesFetched,
    cache_hits: cacheHits,
    valid_records: uniqueRecords.length,
    invalid_records: errors.length,
    failed_pages: failedPages
  };

  await fs.writeFile(
    "scraper/output/run-report.json",
    JSON.stringify(runReport, null, 2)
  );

  console.log("Run report:");
  console.log(JSON.stringify(runReport, null, 2));

  console.log(`catalogue_pages=${cataloguePages}`);
  console.log(`detail_pages=${rawRecords.length}`);
  console.log(`valid_records=${uniqueRecords.length}`);
  console.log(`errors=${errors.length}`);

  console.log("Sample normalized record:");
  console.log(JSON.stringify(uniqueRecords[0], null, 2));
}

main().catch((error) => {
  console.error(`Scraper failed: ${error.message}`);
  process.exitCode = 1;
});