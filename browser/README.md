# Imhotep addin: browser

A headless Chromium for Imhotep projects, driven with
[Playwright MCP](https://github.com/microsoft/playwright-mcp) 0.0.83: open pages built by
JavaScript, click, fill forms, read the page as an accessibility tree, take screenshots and
save pages as PDF, into the project's folder.

```
imhotep addin install browser
```

Then turn it on for a project in **Settings → Extensions**; the web asks first, since it
reaches the internet. A project that has it on has the `browser__browser_…` tools and the
`browser` skill.

> Open the pricing page of example.com, take a screenshot of the plans and send it to me.

## What it installs

Every file is pinned in `tool.toml` by its sha256; a mismatch installs nothing.

- Node 22.23.4 from nodejs.org (the binary only);
- `@playwright/mcp` 0.0.83, `playwright` and `playwright-core` 1.64.0-alpha from npm, the
  versions of Argus's lockfile, with no install script;
- Chrome Headless Shell 155.0.8059.12 for the machine (x64 or arm64), from Playwright's CDN.

| | |
|---|---|
| Size | about 300 MB |
| Needs | Linux x64 or arm64; Chromium's libraries on the host (the first start names the apt packages when one is missing) |
| Network at run time | the public internet only, for its server alone, through Imhotep's proxy |
| Secrets | none |
| Profile | in memory: no cookies or logins kept between runs |

## How it is confined

- **Its own sandbox.** The server runs in a sandbox of its own, not the agent's, in the
  run's group (its memory and CPU limits): it reads the system and this folder, writes the
  project's folder and its own home, and stops with the run. Chromium runs with
  `--no-sandbox` (its own sandbox needs namespaces Imhotep's does not give) under that
  sandbox; with `sandbox = "strict"`, under gVisor.
- **The public internet only.** Its `tool.toml` says `network = "public"`: Imhotep gives
  this server, never the agent, a proxy that lets HTTPS and plain HTTP go out on 443 and 80,
  and refuses this host, its network, private and link-local addresses and the cloud's
  metadata service, after resolving the name. Loopback goes through the proxy too, so it is
  refused. WebRTC may use proxied UDP only; DNS prefetching is off (`config.json`).
- `file://` URLs are refused by Playwright.
- **Its tools' rules** (`tool.toml`, `tools`): reading the page runs unasked; navigating,
  clicking, typing and saving a PDF are asked about; running code in the page and uploading
  files are refused. A project changes any of them with its `exceptions`
  (`"browser__browser_navigate" = "allow"`).

What the agent types into a page or the pages it opens leave the project: turn it on only
where that is wanted.

`test/smoke.mjs` starts the server and drives it against a `data:` page: a
snapshot, a screenshot and a PDF. It runs at install, with no network.

## Updating

Bump `@playwright/mcp`, take the `playwright` and `playwright-core` versions it depends on
and the headless shell's version from `playwright-core/browsers.json`, and record every
file's sha256 in `tool.toml` (an npm tarball's checked against the registry's sha512).
`test/smoke.mjs` fails when a tool `tool.toml` names is gone.

## Licenses

Playwright MCP and Playwright: Apache-2.0 (`third-party/playwright/LICENSE`). Node.js: MIT
(its `LICENSE` comes with it). Chrome Headless Shell: Chromium's licenses, in
`chromium/LICENSE.headless_shell`. This folder's own files: the repository's `LICENSE.md`.
