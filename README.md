# Jhon's landing page

The page for [Jhon](https://github.com/jachavarro2004/jhon-agent), an agent
framework for Claude Code and pi: the presentation film first, then what Jhon
is, how it works, how to install it, the docs and sponsorship.

- Plain HTML, CSS and a little JavaScript; no framework, no external requests.
  It is served as is from the repository root (GitHub Pages).
- `assets/` holds copies of Jhon's film, its poster, the brand banner and the
  feature screenshots. `tools/sync-assets.sh [jhon-agent checkout]` refreshes
  them and writes the film's Spanish subtitles.
- `node --experimental-strip-types --test test/site.test.ts` checks the page:
  links, alt text, the lazy film, and that the install commands and README
  anchors match Jhon's README (`JHON_AGENT` names the checkout; default
  `../jhon-agent`).
- Preview: `python3 -m http.server --bind 127.0.0.1 8000`.

The page's text is in English. Licensed under Apache-2.0, like Jhon.
