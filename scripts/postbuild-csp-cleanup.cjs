#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SCRIPT_SRC_RELAXED = "script-src 'self' 'unsafe-inline'";
const SCRIPT_SRC_STRICT = "script-src 'self'";

const htmlPath = path.join(process.cwd(), "dist", "index.html");

if (!fs.existsSync(htmlPath)) {
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, "utf-8");
let next = html
  .replace(/\s+onload="this\.media='all'"/g, "")
  .replace(
    /(<link[^>]*rel="stylesheet"[^>]*?)\smedia="print"([^>]*>)/g,
    '$1 media="all"$2'
  )
  .replace(SCRIPT_SRC_RELAXED, SCRIPT_SRC_STRICT);

// Inline tiny app CSS bundle (index-*.css) to avoid a render-blocking request.
// Keep larger maplibre CSS as an external file.
const inlineCssMatch = next.match(
  /<link[^>]*href="([^"]*\/assets\/index-[^"]+\.css)"[^>]*>/i
);
if (inlineCssMatch && inlineCssMatch[1]) {
  const href = inlineCssMatch[1];
  const fileName = href.split("/").pop();
  if (fileName) {
    const cssPath = path.join(process.cwd(), "dist", "assets", fileName);
    if (fs.existsSync(cssPath)) {
      const css = fs.readFileSync(cssPath, "utf-8");
      next = next.replace(
        inlineCssMatch[0],
        `<style id="inlined-index-css">${css}</style>`
      );
      // Remove matching noscript fallback for the now-inlined CSS file.
      next = next.replace(
        new RegExp(
          `<noscript><link[^>]*href="[^"]*${fileName.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}"[^>]*><\\/noscript>`,
          "g"
        ),
        ""
      );
    }
  }
}

if (next !== html) {
  fs.writeFileSync(htmlPath, next, "utf-8");
  console.log("[postbuild:csp] Updated dist/index.html");
}
