# Imhotep addin: pdf

PDFs for Imhotep projects: `pdftool`, one command for the everyday operations and for making
a PDF from HTML or Markdown, and [qpdf](https://github.com/qpdf/qpdf) for anything else.

```
imhotep addin install pdf
```

Then turn it on for a project in **Settings → Extensions**. A project that has it on can run
`pdftool` and `qpdf` in its shell, confined to its folder like any other command. It suggests
the rules `pdftool info *` and `pdftool text *` (they only read); the commands that write a
file keep asking unless the project allows them.

`pdftool` reads, merges, splits, keeps or deletes pages, rotates, renders pages to PNG,
compresses, encrypts and decrypts, and sets the title and author. `pdftool from-html` and
`pdftool from-md` make a PDF, with diacritics right in the text and in the bookmarks, and
images from the input's folder (a remote image is never fetched: it is left out, and
pdftool says so). An output never replaces an input.

> Make a one-page PDF report from `notes.md`, then merge it with the three invoices in
> `inbox/` and send me page 1 as an image.

## What it installs

One archive for the machine's architecture, from the release `pdf-bin-2.0.0` of
[rla-labs/argus-extensions](https://github.com/rla-labs/argus-extensions), checked against
the sha256 in `tool.toml`. It is built there by CI on glibc 2.28, from sources pinned by
version and sha256:

- `bin/pdftool` 2.0.0; it reads and renders with PDFium, writes with qpdf and converts with
  ironpress;
- `bin/qpdf` 12.4.2, with its native crypto, zlib and libjpeg-turbo built in;
- `lib/libpdfium.so`, PDFium chromium/8111 from
  [bblanchon/pdfium-binaries](https://github.com/bblanchon/pdfium-binaries);
- `libexec/ironpress` 1.7.0, [ironpress](https://github.com/gastongouron/ironpress) with a
  fix for non-ASCII bookmark titles. Only pdftool runs it.

Nothing is installed on the system.

| | |
|---|---|
| Size | about 30 MB |
| Needs | Linux x64 or arm64 with glibc 2.28 or newer |
| Network at run time | none |
| Secrets | none |

`test/smoke.sh` checks every command in a project's folder: a run of a project with the addin
on can do `sh /opt/addins/pdf/test/smoke.sh`.

## Limits

No OCR: a scanned PDF has no text to read.

## Licenses

qpdf (Apache-2.0), zlib (Zlib), libjpeg-turbo (BSD-3-Clause, IJG), PDFium (BSD-3-Clause,
Apache-2.0, and the third-party licenses it lists), ironpress (MIT; its fonts OFL-1.1),
and pdftool's Rust crates (pdfium-render, image, png, serde_json, libc: MIT or
Apache-2.0). The release archive carries their license files in `licenses/`. The rest is
under this repository's `LICENSE.md`.
