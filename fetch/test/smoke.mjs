// The server answers MCP over stdio, lists its tools, turns HTML into Markdown, and reports
// a request that cannot go out as an error of the tool, not a crash. No network needed.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const dir = path.dirname(fileURLToPath(import.meta.url));
const { toMarkdown } = await import(path.join(dir, "../server.mjs"));
const md = toMarkdown('<html><head><title>T &amp; co</title><script>x()</script></head><body><h2>News</h2><p>One <a href="/a?b=1">first</a></p><ul><li>two</li></ul></body></html>', "https://example.com/x/");
assert.equal(md, "# T & co\n\n## News\n\nOne [first](https://example.com/a?b=1)\n\n- two");

const server = spawn(process.execPath, [path.join(dir, "../server.mjs")], { env: { ...process.env, HTTPS_PROXY: "http://127.0.0.1:9" }, stdio: ["pipe", "pipe", "inherit"] });
const replies = [];
let buf = "";
server.stdout.on("data", (b) => { buf += b; let i; while ((i = buf.indexOf("\n")) >= 0) { replies.push(JSON.parse(buf.slice(0, i))); buf = buf.slice(i + 1); } });
const ask = (id, method, params) => server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
ask(1, "initialize", {});
ask(2, "tools/list", {});
ask(3, "tools/call", { name: "fetch", arguments: { url: "https://example.com/" } });
ask(4, "tools/call", { name: "download", arguments: { url: "https://example.com/", path: "../outside" } });
for (let t = 0; replies.length < 4 && t < 100; t++) await new Promise((r) => setTimeout(r, 100));
server.kill();
const by = Object.fromEntries(replies.map((r) => [r.id, r.result]));
assert.equal(by[1].serverInfo.name, "fetch");
assert.deepEqual(by[2].tools.map((t) => t.name), ["fetch", "download"]);
assert.ok(by[3].isError, "no network here: an error of the tool");
assert.ok(by[4].isError && /inside the project/.test(by[4].content[0].text));
console.log("fetch: ok");
