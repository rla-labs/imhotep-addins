# Imhotep addin: office

Word, Excel and PowerPoint for Imhotep projects, with
[OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) 1.0.158.

```
imhotep addin install office
```

Then turn it on for a project in **Settings → Extensions**. A project that has it on can run
`officecli` in its shell, confined to its folder like any other command, and has the
`office` skill. It suggests the rule `officecli *`, which lets it run unasked.

> Make a one-page report in Word from `notes.md`, with the totals from `sales.xlsx` in a
> table.

## What it installs

OfficeCLI's Linux build for the machine (x64 or arm64), from its GitHub release, checked
against the sha256 in `tool.toml` (from the release's `SHA256SUMS`). One file, no
dependencies. Nothing is installed on the system.

| | |
|---|---|
| Size | about 35 MB |
| Needs | Linux x64 or arm64 |
| Network at run time | none (`OFFICECLI_SKIP_UPDATE=1`) |
| Secrets | none |
| Not available | `view … screenshot` and PDF (they need a headless browser, which comes later); OfficeCLI's exporter plugins; `watch` |

`test/smoke.sh` creates, edits and validates a document, a workbook and a deck in a
project's folder: a run of a project with the addin on can do
`sh /opt/addins/office/test/smoke.sh`.

## Updating OfficeCLI

Change the URLs and the two sha256 in `tool.toml` (from the new release's `SHA256SUMS`),
check `skills/office/officecli-reference.md` against the new release's `SKILL.md`, raise
`version`, and `imhotep addin update office`.

## Licenses

OfficeCLI and its guide (`skills/office/officecli-reference.md`, adapted) are Apache-2.0,
© 2026 OfficeCLI: see `third-party/officecli/`. The rest is under this repository's
`LICENSE.md`.
