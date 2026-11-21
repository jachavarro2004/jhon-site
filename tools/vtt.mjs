// Writes the film's Spanish subtitles as WebVTT, from the presentation's own
// sources: the caption clips' times in the composition (index.html, written by
// compose.mjs) and their Spanish text (captions.es.json).
//
//   node site/vtt.mjs <composition index.html> <captions.es.json> <out.vtt>
import { readFileSync, writeFileSync } from "node:fs";

export function cues(html, captions) {
  const clip = /<div id="cap-[^"]+" class="cap clip" data-start="([\d.]+)" data-duration="([\d.]+)"[^>]*>\s*<span[^>]*data-var-text="([^"]+)"/g;
  const out = [];
  for (const m of html.matchAll(clip)) {
    const text = captions[m[3]];
    if (!text) throw new Error(`no Spanish subtitle for ${m[3]}`);
    const start = Number(m[1]);
    out.push({ start, end: start + Number(m[2]), text });
  }
  if (out.length === 0) throw new Error("no caption clips in the composition");
  return out;
}

const stamp = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}.${p(ms % 1000, 3)}`;
};
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function vtt(list) {
  return "WEBVTT\n\n" + list.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${esc(c.text)}\n`).join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [html, json, out] = process.argv.slice(2);
  if (!out) {
    console.error("usage: node site/vtt.mjs <composition index.html> <captions.es.json> <out.vtt>");
    process.exit(2);
  }
  writeFileSync(out, vtt(cues(readFileSync(html, "utf8"), JSON.parse(readFileSync(json, "utf8")))));
}
