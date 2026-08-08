---
name: batch-scraper
description: Efficient multi-page web scraping pattern using dynamic subagent definition, batch URL partitioning, concurrent execution, and reactive merging.
---

# Batch Scraper Skill

Use this workflow whenever you need to scrape or extract structured data from a large number of web pages (e.g. 30–200+ product catalog items, articles, or records).

## Workflow Steps

### 1. Catalog Mapping & URL Extraction
- Use `firecrawl_scrape` or `firecrawl_map` with JavaScript rendering (`waitFor: 5000`) on the root catalog page.
- Extract all target item URLs and save the full list into `scratch/product_urls.json`.

### 2. Define Extraction Subagent Schema
- Use `define_subagent` to register a dedicated scraper agent (e.g., `batch_scraper_agent`).
- Specify:
  - Required tools (`firecrawl_scrape`, `write_to_file`).
  - Strict extraction schema (e.g., `name`, `url`, `category`, `approvals_and_performance`, `characteristics`).
  - Output contract: write extracted items as a JSON array to an assigned file path like `scratch/batchX.json`.
  - Edge-case handling: keep original specification strings unchanged (do not parse or truncate OEM approvals).

### 3. Partition & Launch Parallel Subagents
- Split the target URL list into balanced chunks of **15–22 URLs** per agent.
- In a **single** `invoke_subagent` call, launch concurrent subagents for all batches using fast/light models (`flash` tier):
  - Batch 1 -> `scratch/batch1.json`
  - Batch 2 -> `scratch/batch2.json`
  - ...
  - Batch N -> `scratch/batchN.json`

### 4. Non-Blocking Event-Driven Synchronization
- Avoid polling loops (`while true` or frequent status checking).
- Set a schedule timer (`schedule`) with `TimerCondition: any` or wait reactively for subagent completion notifications.

### 5. Deduplicate and Merge
- Run a Node.js merge script to combine all `scratch/batch*.json` files.
- Deduplicate entries by unique `url`.
- Write the consolidated JSON file to the project destination (e.g. `mol_transport_scraped.json`).
