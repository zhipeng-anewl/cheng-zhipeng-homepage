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
 * 安全：输入长度/提示注入过滤、输出 PII 脱敏、审计日志、每 IP 每分钟 10 次限流。
 *
 * 启动：node server.js        （或 npm start）
 * 端口：默认 8787，可用 .env 里的 PORT 修改
 */

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { SYSTEM_PROMPT, PROFILE } = require("./knowledge");

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
const MAX_MESSAGE_CHARS = 500;
const MAX_ASSISTANT_CHARS = 1000;
const REQUEST_TIMEOUT_MS = 45_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const PUBLIC_EMAIL = PROFILE.email;
const PUBLIC_PHONE = PROFILE.phone || PROFILE.wechat;
const SAFE_REPLY = "这个话题我不方便展开。我们可以回到我的项目、技术栈或求职相关的问题。";

// 明显的提示注入和有害内容只做基础拦截；生产环境建议再接入内容安全服务。
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above)\s+(instructions?|prompts?)/i,
  /忽略(之前|以上|前面).*(指令|规则|提示)/,
  /(system|developer)\s*(prompt|message)/i,
  /(系统|开发者).*(提示词|指令|消息)/,
  /(reveal|print|show|repeat).*(prompt|instructions?|system)/i,
  /(泄露|输出|打印|重复).*(提示词|系统指令|密钥|api\s*key)/i,
  /jailbreak|dan\s*mode/i,
  /<\|.*?\|>/,
  /^\s*(system|assistant|developer)\s*:/im,
  /(读取|输出|泄露).*(\.env|环境变量|数据库|内部数据|系统提示)/i,
];

const UNSAFE_CONTENT_PATTERNS = [
  /(如何|怎么).*(制作|制造).*(炸弹|爆炸物)/,
  /(自杀|轻生).*(方法|方式|教程)/,
  /儿童.*(色情|性行为)/,
  /(制毒|贩毒|吸毒).*(方法|教程)/,
  /盗取.*(银行卡|账号|密码).*(方法|教程)/,
  /入侵.*(网站|服务器).*(教程|方法)/,
];

const PROMPT_LEAK_PATTERNS = [
  /系统提示词/i,
  /SYSTEM_PROMPT/,
  /DEEPSEEK_API_KEY/,
  /DEEPSEEK_BASE_URL/,
  /Authorization\s*:\s*Bearer/i,
  /Bearer\s+[A-Za-z0-9._-]{16,}/,
  /\.env\b/,
  /sk-[A-Za-z0-9]{20,}/,
  /api[_-]?key/i,
];

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_PATTERN = /(^|[^\d])(1[3-9]\d{9})(?!\d)/g;
const ID_CARD_PATTERN = /(^|[^\d])(\d{17}[\dXx])(?!\d)/g;
const BANK_CARD_PATTERN = /(^|[^\d])(\d{16,19})(?!\d)/g;
const API_KEY_PATTERN = /(sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/g;

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
const SERVER_ONLY_DIRS = new Set(["functions", "scripts", "logs", "tools"]);

/* ---------- 工具函数 ---------- */

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...extraHeaders,
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

/* ---------- 安全工具：限流、脱敏、内容过滤、审计日志 ---------- */

const rateLimitHits = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  let hit = rateLimitHits.get(ip);

  if (!hit || now > hit.resetAt) {
    hit = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitHits.set(ip, hit);
  }

  hit.count += 1;
  return {
    limited: hit.count > RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - hit.count),
    resetAt: hit.resetAt,
    retryAfter: Math.max(1, Math.ceil((hit.resetAt - now) / 1000)),
  };
}

function rateLimitHeaders(rate) {
  return {
    "Retry-After": String(rate.retryAfter),
    "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rate.resetAt / 1000)),
  };
}

function hashClient(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
}

function redactPII(value) {
  let text = String(value || "");
  text = text.split(PUBLIC_EMAIL).join("__PUBLIC_EMAIL__");
  text = text.split(PUBLIC_PHONE).join("__PUBLIC_PHONE__");

  text = text
    .replace(API_KEY_PATTERN, "[密钥已脱敏]")
    .replace(ID_CARD_PATTERN, (match, prefix) => `${prefix}[身份证号已脱敏]`)
    .replace(PHONE_PATTERN, (match, prefix) => `${prefix}[手机号已脱敏]`)
    .replace(EMAIL_PATTERN, "[邮箱已脱敏]")
    .replace(BANK_CARD_PATTERN, (match, prefix) => `${prefix}[银行卡号已脱敏]`);

  return text
    .split("__PUBLIC_EMAIL__")
    .join(PUBLIC_EMAIL)
    .split("__PUBLIC_PHONE__")
    .join(PUBLIC_PHONE);
}

function safeLogText(value, maxLength = 600) {
  return redactPII(value).slice(0, maxLength);
}

function auditLog(entry) {
  const line = JSON.stringify({
    event: "ai_chat",
    timestamp: new Date().toISOString(),
    ...entry,
  });

  console.log("[ai-audit]", line);

  // 本地服务额外写一份脱敏日志；EdgeOne 版本使用平台日志。
  try {
    const logDir = path.join(ROOT, "logs");
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, "ai-audit.log"), `${line}\n`, "utf8");
  } catch (error) {
    // 日志写入失败不应影响聊天请求
  }
}

function normalizeInput(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function inspectInput(text) {
  if (text.length > MAX_MESSAGE_CHARS) {
    return { ok: false, reason: "TOO_LONG", text };
  }

  if (INJECTION_PATTERNS.some((pattern) => pattern.test(text))) {
    return { ok: false, reason: "PROMPT_INJECTION", text };
  }

  if (UNSAFE_CONTENT_PATTERNS.some((pattern) => pattern.test(text))) {
    return { ok: false, reason: "UNSAFE_CONTENT", text };
  }

  return { ok: true, reason: null, text };
}

function filterOutput(value) {
  const original = String(value || "").trim();
  const redacted = redactPII(original);
  const blocked =
    PROMPT_LEAK_PATTERNS.some((pattern) => pattern.test(redacted)) ||
    UNSAFE_CONTENT_PATTERNS.some((pattern) => pattern.test(redacted));

  return {
    text: blocked ? SAFE_REPLY : redacted,
    redacted: redacted !== original,
    blocked,
  };
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
  if (!Array.isArray(messages)) {
    return { history: [], blocked: { reason: "INVALID_HISTORY", text: "" } };
  }

  const history = [];

  for (const message of messages.slice(-MAX_HISTORY_MESSAGES)) {
    if (
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string"
    ) {
      continue;
    }

    const content = normalizeInput(message.content);
    if (!content) continue;

    if (message.role === "user") {
      const check = inspectInput(content);
      if (!check.ok) {
        return { history, blocked: { reason: check.reason, text: content } };
      }
      history.push({ role: "user", content });
    } else {
      history.push({ role: "assistant", content: content.slice(0, MAX_ASSISTANT_CHARS) });
    }
  }

  return { history, blocked: null };
}

async function handleChat(req, res) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const ip = req.socket.remoteAddress || "unknown";
  const clientHash = hashClient(ip);

  // 先限流，再读请求体，避免被刷接口。
  const rate = checkRateLimit(ip);
  if (rate.limited) {
    auditLog({
      requestId,
      clientHash,
      status: 429,
      event: "rate_limited",
      retryAfter: rate.retryAfter,
    });
    sendJson(
      res,
      429,
      { error: "问得有点快，请稍后再试。", retryAfter: rate.retryAfter },
      rateLimitHeaders(rate)
    );
    return;
  }

  if (!API_KEY) {
    auditLog({ requestId, clientHash, status: 503, event: "missing_api_key" });
    sendError(
      res,
      503,
      "服务端还没有配置 DEEPSEEK_API_KEY。请在项目根目录的 .env 中填写后重启服务。"
    );
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const status = error.message === "BODY_TOO_LARGE" ? 413 : 400;
    auditLog({
      requestId,
      clientHash,
      status,
      event: error.message === "BODY_TOO_LARGE" ? "body_too_large" : "invalid_json",
    });
    sendError(
      res,
      status,
      status === 413 ? "消息太长了，请缩短后再试。" : "请求格式不正确。"
    );
    return;
  }

  const normalized = normalizeHistory(body.messages);
  if (normalized.blocked) {
    auditLog({
      requestId,
      clientHash,
      status: 400,
      event: "input_blocked",
      reason: normalized.blocked.reason,
      input: safeLogText(normalized.blocked.text, 500),
    });
    sendError(
      res,
      400,
      normalized.blocked.reason === "TOO_LONG"
        ? "消息太长了，请控制在 500 字以内。"
        : "这个问题包含不允许的指令，请换个问法。"
    );
    return;
  }

  const history = normalized.history;
  const lastMessage = history[history.length - 1];

  if (!lastMessage || lastMessage.role !== "user") {
    auditLog({ requestId, clientHash, status: 400, event: "missing_user_message" });
    sendError(res, 400, "缺少用户消息。");
    return;
  }

  const userInput = lastMessage.content;
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
      const providerStatus = response.status;
      auditLog({
        requestId,
        clientHash,
        status: 502,
        event: "provider_error",
        providerStatus,
        input: safeLogText(userInput, 500),
        latencyMs: Date.now() - startedAt,
        model: MODEL,
      });

      if (providerStatus === 401) {
        sendError(res, 502, "DeepSeek API Key 无效，请检查 .env 中的 DEEPSEEK_API_KEY。");
      } else if (providerStatus === 402) {
        sendError(res, 502, "DeepSeek 账户余额不足，请检查账户。");
      } else if (providerStatus === 429) {
        sendError(res, 502, "DeepSeek 接口调用过于频繁，请稍后再试。");
      } else {
        sendError(res, 502, `模型服务返回错误（${providerStatus}）。`);
      }
      return;
    }

    const rawReply =
      data && data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : "";

    if (typeof rawReply !== "string" || !rawReply.trim()) {
      auditLog({
        requestId,
        clientHash,
        status: 502,
        event: "empty_model_reply",
        input: safeLogText(userInput, 500),
        latencyMs: Date.now() - startedAt,
        model: MODEL,
      });
      sendError(res, 502, "模型没有返回内容，请再试一次。");
      return;
    }

    const filtered = filterOutput(rawReply);
    auditLog({
      requestId,
      clientHash,
      status: 200,
      event: "completed",
      input: safeLogText(userInput, 500),
      output: safeLogText(filtered.text, 1000),
      inputLength: userInput.length,
      outputRedacted: filtered.redacted,
      outputBlocked: filtered.blocked,
      latencyMs: Date.now() - startedAt,
      model: MODEL,
    });

    sendJson(res, 200, { reply: filtered.text });
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    auditLog({
      requestId,
      clientHash,
      status: aborted ? 504 : 502,
      event: aborted ? "provider_timeout" : "request_failed",
      errorName: error && error.name ? error.name : "Error",
      input: safeLogText(userInput, 500),
      latencyMs: Date.now() - startedAt,
      model: MODEL,
    });

    if (aborted) {
      sendError(res, 504, "模型响应超时，请重试。");
    } else {
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

  if (SERVER_ONLY_DIRS.has(segments[0])) return null;

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
