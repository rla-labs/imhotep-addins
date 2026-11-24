#!/bin/sh
# Run once at install, in a sandbox with no network, in the addin's folder.
set -eu
cd "$(dirname "$0")"
# Only Node itself: not npm, corepack, its headers or its docs.
rm -rf node/include node/share node/lib node/bin/npm node/bin/npx node/bin/corepack node/CHANGELOG.md node/README.md
test -x chromium/chrome-headless-shell || { echo "browser: chrome-headless-shell is missing from the archive" >&2; exit 1; }
rm setup.sh
