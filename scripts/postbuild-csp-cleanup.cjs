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

if (next !== html) {
  fs.writeFileSync(htmlPath, next, "utf-8");
  console.log("[postbuild:csp] Updated dist/index.html");
}
