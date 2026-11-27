---
name: fetch
description: Read web pages, feeds and JSON from the public internet as Markdown (fetch__fetch) and download files into the project (fetch__download); the shell has no network.
---

# Fetch

Your shell has **no network**: `curl`, `wget`, `pip download` of a page, `python -c
"urllib…"` all fail. Two tools reach the public internet for you:

- `{{mcp:fetch__fetch}}` reads a page, a feed (RSS, Atom), a JSON API or a text file. A page
  comes back as Markdown: its title, headings, paragraphs, lists and links (absolute). Use
  `format: "raw"` for the HTML or XML itself, `format: "text"` for text without links.
  A long page comes in parts: the answer says where it was cut; fetch again with `start`.
- `{{mcp:fetch__download}}` saves a file (a PDF, an image, a dataset) into the project at
  a new path, `downloads/report.pdf` say. Then work on it with your shell as with any file.

Each URL may be asked about first, unless the project allows the tools.

## How

1. Start from what you were given: a site's home page, a section, or its feed (`/feed`,
   `/rss`, `/atom.xml` are often there and are cleaner than the page).
2. Read the list, then fetch each article you need: its title, date, author and text.
3. Cite the URL each fact comes from. Never fill a gap from memory: if a page cannot be
   read, say so.

## When it says little

A page built by JavaScript, or one that checks for a browser first ("checking your
browser…", a captcha), comes back nearly empty. Then:

- try its feed, or its mobile site (`m.` before the domain);
- use the browser addin's tools (`browser__browser_navigate`), if the project has them;
- else say which page could not be read.

It reaches the **public internet only**: this host, its network, `localhost` and the
cloud's metadata address are refused by Imhotep's proxy. Do not try another way.
