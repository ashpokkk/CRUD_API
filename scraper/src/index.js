const fs = require("fs/promises");

const PAGE_URL = "https://books.toscrape.com/";
const CACHE_FILE = "scraper/cache/catalogue-page-1.html";

async function fetchPage() {
  try {
    // Check cache first
    try {
      const cachedHtml = await fs.readFile(CACHE_FILE, "utf8");

      console.log("CACHE HIT");
      console.log(`Size: ${Buffer.byteLength(cachedHtml, "utf8")} bytes`);

      return cachedHtml;
    } catch {
      // Cache doesn't exist, so fetch from the site
    }

    console.log("FETCH");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let response;

    try {
      response = await fetch(PAGE_URL, {
        headers: {
          "User-Agent":
            "FlyRankInternship-A9/1.0 (+https://github.com/ashpokkk/CRUD_API)"
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
    await fs.writeFile(CACHE_FILE, html);

    console.log(`Size: ${size} bytes`);
    console.log(`Saved to ${CACHE_FILE}`);

    return html;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Fetch failed: request timed out");
    } else {
      console.error(`Fetch failed: ${error.message}`);
    }

    process.exitCode = 1;
  }
}

fetchPage();