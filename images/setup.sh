#!/bin/sh
# Run once at install, in a sandbox with no network, in the addin's folder: ImageMagick's
# AppImage unpacked without FUSE, and only what runs kept. Its own policy.xml is removed:
# only this addin's (etc/) is read.
set -eu
cd "$(dirname "$0")"
./im.AppImage --appimage-extract >/dev/null
mv squashfs-root/usr im
rm -rf squashfs-root im.AppImage im/include im/share/doc im/share/man setup.sh
find im/lib -maxdepth 1 -name '*.a' -delete
find im/lib -name '*.la' -delete
rm -f im/etc/ImageMagick-7/policy.xml
