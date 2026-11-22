#!/bin/sh
# The first start at install, in a sandbox: officecli runs, and the host has every library
# Chrome Headless Shell needs (it takes them from the host).
set -eu
d=$(dirname "$(readlink -f "$0")")/..
"$d/bin/officecli" --version >/dev/null
chrome=$(echo "$d"/chromium/chrome-headless-shell-*/chrome-headless-shell)
missing=$(ldd "$chrome" | awk '/not found/ {print $1}' | tr '\n' ' ')
if [ -n "$missing" ]; then
  echo "office: this host lacks libraries Chrome needs: ${missing}(Debian or Ubuntu: apt install libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libasound2t64)" >&2
  exit 1
fi
"$d/bin/google-chrome" --version >/dev/null
