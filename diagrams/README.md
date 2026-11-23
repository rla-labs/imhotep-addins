# Imhotep addin: diagrams

Diagrams for Imhotep projects: Mermaid (flowchart, sequence, state, class, ER, XY chart)
rendered to SVG, PNG or terminal text in 15 themes, with no browser, by
[Pretty Mermaid](https://github.com/imxv/Pretty-mermaid-skills).

```
imhotep addin install diagrams
```

Then turn it on for a project in **Settings → Extensions**. A project that has it on can run
`render-mermaid`, `batch-mermaid` and `list-mermaid-themes` in its shell, confined to its
folder like any other command. It suggests the rules `render-mermaid *` and
`list-mermaid-themes *`.

> Draw the order flow from `docs/orders.md` as a diagram, PNG, and send it to me.

## What it installs

Every file is fixed in `tool.toml` by its sha256, and nothing runs with the network:

- Pretty Mermaid at a pinned commit (the GitHub tarball);
- Node 22.23.4 from nodejs.org (the sha256 of its `SHASUMS256.txt`); only `node` is kept,
  not npm;
- the npm packages of Pretty Mermaid's lockfile that run on Linux (`@resvg/resvg-js` and
  its build for the machine, `beautiful-mermaid`, `elkjs`, `entities`), each checked against
  the lockfile's sha512 when they were pinned; none has an install script;
- the Inter font (4.1), which PNGs are drawn with: a sandbox has no font resvg can use.

At install, in a sandbox with no network, `setup.sh` points the PNG renderer at Inter (one
line of `scripts/png.mjs`, checked to have changed) and copies the references the skill
points to.

| | |
|---|---|
| Size | about 140 MB (Node 120 MB) |
| Needs | Linux x64 or arm64 |
| Network at run time | none |
| Secrets | none |

`test/smoke.sh` renders SVG, PNG and text in a project's folder: a run of a project with the
addin on can do `sh /opt/addins/diagrams/test/smoke.sh`.

## Updating

A new Pretty Mermaid commit: its tarball's sha256, then its `package-lock.json`'s packages
(each `resolved` URL, its sha256, checked against the lockfile's `integrity`). A new Node:
the two lines of its `SHASUMS256.txt`.

## Licenses

Pretty Mermaid is MIT (`third-party/pretty-mermaid/`); Inter is under the SIL Open Font
License 1.1 (`third-party/inter/`); Node is MIT (its `LICENSE`, installed with it); resvg-js
(MPL-2.0), beautiful-mermaid (MIT), elkjs (EPL-2.0) and entities (BSD-2-Clause) carry their
licenses in their packages. This repository does not contain them: the install downloads them from their
publishers. The rest is under this repository's `LICENSE.md`.
