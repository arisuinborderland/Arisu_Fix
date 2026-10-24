# Cloudflare Pages jSquash Proof of Concept

## Purpose
Verify whether jSquash JPEG, PNG, and WebP decoders can be bundled and initialized in this repository's Cloudflare Pages Functions environment before changing the Stories upload path.

## Safety boundary
- This branch is an isolated proof of concept: `migration/cloudflare-jSquash-poc`.
- Do not merge into `main` or deploy to production during this experiment.
- Do not change `functions/api/stories.js` upload routing or remove its Vercel POST fallback until all acceptance checks pass.
- Do not use production Supabase credentials or upload/delete production stories in tests.

## Acceptance checks
1. Pin compatible versions of `@jsquash/jpeg`, `@jsquash/png`, and `@jsquash/webp`; update `package-lock.json` using npm rather than hand-editing it.
2. Build with the same bundling path used for Cloudflare Pages Functions and confirm every WASM module is included and can be initialized at runtime.
3. Decode valid JPEG, PNG, and WebP fixtures; verify decoded width, height, and pixel data.
4. Verify PNG/WebP alpha transparency is retained in the decoded pixel data.
5. Reject malformed/corrupt data and MIME/format mismatches.
6. Enforce existing upload limits: maximum 3 MB, maximum dimension 4096 pixels, and maximum 16 megapixels.
7. Confirm the test path uses no production secrets and makes no production Supabase calls.
8. Record exact build/test commands and results before implementing native upload.

## Important limitation
A passing Node.js unit test alone is insufficient. The key check is compatibility with the actual Pages Functions/WASM bundling and runtime. Cloudflare documents WASM module imports for Pages Functions, but the exact jSquash package integration must still be verified.

## Decision gate
Only after all checks pass should a separate change implement native POST upload. Keep Vercel fallback until native upload is validated against an isolated staging Supabase project.
