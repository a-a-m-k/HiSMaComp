#!/usr/bin/env node
/**
 * Build for GitHub Pages with correct base path, then copy index.html → 404.html
 * so unknown paths serve the SPA. Used by predeploy before gh-pages deploy.
 *
 * Base path (not tied to repo name):
 *   - Set when deploying: VITE_BASE_PATH=/MyPath/ npm run deploy
 *   - Else derived from package.json "homepage" (e.g. https://user.github.io/MyPath).
 * Do not put VITE_BASE_PATH in .env so local "npm run build" keeps base "/".
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pkgPath = path.join(root, "package.json");
const distPath = path.join(root, "dist");

function getBasePath() {
  // Explicit env (set when running deploy) — not tied to repo name
  const fromEnv = process.env.VITE_BASE_PATH;
  if (fromEnv && fromEnv.trim()) {
    const base = fromEnv.trim();
    return base.endsWith("/") ? base : base + "/";
  }
  // Fallback: derive from package.json "homepage"
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const homepage = pkg.homepage;
    if (homepage && (homepage.includes("github.io") || homepage.includes("pages"))) {
      const u = new URL(homepage);
      const pathname = u.pathname.replace(/\/$/, "") || "";
      return pathname ? pathname + "/" : "/";
    }
  } catch (_) {}
  return "/";
}

const basePath = getBasePath();
console.log("Building for GitHub Pages with base:", basePath || "(root)");

const r = spawnSync("npm", ["run", "build"], {
  env: { ...process.env, VITE_BASE_PATH: basePath },
  stdio: "inherit",
  shell: true,
});
if (r.status !== 0) process.exit(r.status ?? 1);

// GitHub Pages: serve 404.html for unknown paths so SPA can load
const indexHtml = path.join(distPath, "index.html");
const notFoundHtml = path.join(distPath, "404.html");
if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, notFoundHtml);
  console.log("Created 404.html for SPA fallback.");
}
