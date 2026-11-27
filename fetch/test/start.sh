#!/bin/sh
# The first start at install, in a sandbox with no network.
set -eu
d=$(dirname "$(readlink -f "$0")")/..
cd "$(mktemp -d)"
exec "$d/node/bin/node" "$d/test/smoke.mjs"
