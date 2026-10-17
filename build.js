"use strict";
const fs = require("node:fs");
const path = require("node:path");

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

function copyPublicFiles(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (excludedNames.has(entry.name)) continue;
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

copyPublicFiles(root, output);

function findReadmes(directory) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...findReadmes(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase() === "readme.txt") found.push(fullPath);
  }
  return found;
}
const leakedReadmes = findReadmes(output);
if (leakedReadmes.length) {
  console.error("Build failed: README.txt was copied into public output:", leakedReadmes);
  process.exitCode = 1;
} else {
  console.log("Public output built successfully; README.txt files excluded.");
}
