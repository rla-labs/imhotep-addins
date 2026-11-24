#!/bin/sh
# The first start at install, in a sandbox with no network: the host has every library
# Chrome Headless Shell needs (it takes them from the host), then the whole smoke test.
set -eu
d=$(dirname "$(readlink -f "$0")")/..
missing=$(ldd "$d/chromium/chrome-headless-shell" | awk '/not found/ {print $1}' | tr '\n' ' ')
if [ -n "$missing" ]; then
  echo "browser: this host lacks libraries Chrome needs: ${missing}(Debian or Ubuntu: apt install libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libatspi2.0-0t64 libcairo2 libcups2t64 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0t64 libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2)" >&2
  exit 1
fi
exec "$d/node/bin/node" "$d/test/smoke.mjs"
