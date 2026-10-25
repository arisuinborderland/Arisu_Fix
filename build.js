"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = __dirname;
const output = path.join(root, "dist");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const versionMatch = String(pkg.version || "").match(/^(\d+)\.\d+\.\d+$/);
if (!versionMatch) throw new Error("package.json must use a numeric semantic version (for example 178.0.0).");
const releaseToken = `AFV${versionMatch[1]}`;

// Explicit root-level allowlist: anything not listed here is never copied to public output.
// Keep Cloudflare Pages Functions outside dist; also exclude build tooling, package metadata,
// legacy Vercel configuration, SQL migrations, and documentation from public output.
const publicRootFiles = new Set([
  "_headers", "index.html", "about.html", "reviews.html", "proofs.html", "privacy.html", "story-admin.html",
  "styles.css", "about-page.css", "about-link.css", "reviews.css", "proofs.css", "privacy.css", "story-admin.css", "story-viewer.css",
  "script.js", "header-scroll.js", "desktop-layout.js", "image-protection.js", "reviews-floating-cleanup.js",
  "story-viewer.js", "scroll-reveal.js", "scroll-restoration.js", "review-lightbox.js",
  "privacy-year.js", "proofs.js", "story-admin.js",
  "favicon.ico", "favicon-16.png", "favicon-32.png", "favicon-48.png", "apple-touch-icon.png",
  "verse-lake-photo.jpg", "tiktok-profile-preview.jpg", "social-preview.jpg",
  "arisu-profile.jpg", "facebook-page-preview.jpg"
]);
const publicAssetDirectories = new Set(["reviews", "proofs"]);
const publicAssetExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"]);
const requiredFunctionFiles = [
  "functions/api/stories.js", "functions/api/story-count.js", "functions/api/story-config.js",
  "functions/api/story-view.js", "functions/api/story-views-admin.js", "functions/api/cleanup-stories.js",
  "functions/api/[[path]].js"
];

function walkFiles(directory) {
  const files = [];
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    // Package-manager and deployment metadata directories are not project source.
    // In particular, Vercel may materialize node_modules/.bin entries as symlinks.
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".vercel") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in project source inputs: ${path.relative(root, fullPath)}`);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}
function relative(file) { return path.relative(root, file).split(path.sep).join("/"); }
function fail(message) { console.error(message); process.exitCode = 1; }
function copyAllowedPublicFiles() {
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  for (const name of fs.readdirSync(root)) {
    if (name === "dist") continue;
    // Ignore all non-allowlisted root entries before inspecting their filesystem type.
    // This keeps npm/Vercel-generated node_modules symlinks out of the source audit.
    if (!publicRootFiles.has(name) && !publicAssetDirectories.has(name)) continue;
    const source = path.join(root, name);
    const stat = fs.lstatSync(source);
    if (stat.isSymbolicLink()) throw new Error(`Symlink at allowlisted project input is not allowed: ${name}`);
    if (stat.isFile() && publicRootFiles.has(name)) {
      fs.copyFileSync(source, path.join(output, name));
      continue;
    }
    if (stat.isDirectory() && publicAssetDirectories.has(name)) {
      const destination = path.join(output, name);
      fs.mkdirSync(destination, { recursive: true });
      for (const file of walkFiles(source)) {
        const ext = path.extname(file).toLowerCase();
        if (!publicAssetExtensions.has(ext)) continue;
        const target = path.join(destination, path.relative(source, file));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(file, target);
      }
    }
  }
}
function verifyBackendLayout() {
  for (const name of requiredFunctionFiles) {
    const file = path.join(root, name);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      fail(`Build failed: required Cloudflare Pages Function is missing: ${name}`);
    }
  }
  // Cloudflare Pages discovers runtime handlers from functions/, outside the static dist output.
  // Their JavaScript syntax is checked separately by verifySyntax().
}
function verifyExactPublicOutput() {
  const actual = walkFiles(output).map(file => path.relative(output, file).split(path.sep).join("/")).sort();
  const expected = [];
  for (const name of publicRootFiles) {
    if (fs.existsSync(path.join(root, name))) expected.push(name);
  }
  for (const dir of publicAssetDirectories) {
    for (const file of walkFiles(path.join(root, dir))) {
      if (publicAssetExtensions.has(path.extname(file).toLowerCase())) expected.push(relative(file));
    }
  }
  expected.sort();
  const unexpected = actual.filter(file => !expected.includes(file));
  const missing = expected.filter(file => !actual.includes(file));
  if (unexpected.length) fail(`Build failed: unexpected files in public output:\n${unexpected.join("\n")}`);
  if (missing.length) fail(`Build failed: expected public files are missing from output:\n${missing.join("\n")}`);
  const forbidden = actual.filter(file => /(^|\/)(?:api|lib|supabase|\.vercel|dist)(?:\/|$)/i.test(file)
    || /(?:^|\/)(?:build\.js|package\.json|vercel\.json|\.vercelignore|readme(?:\..*)?)$/i.test(file)
    || /\.sql$/i.test(file));
  if (forbidden.length) fail(`Build failed: internal/backend files leaked into public output:\n${forbidden.join("\n")}`);
}
function verifyVersionTokens() {
  const candidates = walkFiles(root).filter(file => !file.startsWith(`${output}${path.sep}`)
    && [".html", ".css", ".js"].includes(path.extname(file).toLowerCase())
    && !["build.js"].includes(path.basename(file))
    && !file.includes(`${path.sep}api${path.sep}`)
    && !file.includes(`${path.sep}lib${path.sep}`));
  const stale = [];
  for (const file of candidates) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/[?&]v=(AFV\d+)\b/g)) {
      if (match[1] !== releaseToken) stale.push(`${relative(file)}: ${match[1]} (expected ${releaseToken})`);
    }
  }
  if (stale.length) fail(`Build failed: stale active cache-busting version tokens found:\n${stale.join("\n")}`);
}
function verifySyntax() {
  const scripts = walkFiles(root).filter(file => path.extname(file).toLowerCase() === ".js" && !file.startsWith(`${output}${path.sep}`));
  for (const script of scripts) {
    const result = spawnSync(process.execPath, ["--check", script], { encoding: "utf8" });
    if (result.status !== 0) fail(`Build failed: JavaScript syntax check failed for ${relative(script)}\n${result.stderr || result.stdout}`);
  }
}
function localTargetExists(reference, sourceFile) {
  const trimmed = reference.trim();
  if (!trimmed || trimmed.startsWith("#") || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(trimmed)) return true;
  let pathname = trimmed.split(/[?#]/, 1)[0];
  if (!pathname) return true;
  try { pathname = decodeURIComponent(pathname); } catch { /* preserve malformed text for a useful failure */ }
  const base = pathname.startsWith("/") ? output : path.dirname(sourceFile);
  const target = path.resolve(base, pathname.startsWith("/") ? `.${pathname}` : pathname);
  return (target === output || target.startsWith(`${output}${path.sep}`)) && fs.existsSync(target);
}
function verifyLocalReferences() {
  const issues = [];
  for (const file of walkFiles(output)) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".html" && ext !== ".css") continue;
    const content = fs.readFileSync(file, "utf8");
    const refs = ext === ".html"
      ? [...content.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)].map(m => m[2])
      : [...content.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)].map(m => m[2]);
    for (const ref of refs) if (!localTargetExists(ref, file)) issues.push(`${path.relative(output, file)}: missing local target "${ref}"`);
  }
  if (issues.length) fail(`Build failed: broken local references:\n${issues.join("\n")}`);
}

copyAllowedPublicFiles();
verifyBackendLayout();
verifyExactPublicOutput();
verifyVersionTokens();
verifySyntax();
verifyLocalReferences();
if (process.exitCode) {
  console.error("Production build validation failed.");
} else {
  console.log(`Production build passed for ${releaseToken}: ${walkFiles(output).length} allowlisted public files; Cloudflare Functions layout, output allowlist, cache-busting tokens, JavaScript syntax, and local references validated.`);
}
