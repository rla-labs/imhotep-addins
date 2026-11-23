# Imhotep addin: images

Images for Imhotep projects: ImageMagick 7.1.2 (`magick`) under a strict security policy,
and a skill with the recipes an agent needs.

```
imhotep addin install images
```

Then turn it on for a project in **Settings → Extensions**. A project that has it on can run
`magick` in its shell, confined to its folder like any other command. It suggests the rule
`magick identify *` (it only reads); every other command writes a file and keeps asking
unless the project allows it.

> Make 800px-wide JPEGs of every photo in `inbox/`, with our logo in the corner, and a
> contact sheet of them.

## What it installs

ImageMagick's official Linux build (7.1.2-34, the x86_64 AppImage), checked against the
sha256 in `tool.toml`, then unpacked at install, in a sandbox with no network, without FUSE.
Nothing is installed on the system.

| | |
|---|---|
| Size | about 77 MB |
| Needs | **Linux x64 only**: ImageMagick publishes no Linux arm64 build. Five libraries from the host: `libx11-6 libfontconfig1 libfreetype6 libharfbuzz0b libfribidi0`, plus `fonts-dejavu-core` for text. The install checks them, and says what to install. |
| Network at run time | none |
| Secrets | none |

**A host's own ImageMagick comes first.** An addin's programs are last on the PATH, so a
host that has `/usr/bin/magick` runs that one, under the host's policy, not this one;
`magick -version` tells which. Remove the host's, or keep it if its policy suits you.

`test/smoke.sh` checks the usual operations and the policy in a project's folder: a run of
a project with the addin on can do `sh /opt/addins/images/test/smoke.sh`.

## The security policy

`etc/policy.xml` is the only policy ImageMagick reads (the build's own is removed):

- no delegates: ImageMagick never runs another program;
- refused: MVG and MSL (drawing and scripting), URL, HTTP(S), FTP, EPHEMERAL, TEXT, `@file`
  lists, and PostScript, PDF and XPS (the `pdf` addin handles PDFs);
- at most 16,000 pixels a side, 128 megapixels, 512 MB of memory, 1 GB mapped, 2 GB of
  disk, 2 threads and 2 minutes for one command.

## Licenses

ImageMagick is under the ImageMagick License (`third-party/imagemagick/`), an Apache-style
license. This repository does not contain it: the install downloads it from its publisher.
The rest is under this repository's `LICENSE.md`.
