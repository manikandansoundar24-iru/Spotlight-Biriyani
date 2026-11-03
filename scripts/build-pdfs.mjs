import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");
const markdownDir = path.join(docsDir, "markdown");
const pdfDir = path.join(docsDir, "pdf");

// Find Chrome or Edge executable
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

function markdownToHtml(md, title) {
  let lines = md.split("\n");
  let html = [];
  let inTable = false;
  let inList = false;

  for (let line of lines) {
    let trimmed = line.trim();

    // Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (trimmed.includes("---")) continue; // separator row
      if (!inTable) {
        html.push('<table class="data-table"><tbody>');
        inTable = true;
      }
      let cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
      let rowHtml = cells.map(c => `<td>${inlineFormat(c)}</td>`).join("");
      html.push(`<tr>${rowHtml}</tr>`);
      continue;
    } else if (inTable) {
      html.push('</tbody></table>');
      inTable = false;
    }

    // List
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineFormat(trimmed.slice(2))}</li>`);
      continue;
    } else if (inList) {
      html.push('</ul>');
      inList = false;
    }

    // Headers
    if (trimmed.startsWith("# ")) {
      html.push(`<h1>${inlineFormat(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("## ")) {
      html.push(`<h2>${inlineFormat(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      html.push(`<h3>${inlineFormat(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("> ")) {
      html.push(`<blockquote>${inlineFormat(trimmed.slice(2))}</blockquote>`);
    } else if (trimmed.startsWith("---")) {
      html.push('<hr />');
    } else if (trimmed.length > 0) {
      html.push(`<p>${inlineFormat(trimmed)}</p>`);
    }
  }

  if (inTable) html.push('</tbody></table>');
  if (inList) html.push('</ul>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { margin: 18mm 16mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 20pt;
      font-weight: 900;
      color: #ea580c;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 8px;
    }
    h3 {
      font-size: 12pt;
      font-weight: 700;
      color: #c2410c;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p { margin: 6px 0; }
    blockquote {
      border-left: 4px solid #ea580c;
      background-color: #fff7ed;
      padding: 8px 12px;
      margin: 10px 0;
      border-radius: 4px;
      font-style: italic;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9.5pt;
    }
    table.data-table td, table.data-table th {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    table.data-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    table.data-table tr:first-child {
      background-color: #ffedd5;
      font-weight: bold;
      color: #9a3412;
    }
    ul { margin: 6px 0; padding-left: 24px; }
    li { margin: 3px 0; }
    code {
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 9.5pt;
      color: #0f172a;
    }
    strong { font-weight: 700; color: #0f172a; }
    hr { border: 0; border-top: 1px solid #cbd5e1; margin: 16px 0; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 8pt;
      font-weight: bold;
      background: #fed7aa;
      color: #9a3412;
    }
  </style>
</head>
<body>
  ${html.join("\n")}
</body>
</html>`;
}

function inlineFormat(text) {
  let s = text;
  // bold
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

const filesToConvert = [
  {
    src: path.join(markdownDir, "RESTAURANT_SALES_BATTLECARD_AND_CLOSING_STRATEGY.md"),
    dest: path.join(pdfDir, "RESTAURANT_SALES_BATTLECARD_AND_CLOSING_STRATEGY.pdf"),
    title: "RestoPulse — Restaurant Sales Playbook & Objection-Handling Battlecard"
  },
  {
    src: path.join(markdownDir, "DOCUMENTATION_INDEX_AND_EXPLANATION.md"),
    dest: path.join(pdfDir, "DOCUMENTATION_INDEX_AND_EXPLANATION.pdf"),
    title: "RestoPulse — Master Documentation Index & Curriculum Guide"
  },
  {
    rawHtml: path.join(markdownDir, "DOCUMENTATION_CURRICULUM_AND_MAP.html"),
    dest: path.join(pdfDir, "DOCUMENTATION_CURRICULUM_AND_MAP.pdf")
  }
];

filesToConvert.forEach((item) => {
  let targetHtmlPath;
  let isTemp = false;

  if (item.rawHtml) {
    if (!fs.existsSync(item.rawHtml)) return;
    targetHtmlPath = item.rawHtml;
  } else {
    if (!fs.existsSync(item.src)) return;
    const md = fs.readFileSync(item.src, "utf-8");
    const html = markdownToHtml(md, item.title);
    targetHtmlPath = path.join(docsDir, `temp_${path.basename(item.dest, ".pdf")}.html`);
    fs.writeFileSync(targetHtmlPath, html, "utf-8");
    isTemp = true;
  }

  try {
    const cmd = `"${browserPath}" --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf="${item.dest}" "file:///${targetHtmlPath.replace(/\\/g, "/")}"`;
    execSync(cmd, { stdio: "ignore" });
    console.log(`Generated: ${path.basename(item.dest)}`);
  } catch (err) {
    console.error(`Failed to generate ${path.basename(item.dest)}:`, err);
  } finally {
    if (isTemp && fs.existsSync(targetHtmlPath)) fs.unlinkSync(targetHtmlPath);
  }
});
