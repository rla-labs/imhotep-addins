# fetch

Web pages read as Markdown, and files downloaded into the project, for an agent whose own
shell has no network. A small MCP server written with Node's own modules (`server.mjs`,
here, about 200 lines); Node 22 is the only download, fixed by its sha256.

| Tool | What it does |
|---|---|
| `fetch__fetch` | A page, feed, JSON or text file: Markdown (title, headings, paragraphs, lists, absolute links), text, or raw; long ones in parts (`start`) |
| `fetch__download` | A file saved into the project, at a path that is not there yet (200 MiB at most) |

## Safety

- **Its server alone has the network, never the agent.** Imhotep runs it in a sandbox of
  its own with `HTTPS_PROXY` set to a proxy of its own: CONNECT on 443 and 80 and plain
  HTTP, to **public addresses only** (this host, its network, `localhost` and the cloud's
  metadata address are refused). The web shows this and asks before a project turns it on.
- **Each URL is asked about** (`access = "ask"`): a URL can carry what the agent was given.
  A project allows them with its exceptions (`fetch__* = "allow"`), a run with
  "allow for this run".
- Redirects are followed for http and https only; a page is read up to 20 MiB.

A page built by JavaScript, or behind a bot check, comes back nearly empty: the
[browser](../browser/) addin reads those.

## Install

```
imhotep addin install fetch
```

Then turn it on for a project under **Settings → Extensions**.
