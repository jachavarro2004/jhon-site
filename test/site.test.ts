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

// Hosts a link (<a href>) may leave the page for: GitHub, and the family's YouTube channel.
const LINK_HOSTS = new Set(["github.com", "www.youtube.com"]);
// The words a reader sees: block ends and <br> read as a space, inline tags as nothing.
const text = (src: string): string =>
  decode(src.replace(/<br\s*\/?>|<\/(?:p|h[1-6]|li|div|ul|nav)>/g, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const section = (id: string): string => html.match(new RegExp(`<section\\b[^>]*\\sid="${id}"[\\s\\S]*?</section>`))?.[0] ?? "";

test("the page loads nothing from outside and links only GitHub and YouTube", () => {
  const urls = [...attrs(html), ...cssUrls(css)].filter(isExternal);
  assert.ok(urls.length > 0, "the page links the repository");
  const links = new Set([...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1]));
  for (const u of urls) {
    const host = new URL(u).hostname;
    if (links.has(u)) assert.ok(LINK_HOSTS.has(host), `external link ${u}`);
    else assert.equal(host, "github.com", `external URL ${u}`);
  }
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
  assert.match(vtt, /^WEBVTT\n/);
  // The captions' source left jhon-agent with the video tooling (jhon-studio):
  // every cue of the shipped track carries text.
  const cues = vtt.split(/\n\n+/).filter((c) => c.includes(" --> "));
  assert.ok(cues.length > 0);
  for (const cue of cues) assert.match(cue.split("\n").slice(cue.split("\n").findIndex((l) => l.includes(" --> ")) + 1).join("\n"), /\S/, cue);
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

test("the hero shows the banner GIF, byte-identical to Jhon's, then the tagline block", () => {
  const hero = section("hero");
  const img = hero.match(/<img\b[^>]*src="assets\/brand\/jhon-banner\.gif"[^>]*>/)?.[0] ?? "";
  assert.match(img, /\salt="Jhon"/, "the hero's brand mark is the banner GIF, alt Jhon");
  const banner = readFileSync(join(DIST, "assets/brand/jhon-banner.gif"));
  assert.equal(banner.length, 61818);
  assert.ok(banner.equals(readFileSync(join(ROOT, "docs/assets/brand/jhon-banner.gif"))), "same bytes as jhon-agent's");
  const after = text(hero.slice(hero.indexOf(img) + img.length));
  assert.ok(
    after.startsWith("Let the agent run. Deliver only what is proven. An agent framework for Claude Code and pi."),
    `tagline under the banner: ${after.slice(0, 120)}`,
  );
  assert.doesNotMatch(html, /class="wm"|class="brand"[^>]*>\s*<span class="seal"/, "no CSS seal + text wordmark as the mark");
});

test("the sponsor section is the support block: any amount, no tier, and a star", () => {
  const spon = section("sponsor");
  const words = text(spon);
  assert.ok(
    words.includes(
      "Jhon is free and open source. If it helps you, donate any amount you choose, once or monthly, on GitHub Sponsors. " +
        "If you can't donate, a ⭐ on the repo helps keep the project maintained.",
    ),
    words,
  );
  assert.match(spon, /<h2\b[^>]*>Support <em>Jhon<\/em><\/h2>/, "the site is social, not a product: Support Jhon");
  assert.match(spon, /<a\b[^>]*href="https:\/\/github\.com\/sponsors\/jachavarro2004"[^>]*>[\s\S]*?♥[\s\S]*?Sponsor on GitHub<\/a>/);
  assert.match(spon, /href="https:\/\/github\.com\/jachavarro2004\/jhon-agent"/, "the star line links the repo");
  assert.doesNotMatch(text(html), /\btiers?\b|\$\s?\d/i, "no tier and no amount anywhere");
});

test("no family section: no section, nav link or footer list", () => {
  assert.doesNotMatch(html, /id="family"|href="#family"|The Jhon family|class="family"/);
});

test("the look is Jhon's: rose ink, Fraunces, Space Grotesk, FiraCode as the mono", () => {
  const v = (name: string): string => css.match(new RegExp(`--${name}:([^;]+);`))?.[1] ?? "";
  assert.match(v("mono"), /^"FiraCode Nerd Font","FiraCode Nerd Font Mono","Fira Code",/);
  assert.doesNotMatch(css, /JetBrains/);
  assert.match(v("display"), /^"Fraunces"/);
  assert.match(v("ui"), /^"Space Grotesk"/);
  assert.equal(v("rosa"), "#e7bbc8");
  assert.equal(v("rosa-fill"), "#53343f");
  assert.equal(v("ink"), "#e9e0e1");
  assert.equal(v("bg"), "#1f1f28");
  assert.equal(v("rail"), "#161618");
});

test("the Spanish film and the share card point at files this site publishes", () => {
  assert.match(html, /<a\b[^>]*href="assets\/video\/jhon-explainer\.es\.mp4"[^>]*data-play="es"/);
  const meta = (p: string): string => html.match(new RegExp(`<meta property="${p}" content="([^"]*)"`))?.[1] ?? "";
  assert.equal(meta("og:title"), "Jhon · Let the agent run. Deliver only what is proven.");
  assert.equal(meta("og:description"), html.match(/<meta name="description" content="([^"]*)"/)?.[1]);
  const site = "https://jachavarro2004.github.io/jhon-site/";
  assert.ok(meta("og:image").startsWith(site), meta("og:image"));
  assert.ok(existsSync(join(DIST, meta("og:image").slice(site.length))), meta("og:image"));
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
