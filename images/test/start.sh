#!/bin/sh
# The first start at install, in a sandbox: the host has the libraries ImageMagick takes
# from it, and magick runs.
set -eu
d=$(dirname "$(readlink -f "$0")")/..
missing=$(LD_LIBRARY_PATH="$d/im/lib" ldd "$d/im/bin/magick" | sed -n 's/^[[:space:]]*\([^ ]*\) => not found$/\1/p' | sort -u | tr '\n' ' ')
if [ -n "$missing" ]; then
  echo "images: this host lacks libraries ImageMagick needs: ${missing}(Debian or Ubuntu: apt install libx11-6 libfontconfig1 libfreetype6 libharfbuzz0b libfribidi0 fonts-dejavu-core)" >&2
  exit 1
fi
"$d/bin/magick" -version >/dev/null
