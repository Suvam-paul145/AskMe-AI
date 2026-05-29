const fs = require("fs");
const path = require("path");

const url = "https://gemini.google.com/share/85c69c50246b";
const outPath = path.join(__dirname, "fetched_share_browser.html");

async function run() {
  console.log("Fetching Gemini share page using simulated browser headers...");
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0"
      }
    });

    console.log("Response status:", response.status, response.statusText);
    const html = await response.text();
    fs.writeFileSync(outPath, html, "utf-8");
    console.log("Saved response. Size:", html.length, "bytes");

    // Check if the HTML contains the word "attacks" or "DDoS" or "SQL"
    const hasAttacks = html.toLowerCase().includes("attacks");
    const hasDdos = html.toLowerCase().includes("ddos");
    const hasSql = html.toLowerCase().includes("sql");
    console.log("Content check - has attacks:", hasAttacks, "| has ddos:", hasDdos, "| has sql:", hasSql);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

run();
