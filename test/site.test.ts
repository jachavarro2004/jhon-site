/**
 * Jhon's landing page (site/): what it loads, what it links, and that its
 * install commands are the README's.
 *
 *   node --test site/test/site.test.ts
 */
import { before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
// The Jhon checkout whose README the page quotes (install commands, anchors).
const ROOT = process.env.JHON_AGENT ?? join(SITE, "..", "jhon-agent");
const DIST = SITE;
let html = "";
let css = "";
let js = "";

before(() => {
  html = readFileSync(join(DIST, "index.html"), "utf8");
  css = readFileSync(join(DIST, "style.css"), "utf8");
  js = readFileSync(join(DIST, "app.js"), "utf8");
});

const attrs = (src: string): string[] =>
  [...src.matchAll(/\s(?:href|src|poster|srcset|action|data)="([^"]*)"/g)].map((m) => m[1]);
const cssUrls = (src: string): string[] =>
  [...src.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)|@import\s+["']([^"']+)["']/g)].map((m) => m[1] ?? m[2]);
const isExternal = (u: string): boolean => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(u);
const decode = (s: string): string =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

test("the page loads and links nothing outside github.com", () => {
  const urls = [...attrs(html), ...cssUrls(css)].filter(isExternal);
  assert.ok(urls.length > 0, "the page links the repository");
  for (const u of urls) assert.equal(new URL(u).hostname, "github.com", `external URL ${u}`);
  assert.doesNotMatch(js, /https?:\/\/|fetch\(|XMLHttpRequest|sendBeacon/, "app.js calls nothing out");
  assert.doesNotMatch(css, /@font-face|@import/, "no web fonts, no imported styles");
});

test("every local href and src exists in dist after the build", () => {
  const local = [...attrs(html), ...cssUrls(css)]
    .filter((u) => !isExternal(u) && !u.startsWith("#") && !u.startsWith("data:") && !u.startsWith("mailto:"));
  assert.ok(local.length >= 8, `found ${local.length} local references`);
  for (const u of local) {
    const path = decodeURIComponent(u.split(/[?#]/)[0]);
    assert.ok(existsSync(join(DIST, path)), `missing in dist: ${u}`);
  }
  for (const id of [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])) {
    assert.match(html, new RegExp(`id="${id}"`), `no element for #${id}`);
  }
});

test("the film loads nothing until asked, with a poster, controls and the Spanish subtitles", () => {
  const video = html.match(/<video\b[^>]*>/)?.[0] ?? "";
  assert.match(video, /\spreload="none"/);
  assert.match(video, /\scontrols\b/);
  assert.match(video, /\sposter="[^"]+"/);
  const vtt = readFileSync(join(DIST, "assets/video/jhon-explainer.es.vtt"), "utf8");
  const captions = JSON.parse(readFileSync(join(ROOT, "docs/media/hyperframes/presentation/captions.es.json"), "utf8"));
  assert.match(vtt, /^WEBVTT\n/);
  assert.equal((vtt.match(/ --> /g) ?? []).length, Object.keys(captions).length);
});

test("every image has alt text", () => {
  const imgs = html.match(/<img\b[^>]*>/g) ?? [];
  assert.ok(imgs.length > 0);
  for (const img of imgs) assert.match(img, /\salt="[^"]*\S[^"]*"/, img);
});

test("the install commands are the README's", () => {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  const row = readme.split("\n").find((l) => l.startsWith("| Install |")) ?? "";
  const fromReadme = [...row.matchAll(/`([^`]+)`/g)].map((m) => m[1].replace(/\\\|/g, "|"));
  assert.equal(fromReadme.length, 2, row);
  const onPage = [...html.matchAll(/<code[^>]*\sdata-install="[^"]+"[^>]*>([^<]*)<\/code>/g)].map((m) => decode(m[1]));
  assert.deepEqual(onPage, fromReadme);
  for (const step of ["jhon setup", "jhon start", "jhon update"]) assert.ok(readme.includes("`" + step), step);
});

test("the README anchors the page links to are the README's headings", () => {
  const slug = (h: string): string => h.trim().toLowerCase().replace(/[^\p{L}\p{N} _-]/gu, "").replace(/ /g, "-");
  const heads = new Set(
    readFileSync(join(ROOT, "README.md"), "utf8").split("\n").filter((l) => /^#{1,6} /.test(l)).map((l) => slug(l.replace(/^#+ /, ""))),
  );
  heads.add("readme");
  const anchors = [...html.matchAll(/href="https:\/\/github\.com\/jachavarro2004\/jhon-agent#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(anchors.length >= 2);
  for (const a of anchors) assert.ok(heads.has(a), `no README heading for #${a}`);
});
