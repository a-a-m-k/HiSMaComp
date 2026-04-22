#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const htmlPath = path.join(process.cwd(), "dist", "index.html");

if (!fs.existsSync(htmlPath)) {
  console.error("[verify:csp] dist/index.html not found. Run build first.");
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf-8");

const inlineHandlerRegex = /\son[a-z]+\s*=\s*["'][^"']*["']/gi;
const jsNavRegex = /(?:href|src)\s*=\s*["']\s*javascript:/gi;
const strictScriptSrcRegex = /script-src\s+'self'\s+'unsafe-eval'/i;

const inlineHandlers = html.match(inlineHandlerRegex) || [];
const jsNavs = html.match(jsNavRegex) || [];
const hasStrictScriptSrc = strictScriptSrcRegex.test(html);

if (!hasStrictScriptSrc) {
  console.error(
    "[verify:csp] script-src is not strict enough (expected: 'self' 'unsafe-eval')."
  );
  process.exit(1);
}

if (inlineHandlers.length > 0 || jsNavs.length > 0) {
  console.error("[verify:csp] Found inline script execution vectors:");
  inlineHandlers.slice(0, 10).forEach(match => console.error(`  - ${match}`));
  jsNavs.slice(0, 10).forEach(match => console.error(`  - ${match}`));
  process.exit(1);
}

console.log("[verify:csp] OK: no inline handlers/javascript: URLs in dist/index.html");
