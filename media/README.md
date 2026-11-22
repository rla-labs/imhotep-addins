# Imhotep addin: media

Audio and video for Imhotep projects: static `ffmpeg` and `ffprobe` 7.0.2, and a skill with
the recipes an agent needs.

```
imhotep addin install media
```

Then turn it on for a project in **Settings → Extensions**. A project that has it on can run
`ffmpeg` and `ffprobe` in its shell, confined to its folder like any other command. It
suggests the rule `ffprobe *` (it only reads); `ffmpeg` writes files, so it keeps asking
unless the project allows it.

> Cut the first two minutes of `talk.mp4`, make it fit 45 MB and send it to me, with a
> thumbnail at 0:30.

## What it installs

John Van Sickle's static builds of ffmpeg 7.0.2, as
[eugeneware/ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) `b6.1.1` publishes
them, for the machine (x64 or arm64), each checked against the sha256 in `tool.toml`.
Nothing is installed on the system.

| | |
|---|---|
| Size | about 155 MB (x64) |
| Needs | Linux x64 or arm64 (static: no library from the host) |
| Network at run time | none |
| Secrets | none |

**A host's own ffmpeg comes first.** An addin's programs are last on the PATH, so a host
that has `/usr/bin/ffmpeg` runs that one; `ffmpeg -version` tells which.

**A long render ties up the server's CPU** and runs within the run's memory and CPU limits.
The skill runs renders in the background, with `nice`.

`test/smoke.sh` checks the usual operations in a project's folder: a run of a project with
the addin on can do `sh /opt/addins/media/test/smoke.sh`.

## Licenses

The ffmpeg builds are GPL v3 (`third-party/ffmpeg/`). This repository does not contain them:
the install downloads them from their publisher. The rest is under this repository's
`LICENSE.md`.
