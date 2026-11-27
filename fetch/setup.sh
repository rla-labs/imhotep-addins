#!/bin/sh
# Run once at install, in a sandbox with no network, in the addin's folder.
set -eu
cd "$(dirname "$0")"
# Only Node itself: not npm, corepack, its headers or its docs.
rm -rf node/include node/share node/lib node/bin/npm node/bin/npx node/bin/corepack node/CHANGELOG.md node/README.md
rm setup.sh
