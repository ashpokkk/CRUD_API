# Polite Scraper

A small web-scraping pipeline built for the FlyRank Backend Internship — Week 5, Assignment A9.

## Target classification

**Target:** Books to Scrape — https://books.toscrape.com/

**Why this site:** Books to Scrape is a public sandbox specifically intended for practising web scraping.

**Scope:** This project collects data from the **first 3 catalogue pages only**, covering 60 books.

**Data collected:** Book title, product URL, price, availability, rating, description, source page, and fetch timestamp.

**Robots.txt:** I requested `https://books.toscrape.com/robots.txt` once and received an **HTTP 404 (Not Found)** response. No robots.txt file was found. A missing robots.txt file is not treated as permission to scrape.

**Why this is appropriate:** This target is appropriate because it is explicitly provided as a scraping practice sandbox rather than a normal production website.

I will not reuse this code on another site without checking its rules and terms first.

## Technology

* **Language:** JavaScript
* **Runtime:** Node.js 20+
* **HTTP:** Built-in `fetch`
* **HTML parser:** Cheerio
* **Schema validation:** Zod
* **Output:** JSON files

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/ashpokkk/CRUD_API.git
cd CRUD_API
npm install
```

## Run

From the repository root:

```bash
node scraper/src/index.js
```

The scraper will produce:

```text
scraper/output/books.json
scraper/output/errors.json
scraper/output/run-report.json
```

The scraper uses cached HTML during development, so repeated runs do not repeatedly request the website.

## Pipeline

The scraper follows this pipeline:

**Classify → Fetch → Cache → Discover → Extract → Normalize → Validate → Store → Report**

It:

1. Fetches the first three catalogue pages.
2. Follows the catalogue's own next links.
3. Discovers all 60 book URLs.
4. Converts relative URLs into absolute URLs.
5. Fetches and caches each book page.
6. Extracts raw book information from the product area.
7. Normalizes the price into a numeric `price_gbp` value.
8. Validates every record against the schema.
9. Stores valid records in `books.json`.
10. Stores invalid records and their errors in `errors.json`.
11. Writes a run summary to `run-report.json`.

## Record schema

Each valid record has this shape:

```json
{
  "title": "A Light in the Attic",
  "product_url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
  "price_text": "£51.77",
  "price_gbp": 51.77,
  "availability_text": "In stock (22 available)",
  "rating_text": "Three",
  "description": "...",
  "source_page": "https://books.toscrape.com/",
  "fetched_at": "2026-08-28T13:06:29.467Z"
}
```

The raw `price_text` is retained alongside the normalized numeric `price_gbp`.

The `product_url` is the canonical URL and is used to prevent duplicate records.

`description` may be `null` when the source page does not contain a description.

## Validation and error handling

Every normalized record is validated before it is stored.

Invalid records are written to:

```text
scraper/output/errors.json
```

They are not added to `books.json`.

Each book page is handled independently so that one failed page does not stop the entire run.

Timeouts and server errors (`5xx`) may be retried once. `404` and `403` responses are not retried.

## Politeness rules

This scraper follows several basic scraping etiquette rules:

* Uses a descriptive **User-Agent** identifying the internship project and repository.
* Uses a **5-second timeout** for HTTP requests.
* Checks the HTTP status before processing the response.
* Waits at least **0.5 seconds between real requests**.
* Uses cached HTML during development to avoid unnecessary requests.
* Does not retry `403` or `404` responses.
* Only scrapes the three catalogue pages required by the assignment.

## Idempotency

Running the scraper multiple times does not create duplicate records.

The canonical product URL is used to identify each book, and `books.json` contains exactly **60 unique records** after a successful run.

## Run report evidence

A real run produced the following report:

```json
{
  "start_time": "2026-08-28T13:06:28.264Z",
  "duration_ms": 34540,
  "pages_fetched": 0,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 1
}
```

The `failed_pages: 1` value is from the intentional fake URL used to verify that one broken page does not stop the run. The 60 valid records were still preserved.

## Why no browser was needed

This assignment did not need a browser because the required data is already present in the HTML sent by the server. A browser would only add unnecessary cost and complexity.

## Ethics note

Use an official API when one exists. Never bypass logins, paywalls, access controls, or blocks. Collect only the data that is actually needed, and respect the rules and terms of the target site.

## Limitation

This scraper is designed specifically for the Books to Scrape practice sandbox and its current HTML structure. Changes to the site's HTML structure or selectors could cause extraction or validation failures.

## Example output

After running the scraper, the main results are available in:

```text
scraper/output/books.json
scraper/output/errors.json
scraper/output/run-report.json
```

The repository does **not** publish the large collection of cached HTML pages. The cache is ignored by Git and is generated locally when required.
