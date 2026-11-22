# Imhotep addin: office

Word, Excel and PowerPoint for Imhotep projects, with
[OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) 1.0.158.

```
imhotep addin install office
```

Then turn it on for a project in **Settings → Extensions**. A project that has it on can run
`officecli` and `office-pdf` in its shell, confined to its folder like any other command,
and has the `office` skill. It suggests the rules `officecli *` and `office-pdf *`, which
let them run unasked. `officecli view … screenshot` renders pages as PNG, so the agent can
check the layout it made.

> Make a one-page report in Word from `notes.md`, with the totals from `sales.xlsx` in a
> table, and send it to me as a PDF too.

## What it installs

OfficeCLI's Linux build for the machine (x64 or arm64), from its GitHub release, checked
against the sha256 in `tool.toml` (from the release's `SHA256SUMS`); then Chrome Headless
Shell 155.0.8059.12, as Playwright publishes it, checked the same way. Nothing is installed
on the system.

`bin/google-chrome` is that headless Chrome under the name OfficeCLI looks for;
`office-pdf` prints OfficeCLI's HTML preview to PDF with it. That PDF follows the preview's
layout, not Word's or PowerPoint's own export.

| | |
|---|---|
| Size | about 305 MB (OfficeCLI 35 MB, Chrome Headless Shell 270 MB) |
| Needs | Linux x64 or arm64; Chrome's libraries on the host (the install checks them, and names the Debian/Ubuntu packages if one is missing) |
| Network at run time | none (`OFFICECLI_SKIP_UPDATE=1`) |
| Secrets | none |
| Not available | OfficeCLI's own PDF exporter plugin (`office-pdf` instead); `watch` |

`test/smoke.sh` creates, edits, validates, renders and exports a document, a workbook and
a deck in a project's folder: a run of a project with the addin on can do
`sh /opt/addins/office/test/smoke.sh`.

## Updating OfficeCLI

Change the URLs and the two sha256 in `tool.toml` (from the new release's `SHA256SUMS`),
check `skills/office/officecli-reference.md` against the new release's `SKILL.md`, raise
`version`, and `imhotep addin update office`.

## Licenses

OfficeCLI and its guide (`skills/office/officecli-reference.md`, adapted) are Apache-2.0,
© 2026 OfficeCLI: see `third-party/officecli/`. Chrome Headless Shell: Chromium's licenses,
installed with it as `chromium/chrome-headless-shell-*/LICENSE.headless_shell`. The rest is under this repository's
`LICENSE.md`.
