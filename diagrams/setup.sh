#!/bin/sh
# Run once at install, in a sandbox with no network, in the addin's folder.
set -eu
cd "$(dirname "$0")"
# Only Node itself: not npm, corepack, its headers or its docs.
rm -rf node/include node/share node/lib node/bin/npm node/bin/npx node/bin/corepack node/CHANGELOG.md node/README.md
# resvg finds no system font in a sandbox, so a PNG had no text: it is given Inter. One line
# of the pinned png.mjs, checked to have changed.
sed -i "s|font: { loadSystemFonts: true },|font: { loadSystemFonts: false, fontFiles: [process.env.DIAGRAMS_FONT], defaultFontFamily: 'Inter Variable', sansSerifFamily: 'Inter Variable' },|" app/scripts/png.mjs
grep -q 'DIAGRAMS_FONT' app/scripts/png.mjs || { echo "diagrams: could not give the PNG renderer its font" >&2; exit 1; }
# The references the skill points to.
cp app/references/DIAGRAM_TYPES.md app/references/THEMES.md skills/diagrams/
rm setup.sh
