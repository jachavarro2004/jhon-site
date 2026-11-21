#!/bin/sh
# Copies the media this page uses from a Jhon checkout into assets/, and writes
# the film's Spanish subtitles. The page is served as is (GitHub Pages, from the
# repository root); run this when the film or the screenshots change in Jhon.
#
#   tools/sync-assets.sh [path to a jhon-agent checkout]   # default ../jhon-agent
set -eu
here=$(cd "$(dirname "$0")/.." && pwd)
jhon=$(cd "${1:-${JHON_AGENT:-$here/../jhon-agent}}" && pwd)
src="$jhon/docs/assets"
pres="$jhon/docs/media/hyperframes/presentation"
out="$here/assets"
mkdir -p "$out/video/stills" "$out/brand" "$out/features"
# The films: the page plays the English one; Jhon's README links all four here,
# since Jhon keeps no video in git.
cp "$src/video/jhon-explainer.mp4" "$src/video/jhon-explainer.es.mp4" "$src/video/jhon-teaser.mp4" "$src/video/jhon-teaser.es.mp4" "$out/video/"
cp "$src/video/stills/intro.png" "$out/video/stills/"   # the film's poster
cp "$src"/brand/* "$out/brand/"
cp "$src"/features/*.png "$out/features/"
node "$here/tools/vtt.mjs" "$pres/index.html" "$pres/captions.es.json" "$out/video/jhon-explainer.es.vtt"
echo "synced assets from $jhon"
