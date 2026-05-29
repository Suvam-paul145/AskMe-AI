const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "fetched_share_browser.html");

try {
  const content = fs.readFileSync(filePath, "utf-8");
  console.log("File loaded. Size:", content.length, "bytes");

  // Let's search for "window.WIZ_global_data"
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let wizData = "";
  while ((match = scriptRegex.exec(content)) !== null) {
    const scriptText = match[1].trim();
    if (scriptText.includes("WIZ_global_data")) {
      wizData = scriptText;
      break;
    }
  }

  if (wizData) {
    console.log("Found WIZ global data script. Size:", wizData.length);
    
    // Let's write the strings inside WIZ data to a text file
    const stringRegex = /"([^"]{15,})"/g;
    const strings = [];
    let strMatch;
    while ((strMatch = stringRegex.exec(wizData)) !== null) {
      // Let's decode unicode escapes like \u003c, \u003e, etc.
      let str = strMatch[1];
      try {
        str = JSON.parse(`"${str}"`);
      } catch {}
      strings.push(str);
    }
    
    console.log("Extracted", strings.length, "strings");
    
    // Filter strings containing security or plan related words
    const filtered = strings.filter(s => 
      s.toLowerCase().includes("security") ||
      s.toLowerCase().includes("rate") ||
      s.toLowerCase().includes("attack") ||
      s.toLowerCase().includes("ddos") ||
      s.toLowerCase().includes("sql") ||
      s.toLowerCase().includes("dos")
    );
    
    console.log("Filtered strings containing keywords:", filtered.length);
    fs.writeFileSync(path.join(__dirname, "filtered_strings.txt"), filtered.join("\n\n---\n\n"), "utf-8");
  } else {
    console.log("No WIZ global data found.");
  }
} catch (e) {
  console.error("Error:", e);
}
