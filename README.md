<p align="center">
  <img src="assets/brand/jhon-banner.gif" alt="Jhon" width="760">
</p>

<p align="center">
  <b>Let the agent run. Deliver only what is proven.</b><br>
  An agent framework for Claude Code and pi.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/jachavarro2004/jhon-site?style=flat&color=e7bbc8&labelColor=1f1f28" alt="License: Apache-2.0"></a>
  <a href="https://github.com/jachavarro2004/jhon-agent/actions/workflows/validate.yml"><img src="https://img.shields.io/github/actions/workflow/status/jachavarro2004/jhon-agent/validate.yml?branch=main&label=CI&style=flat&color=e7bbc8&labelColor=1f1f28" alt="CI"></a>
  <a href="https://github.com/sponsors/jachavarro2004"><img src="https://img.shields.io/github/sponsors/jachavarro2004?label=Sponsor&logo=githubsponsors&style=flat&color=e7bbc8&labelColor=1f1f28" alt="GitHub Sponsors"></a>
  <a href="https://github.com/jachavarro2004/jhon-site/stargazers"><img src="https://img.shields.io/github/stars/jachavarro2004/jhon-site?style=flat&color=e7bbc8&labelColor=1f1f28" alt="Stars"></a>
</p>

# Jhon's landing page

The page for [Jhon](https://github.com/jachavarro2004/jhon-agent), an agent
framework for Claude Code and pi: the presentation film first, then what Jhon
is, how it works, how to install it, the docs and the support block. It is served at
[jachavarro2004.github.io/jhon-site](https://jachavarro2004.github.io/jhon-site/).

- Plain HTML, CSS and a little JavaScript; no framework, no external requests.
  It is served as is from the repository root (GitHub Pages).
- `assets/` holds copies of Jhon's films (the presentation and the teaser, each
  in English and with Spanish subtitles; Jhon's README links them here), the poster, the brand banner and the
  feature screenshots. `tools/sync-assets.sh [jhon-agent checkout]` refreshes
  them and writes the film's Spanish subtitles.
- `node --experimental-strip-types --test test/site.test.ts` checks the page:
  links, alt text, the lazy film, that the install commands and README
  anchors match Jhon's README (`JHON_AGENT` names the checkout; default
  `../jhon-agent`), and Jhon's identity: the banner (byte-identical to
  jhon-agent's), the tagline, the family, the support block and the fonts.
- Preview: `python3 -m http.server --bind 127.0.0.1 8000`.

The page's text is in English.

## Support Jhon

Jhon is free and open source.
If it helps you, donate any amount you choose,
once or monthly, on GitHub Sponsors.
If you can't donate, a ⭐ on the repo helps
keep the project maintained.

[♥ Sponsor on GitHub](https://github.com/sponsors/jachavarro2004)

## License

Apache-2.0, like Jhon: [`LICENSE`](LICENSE).
