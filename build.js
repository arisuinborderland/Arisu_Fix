"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = __dirname;
const output = path.join(root, "dist");
const excludedNames = new Set([
  "README.txt",
  ".vercelignore",
  "package.json",
  "build.js",
  "vercel.json",
  "dist",
  ".git",
  ".vercel"
]);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function isInternalFile(name) {
  return excludedNames.has(name)
    || /^readme(?:\..*)?$/i.test(name)
    || /_(?:file_audit|deepaudit_report|imageasset_audit)\.md$/i.test(name);
}

function copyPublicFiles(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (isInternalFile(entry.name)) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyPublicFiles(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function walkFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function findInternalFiles(directory) {
  return walkFiles(directory).filter((file) => {
    const name = path.basename(file);
    return /^readme(?:\..*)?$/i.test(name) || /_(?:file_audit|deepaudit_report|imageasset_audit)\.md$/i.test(name);
  });
}

function localTargetExists(reference, sourceFile, publicRoot) {
  const trimmed = reference.trim();
  if (!trimmed || trimmed.startsWith("#") || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(trimmed)) return true;
  let pathname = trimmed.split(/[?#]/, 1)[0];
  if (!pathname) return true;
  try { pathname = decodeURIComponent(pathname); } catch { /* Keep original path if malformed. */ }
  const base = pathname.startsWith("/") ? publicRoot : path.dirname(sourceFile);
  let target = path.resolve(base, `.${pathname.startsWith("/") ? pathname : `/${pathname}`}`);
  if (pathname === "/") target = path.join(publicRoot, "index.html");
  return target === publicRoot || target.startsWith(`${publicRoot}${path.sep}`)
    ? fs.existsSync(target)
    : false;
}

function checkLocalReferences(files) {
  const issues = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".html" && ext !== ".css") continue;
    const content = fs.readFileSync(file, "utf8");
    const references = [];
    if (ext === ".html") {
      for (const match of content.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)) {
        references.push({ value: match[2], kind: "HTML src/href" });
      }
    } else {
      for (const match of content.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
        references.push({ value: match[2], kind: "CSS url()" });
      }
    }
    for (const ref of references) {
      if (!localTargetExists(ref.value, file, output)) {
        issues.push(`${path.relative(output, file)}: missing ${ref.kind} target "${ref.value}"`);
      }
    }
  }
  return issues;
}

copyPublicFiles(root, output);

const leakedInternalFiles = findInternalFiles(output);
if (leakedInternalFiles.length) {
  console.error("Build failed: internal documentation was copied into public output:", leakedInternalFiles);
  process.exitCode = 1;
}

const publicFiles = walkFiles(output);
const referenceIssues = checkLocalReferences(publicFiles);
if (referenceIssues.length) {
  console.error("Build failed: broken local asset references were found:\n" + referenceIssues.join("\n"));
  process.exitCode = 1;
}

const sourceScripts = walkFiles(root).filter((file) => path.extname(file).toLowerCase() === ".js" && !file.startsWith(`${output}${path.sep}`));
for (const script of sourceScripts) {
  const result = spawnSync(process.execPath, ["--check", script], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`Build failed: JavaScript syntax check failed for ${path.relative(root, script)}\n${result.stderr || result.stdout}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  console.error("Production build validation failed.");
} else {
  console.log(`Public output built successfully (${publicFiles.length} files); internal docs excluded, local references resolved, and JavaScript syntax validated.`);
}
