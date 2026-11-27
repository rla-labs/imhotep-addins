# Imhotep addins

Tool addins for Imhotep: programs a project's agent
runs from its shell, with a skill that teaches it how. Each folder here is one addin,
installed once by an admin and turned on per project.

| Addin | What a project's agent can do with it | Programs | Size |
|---|---|---|---|
| [**pdf**](pdf/) | Read a PDF's text and pages, make a PDF from HTML or Markdown, merge, split, keep or delete pages, rotate, render pages to PNG, compress, protect with a password; anything else with qpdf | `pdftool`, `qpdf` | ~30 MB |
| [**media**](media/) | Cut, join, convert, compress and inspect audio and video; extract audio, thumbnails, GIFs; burn subtitles | `ffmpeg`, `ffprobe` | ~155 MB |
| [**office**](office/) | Create, read, check, edit and render Word, Excel and PowerPoint files; export them to PDF | `officecli`, `office-pdf` | ~305 MB |
| [**images**](images/) | Resize, crop, convert, compress and watermark images; contact sheets (x64 only) | `magick` | ~77 MB |
| [**diagrams**](diagrams/) | Mermaid diagrams to SVG, PNG or text, in 15 themes, with no browser | `render-mermaid`, `batch-mermaid`, `list-mermaid-themes` | ~140 MB |
| [**browser**](browser/) | Open pages built by JavaScript, click, fill forms, read them, take screenshots and save them as PDF; the public internet only, for its server alone | Playwright MCP's `browser__browser_…` tools | ~300 MB |
| [**fetch**](fetch/) | Read web pages, feeds and JSON as Markdown and download files into the project, for an agent whose shell has no network; the public internet only, for its server alone | `fetch__fetch`, `fetch__download` | ~120 MB |

## Install

On the host, as the admin:

```
imhotep addin install pdf            # this repository's default branch
imhotep addin install pdf@v1.0.0     # a branch or tag
```

or **Settings → Extensions** in the web. Then turn it on for a project there (or add it to
`[tools] addins` in the project's file). Its next runs have the programs, on the PATH, and
the skill. The rules an addin suggests (`pdftool info *`) are offered as a button; until a
project allows them, every run of a program is asked about like any other command.

```
imhotep addin update pdf      # the newest commit of the same branch or tag
imhotep addin rollback pdf    # the version before
imhotep addin remove pdf      # once no project has it on
```

Nothing updates by itself.

## How they stay safe

- **Pinned and checked.** An addin's `tool.toml` names each file it downloads, at a fixed URL
  with its sha256. A mismatch installs nothing. No script runs with the network.
- **Set up confined.** Unpacking refuses a link that leads out of the addin. Its setup steps
  and a first start run in Imhotep's sandbox, with no network.
- **Hashed.** Imhotep records the hash of every file at install and checks them at every
  run: an addin that changed is refused (`imhotep addin update` installs it again).
- **Per project, read-only.** Only a project that turns an addin on sees it, at
  `/opt/addins/<name>`, read-only, last on the PATH (it never stands in for a system
  program). Its programs run in the run's sandbox like any other command, with no network.
- **Network only where declared.** An addin whose MCP server needs the internet (`browser`)
  says `network = "public"`: that server alone, never the agent, reaches the public internet
  through Imhotep's proxy, never the host's network or a private address; the web asks before
  turning it on for a project.

## Writing one

A folder with a `tool.toml` (Imhotep's README describes it: `bin`, `env`, `rules`,
`instructions`, `[package]`, or an MCP `[server]`), its `skills/`, and whatever small files it
needs (wrappers in `bin/`). What is large is downloaded at install, not kept here.

## Licenses

- The programs an addin downloads are under their own licenses; each addin's README lists
  them, and their license files come with what is downloaded.
- Everything else in this repository is under [`LICENSE.md`](LICENSE.md), the Sustainable
  Use License; where a part of it is a fork of, or is taken from, a project under another
  license, that license prevails for that part.
