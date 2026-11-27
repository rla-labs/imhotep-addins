// fetch: an MCP server (stdio, JSON-RPC lines) that reads web pages and downloads files,
// with Node's own modules only. Every request goes through Imhotep's proxy (HTTPS_PROXY, set
// for this server alone): CONNECT for https, an absolute URI for http; the public internet
// only. Pages come back as Markdown (or text, or as they are); downloads go into the project.
import http from "node:http";
import https from "node:https";
import tls from "node:tls";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || "";
const PAGE_MAX = 20 << 20; // what is read of a page
const FILE_MAX = 200 << 20; // a download, at most
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0 Safari/537.36";

/** One request: the response (headers, a stream), through the proxy when there is one. */
function request(url, method = "GET") {
  const u = new URL(url);
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error(`only http and https, not ${u.protocol}`);
  const headers = { "user-agent": UA, accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "accept-encoding": "gzip, deflate, br", "accept-language": "en,*;q=0.5" };
  const port = Number(u.port) || (u.protocol === "https:" ? 443 : 80);
  return new Promise((resolve, reject) => {
    const done = (req) => { req.on("response", resolve); req.on("error", reject); req.setTimeout(30000, () => req.destroy(new Error("no answer in 30 s"))); req.end(); };
    if (!PROXY) return done((u.protocol === "https:" ? https : http).request(u, { method, headers }));
    const p = new URL(PROXY);
    if (u.protocol === "http:") return done(http.request({ host: p.hostname, port: p.port, method, path: u.href, headers: { ...headers, host: u.host } }));
    const c = http.request({ host: p.hostname, port: p.port, method: "CONNECT", path: `${u.hostname}:${port}`, headers: { host: `${u.hostname}:${port}` } });
    c.setTimeout(30000, () => c.destroy(new Error("the proxy did not answer in 30 s")));
    c.on("error", reject);
    c.on("connect", (res, socket) => {
      if (res.statusCode !== 200) { socket.destroy(); return reject(new Error(`refused by Imhotep's proxy (${res.statusCode}): the public internet only`)); }
      const s = tls.connect({ socket, servername: u.hostname });
      done(https.request(u, { method, headers, createConnection: () => s }));
    });
    c.end();
  });
}

/** Following redirects (http and https only): the final response and its URL. */
async function get(url) {
  for (let i = 0; i < 8; i++) {
    const res = await request(url);
    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
      res.resume();
      url = new URL(res.headers.location, url).href;
      continue;
    }
    return { res, url };
  }
  throw new Error("too many redirects");
}

function decoded(res) {
  const e = (res.headers["content-encoding"] || "").toLowerCase();
  return e === "gzip" ? res.pipe(zlib.createGunzip()) : e === "deflate" ? res.pipe(zlib.createInflate()) : e === "br" ? res.pipe(zlib.createBrotliDecompress()) : res;
}

async function body(res, max) {
  const parts = [];
  let n = 0;
  for await (const b of decoded(res)) {
    n += b.length;
    if (n > max) { res.destroy(); break; }
    parts.push(b);
  }
  return Buffer.concat(parts);
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", hellip: "…", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", middot: "·", copy: "©" };
const entities = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(parseInt(e[1] === "x" || e[1] === "X" ? e.slice(2) : e.slice(1), e[1] === "x" || e[1] === "X" ? 16 : 10) || 32) : ENT[e.toLowerCase()] ?? m);

/** A page as Markdown: its title, headings, paragraphs, lists and links (absolute). */
export function toMarkdown(html, base) {
  const title = entities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").trim();
  let s = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|noscript|svg|template|iframe|head)\b[\s\S]*?<\/\1>/gi, "");
  const text = (x) => entities(x.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  s = s.replace(/<a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (m, href, x) => {
    const t = text(x);
    if (!t) return "";
    try { const u = new URL(entities(href), base); return u.protocol.startsWith("http") ? `[${t}](${u.href})` : t; } catch { return t; }
  });
  s = s.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (m, n, x) => `\n\n${"#".repeat(Number(n))} ${text(x)}\n\n`);
  s = s.replace(/<img\b[^>]*?alt\s*=\s*["']([^"']+)["'][^>]*>/gi, (m, a) => ` ${a} `);
  s = s.replace(/<li\b[^>]*>/gi, "\n- ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|section|article|header|footer|ul|ol|table|tr|blockquote|h[1-6]|li|dd|dt|time)>/gi, "\n").replace(/<(td|th)\b[^>]*>/gi, " | ");
  s = entities(s.replace(/<[^>]+>/g, ""));
  s = s.split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim()).filter((l, i, a) => l || (a[i - 1] && a[i - 1].trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return title ? `# ${title}\n\n${s}` : s;
}

function charset(res, buf) {
  const m = /charset=([\w-]+)/i.exec(res.headers["content-type"] || "") || /<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.subarray(0, 4096).toString("latin1"));
  try { return new TextDecoder(m ? m[1] : "utf-8"); } catch { return new TextDecoder("utf-8"); }
}

async function fetchPage({ url, format = "markdown", start = 0, max_chars = 40000 }) {
  const { res, url: final } = await get(url);
  const buf = await body(res, PAGE_MAX);
  const type = res.headers["content-type"] || "";
  if (res.statusCode >= 400) throw new Error(`${res.statusCode} from ${final}${PROXY && res.statusCode === 403 && !buf.length ? ": refused by Imhotep's proxy, the public internet only" : ""}`);
  if (!/text|html|xml|json|javascript|csv/i.test(type) && type) return `${final}: ${type}, ${buf.length} bytes: not text. Use download to save it into the project.`;
  const raw = charset(res, buf).decode(buf);
  // A page that is mostly script (a JavaScript app, a bot check) says little without a browser.
  const thin = /html/i.test(type) && raw.length > 3000 && /<script/i.test(raw) && toMarkdown(raw, final).length < 600;
  const hint = thin ? "\n\n[little text: this page is probably built by JavaScript or checks for a browser; the browser addin's tools read it, if the project has them]" : "";
  const out = format === "raw" || !/html/i.test(type) ? raw : format === "text" ? toMarkdown(raw, final).replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") : toMarkdown(raw, final);
  const n = Math.min(Math.max(1000, Number(max_chars) || 40000), 200000);
  const part = out.slice(Number(start) || 0, (Number(start) || 0) + n);
  const more = (Number(start) || 0) + n < out.length ? `\n\n[cut at ${(Number(start) || 0) + n} of ${out.length} characters: fetch again with start = ${(Number(start) || 0) + n} for the rest]` : "";
  return `URL: ${final}\n\n${part}${more}${hint}`;
}

async function download({ url, path: to }) {
  const root = process.cwd();
  const file = path.resolve(root, String(to || ""));
  if (!to || !file.startsWith(root + path.sep)) throw new Error("path: a file inside the project, such as downloads/report.pdf");
  if (fs.existsSync(file)) throw new Error(`${to} is there already: choose another name`);
  const { res, url: final } = await get(url);
  if (res.statusCode >= 400) { res.resume(); throw new Error(`${res.statusCode} from ${final}`); }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.part`;
  const out = fs.createWriteStream(tmp, { flags: "wx" });
  let n = 0;
  try {
    for await (const b of decoded(res)) {
      n += b.length;
      if (n > FILE_MAX) throw new Error(`more than ${FILE_MAX >> 20} MiB`);
      if (!out.write(b)) await new Promise((r) => out.once("drain", r));
    }
    await new Promise((r, j) => out.end((e) => (e ? j(e) : r())));
    fs.renameSync(tmp, file);
  } catch (e) { out.destroy(); fs.rmSync(tmp, { force: true }); throw e; }
  return `Saved ${final} to ${to} (${n} bytes, ${res.headers["content-type"] || "no type"}).`;
}

const TOOLS = [
  { name: "fetch", description: "Read a web page (or a feed, a JSON or a text file) from the public internet: as Markdown by default (title, headings, paragraphs, lists, links made absolute), or as plain text, or raw. Long pages come in parts: fetch again with start. Your shell has no network: use this, not curl or wget.",
    inputSchema: { type: "object", properties: { url: { type: "string", description: "http:// or https://" }, format: { type: "string", enum: ["markdown", "text", "raw"] }, start: { type: "integer", description: "the character to start at (for the rest of a long page)" }, max_chars: { type: "integer", description: "how much to return, 40000 if not given" } }, required: ["url"] } },
  { name: "download", description: "Save a file from the public internet (a PDF, an image, a dataset, an archive) into the project, at a path of its folder that is not there yet.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, path: { type: "string", description: "inside the project, such as downloads/report.pdf" } }, required: ["url", "path"] } },
];

async function handle(m) {
  switch (m.method) {
    case "initialize": return { protocolVersion: m.params?.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "fetch", version: "1.0.0" } };
    case "tools/list": return { tools: TOOLS };
    case "tools/call": {
      const { name, arguments: a = {} } = m.params || {};
      try {
        const text = name === "fetch" ? await fetchPage(a) : name === "download" ? await download(a) : null;
        if (text === null) return { content: [{ type: "text", text: `no tool ${name}` }], isError: true };
        return { content: [{ type: "text", text }] };
      } catch (e) {
        return { content: [{ type: "text", text: `${a.url || ""}: ${e.message}` }], isError: true };
      }
    }
    case "ping": return {};
    default: throw Object.assign(new Error(`no method ${m.method}`), { code: -32601 });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const send = (x) => process.stdout.write(JSON.stringify(x) + "\n");
  readline.createInterface({ input: process.stdin }).on("line", async (line) => {
    let m;
    try { m = JSON.parse(line); } catch { return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "not JSON" } }); }
    if (m.id === undefined) return; // a notification
    try { send({ jsonrpc: "2.0", id: m.id, result: await handle(m) }); } catch (e) { send({ jsonrpc: "2.0", id: m.id, error: { code: e.code || -32603, message: e.message } }); }
  });
}
