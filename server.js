import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, effortFor } from "./prompts.js";

const here = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.join(here, ".env"));
} catch {
  // No .env file - rely on the real environment.
}

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const MODEL = process.env.TUTOR_MODEL || "claude-opus-5-5";
const PUBLIC_DIR = path.join(here, "public");
const MAX_BODY = 2_000_000;
const MAX_MESSAGES = 200;

const client = new Anthropic();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

async function serveStatic(req, res) {
  const url = new URL(req.url, "http://x");
  const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error("Request too large"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// Messages come from the browser: user turns are strings, assistant turns are the
// exact content arrays this server returned earlier (echoed back verbatim so thinking
// and fallback blocks stay valid).
function validMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return false;
  if (messages[0].role !== "user") return false;
  return messages.every(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      (typeof m.content === "string" || Array.isArray(m.content)),
  );
}

async function handleChat(req, res) {
  let body;
  try {
    body = await readJson(req);
  } catch (err) {
    res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: err.message }));
    return;
  }
  const { context = {}, messages } = body;
  if (!validMessages(messages)) {
    res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Invalid messages" }));
    return;
  }

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  });
  const send = (obj) => res.write(JSON.stringify(obj) + "\n");

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    // If a safety classifier declines, the API retries on Anthropic's recommended fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    cache_control: { type: "ephemeral" },
    output_config: { effort: effortFor(context) },
    system: buildSystemPrompt(context),
    messages,
  });
  res.on("close", () => {
    if (!res.writableFinished) stream.abort();
  });
  stream.on("text", (text) => send({ type: "text", text }));

  try {
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      send({ type: "error", message: "Camille couldn't answer that one. Try rephrasing." });
    } else {
      send({ type: "done", content: final.content, stop_reason: final.stop_reason });
    }
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError) return;
    let message = "Something went wrong talking to Claude.";
    if (err instanceof Anthropic.AuthenticationError) message = "Your Anthropic API key is missing or invalid. Check the .env file.";
    else if (err instanceof Anthropic.RateLimitError) message = "Rate limited. Wait a few seconds and try again.";
    else if (err instanceof Anthropic.APIConnectionError) message = "Couldn't reach the Anthropic API. Check your internet connection.";
    else if (err instanceof Anthropic.APIError) message = `API error ${err.status ?? ""}: ${err.message}`;
    console.error(err);
    send({ type: "error", message });
  }
  res.end();
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return handleChat(req, res);
  if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
  res.writeHead(405).end();
});

server.listen(PORT, HOST, () => {
  const shown = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`\n  🇫🇷  Camille, your French tutor, is ready: http://${shown}:${PORT}\n`);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.log("  ⚠️  No ANTHROPIC_API_KEY found. Copy .env.example to .env and add your key.\n");
  }
});
