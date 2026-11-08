"use strict";

/**
 * 程志鹏 · 个人主页后端（零依赖）
 *
 * 作用：
 *  1. 托管 index.html / styles.css / script.js / 图片等静态文件
 *  2. 提供 POST /api/chat，把聊天请求转发给 DeepSeek
 *
 * API Key 只从服务端环境变量读取，永远不会发送到浏览器。
 *
 * 启动：node server.js        （或 npm start）
 * 端口：默认 8787，可用 .env 里的 PORT 修改
 */

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { SYSTEM_PROMPT } = require("./knowledge");

const ROOT = __dirname;

/* ---------- 读取 .env（无第三方依赖） ---------- */

try {
  // Node 20.12+ 内置；缺少 .env 时忽略即可
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(path.join(ROOT, ".env"));
  }
} catch (error) {
  // 没有 .env 文件属于正常情况
}

const PORT = Number(process.env.PORT) || 8787;
const HOST = process.env.HOST || "127.0.0.1";
const API_KEY = (process.env.DEEPSEEK_API_KEY || "").trim();
const API_BASE = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

/* ---------- 基础配置 ---------- */

const MAX_BODY_BYTES = 16 * 1024;
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 1000;
const REQUEST_TIMEOUT_MS = 45_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

// 只属于服务端的文件，禁止被浏览器直接访问
const SERVER_ONLY_FILES = new Set(["server.js", "knowledge.js", "package.json", "package-lock.json"]);

/* ---------- 工具函数 ---------- */

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("BODY_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(raw || "{}"));
      } catch (error) {
        reject(new Error("INVALID_JSON"));
      }
    });

    req.on("error", reject);
  });
}

/* ---------- 简易限流（内存版，够个人主页用） ---------- */

const rateLimitHits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const hit = rateLimitHits.get(ip);

  if (!hit || now > hit.resetAt) {
    rateLimitHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (hit.count >= RATE_LIMIT_MAX) return true;

  hit.count += 1;
  return false;
}

// 定期清理过期记录，避免内存无限增长
setInterval(() => {
  const now = Date.now();
  for (const [ip, hit] of rateLimitHits) {
    if (now > hit.resetAt) rateLimitHits.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

/* ---------- 聊天接口 ---------- */

function normalizeHistory(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter((message) => message.content.length > 0);
}

async function handleChat(req, res) {
  if (!API_KEY) {
    sendError(
      res,
      503,
      "服务端还没有配置 DEEPSEEK_API_KEY。请在项目根目录的 .env 中填写后重启服务。"
    );
    return;
  }

  const ip = req.socket.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    sendError(res, 429, "问得有点快，请稍等一会儿再试。");
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    if (error.message === "BODY_TOO_LARGE") {
      sendError(res, 413, "消息太长了，请缩短后再试。");
    } else {
      sendError(res, 400, "请求格式不正确。");
    }
    return;
  }

  const history = normalizeHistory(body.messages);
  const lastMessage = history[history.length - 1];

  if (!lastMessage || lastMessage.role !== "user") {
    sendError(res, 400, "缺少用户消息。");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        temperature: 0.6,
        max_tokens: 600,
        stream: false,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("[DeepSeek] HTTP", response.status, data);
      if (response.status === 401) {
        sendError(res, 502, "DeepSeek API Key 无效，请检查 .env 中的 DEEPSEEK_API_KEY。");
      } else if (response.status === 402) {
        sendError(res, 502, "DeepSeek 账户余额不足，请检查账户。");
      } else if (response.status === 429) {
        sendError(res, 502, "DeepSeek 接口调用过于频繁，请稍后再试。");
      } else {
        sendError(res, 502, `模型服务返回错误（${response.status}）。`);
      }
      return;
    }

    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : "";

    if (typeof reply !== "string" || !reply.trim()) {
      sendError(res, 502, "模型没有返回内容，请再试一次。");
      return;
    }

    sendJson(res, 200, { reply: reply.trim() });
  } catch (error) {
    if (error.name === "AbortError") {
      sendError(res, 504, "模型响应超时，请重试。");
    } else {
      console.error("[DeepSeek] 请求失败：", error);
      sendError(res, 502, "连接模型服务失败，请检查网络后重试。");
    }
  } finally {
    clearTimeout(timeout);
  }
}

/* ---------- 静态文件 ---------- */

function resolveStaticPath(requestPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(requestPath);
  } catch (error) {
    return null;
  }

  if (pathname === "/") pathname = "/index.html";

  const segments = path
    .normalize(pathname)
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);

  // 禁止访问隐藏文件、.env、.git 等
  if (segments.some((segment) => segment.startsWith("."))) return null;

  const baseName = segments[segments.length - 1];
  if (SERVER_ONLY_FILES.has(baseName)) return null;

  const filePath = path.join(ROOT, ...segments);
  const relative = path.relative(ROOT, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;

  return filePath;
}

async function serveStatic(req, res, requestPath) {
  let filePath = resolveStaticPath(requestPath);

  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  try {
    let stat = await fsp.stat(filePath);

    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      stat = await fsp.stat(filePath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const isSource = ext === ".html" || ext === ".js" || ext === ".css";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      "Cache-Control": isSource ? "no-cache" : "public, max-age=3600",
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

/* ---------- 服务器 ---------- */

const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  if (url.pathname === "/api/chat") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      sendError(res, 405, "只支持 POST 请求。");
      return;
    }
    handleChat(req, res);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method not allowed");
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`端口 ${PORT} 已被占用。`);
    console.error("请关闭占用它的程序，或修改 .env 中的 PORT 后重试。");
    console.error(`（Windows 下可运行：netstat -ano | findstr :${PORT}）`);
    process.exit(1);
  }

  console.error("服务启动失败：", error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`主页已启动：http://${HOST}:${PORT}/`);
  console.log(`数字分身接口：POST http://${HOST}:${PORT}/api/chat`);

  if (!API_KEY) {
    console.warn("⚠ 未检测到 DEEPSEEK_API_KEY，聊天接口会返回 503。");
    console.warn("  请在项目根目录的 .env 中填写后重新启动。");
  } else {
    console.log(`DeepSeek 模型：${MODEL}`);
  }
});
