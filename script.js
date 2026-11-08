"use strict";

/* =========================================================
   程志鹏 · 个人主页交互
   - 数字分身：本地规则版（不联网、不保存对话）
   - 联系信息：同步修改 index.html 与下方 PROFILE
   ========================================================= */

const PROFILE = {
  name: "程志鹏",
  email: "2362952677@qq.com",
  wechat: "15179367585",
  greeting:
    "你好，我是程志鹏的数字分身。\n可以问我：最近在做什么、关注什么方向，或者怎么联系我。",
};

const INTENTS = [
  {
    id: "digital-twin",
    patterns: [
      /你是(不是|否)?.*(真人|机器人|ai|人工智能)/i,
      /(真人|机器人).*吗/i,
      /规则版/,
      /你会(不会)?(思考|学习|聊天)/,
    ],
    reply:
      "我是程志鹏的数字分身，基于这个页面上的公开信息回答问题。\n\n遇到资料之外的问题，我会直接说不确定，不会编造没有提供的经历。",
  },
  {
    id: "contact",
    patterns: [
      /联系/,
      /邮箱/,
      /微信/,
      /电话/,
      /私信/,
      /怎么找到/,
      /在哪找/,
      /合作方式/,
    ],
    reply: `目前可以通过这两种方式联系我：\n\n· 邮箱：${PROFILE.email}\n· 微信：${PROFILE.wechat}\n\n如果你更想先了解我，也可以继续问，或者回到页面底部的「联系」区。`,
  },
  {
    id: "works",
    patterns: [
      /作品/,
      /案例/,
      /项目/,
      /portfolio/i,
      /做过什么/,
      /有什么成果/,
      /作品集/,
    ],
    reply:
      "目前还没有公开作品或项目案例。\n\n如果你有具体的合作场景，或者想了解我正在做什么，欢迎通过邮箱或微信进一步聊。",
  },
  {
    id: "now",
    patterns: [
      /现在.*(做|忙|弄|搞|干)/,
      /最近.*(做|忙|弄|搞|干)/,
      /目前.*(做|忙|弄|搞|干)/,
      /在做什么/,
      /忙什么/,
      /近况/,
      /最近怎么样/,
    ],
    reply:
      "我最近主要在学三件事：AI 应用开发、Python 后端开发，还有前端 Vue 3。\n\n也在试着把学到的东西做成更完整的小项目。",
  },
  {
    id: "intro",
    patterns: [
      /你是谁/,
      /介绍.*(自己|你)/,
      /自我介绍/,
      /你是做什么/,
      /什么职业/,
      /干什么的/,
      /你的身份/,
      /^介绍一下$/,
    ],
    reply:
      "我是程志鹏。\n\n最近在学 AI 应用开发、Python 后端开发和前端 Vue 3，长期关注大模型训练与微调、多模态表示学习和知识图谱。喜欢把复杂的问题讲明白，也在慢慢积累自己的项目。",
  },
  {
    id: "strengths",
    patterns: [
      /擅长/,
      /优势/,
      /强项/,
      /会什么/,
      /能做.*什么/,
      /能力/,
      /厉害/,
    ],
    reply:
      "我长期关注大模型训练与微调、多模态表示学习、知识图谱这几个方向，也在学 AI 应用开发、Python 后端和 Vue 3。\n\n还在学习和积累阶段，说不上专家，但愿意把复杂问题讲清楚。",
  },
  {
    id: "cooperation",
    patterns: [
      /合作/,
      /面试/,
      /招聘/,
      /岗位/,
      /工作机会/,
      /简历/,
      /求职/,
      /适合.*做/,
    ],
    reply: `如果你有 AI 应用、Python 后端或大模型相关方向的交流或合作机会，欢迎聊聊。\n\n可以直接说清楚你的场景、目标和时间节奏，发到邮箱 ${PROFILE.email}，或者加微信 ${PROFILE.wechat}。能做的事我会认真聊，做不了的也会直说。`,
  },
  {
    id: "interests",
    patterns: [/兴趣/, /爱好/, /喜欢.*什么/, /平时.*喜欢/],
    reply:
      "我最近大部分精力都在 AI 应用开发、Python 后端和前端 Vue 3 上，也长期关注大模型训练与微调、多模态表示学习、知识图谱。\n\n其他个人爱好我还没写进资料里，不想乱说。",
  },
  {
    id: "homepage",
    patterns: [
      /为什么.*主页/,
      /主页.*为什么/,
      /数字分身/,
      /这个网站/,
      /做这个站/,
      /个人主页/,
    ],
    reply:
      "做这个主页，一方面是想有个稳定的地方放以后的作品和项目，另一方面也是想试试：一个懂我公开信息的数字分身，能不能替我先回答一些重复的问题。\n\n现在这一版接了大模型，回答基于页面上的公开资料；网络不通时会退回本地预设回答。",
  },
  {
    id: "ai",
    patterns: [/\bai\b/i, /人工智能/, /大模型/, /智能体/, /提示词/],
    reply:
      "AI 是我最近投入比较多的方向。\n\n我在学 AI 应用开发，也长期关注大模型训练与微调、多模态表示学习和知识图谱。目前更关注怎么把学到的东西真正做成能用的项目。",
  },
  {
    id: "thanks",
    patterns: [/谢谢/, /感谢/, /\bthx\b/i, /\bthanks\b/i],
    reply:
      "不客气。想继续聊的话，可以问我最近在做什么，或者直接看页面底部的联系方式。",
  },
  {
    id: "greeting",
    patterns: [/^(你好|您好|嗨|hi|hello|hey|在吗)[！!。.，,\s]*$/i],
    reply:
      "你好，我在。想先聊哪一面：最近的近况、作品方向，还是怎么联系我？",
  },
];

const FALLBACK_REPLY =
  "这个问题还没有写进我的资料里，所以我不想编答案。\n\n你可以换个问法，或者试试问：\n· 你现在在做什么？\n· 你有哪些作品？\n· 怎么联系你？";

/* ---------- DOM ---------- */

const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const sendButton = chatForm ? chatForm.querySelector(".send-btn") : null;
const suggestionButtons = Array.from(
  document.querySelectorAll("#chat-suggestions [data-question]")
);
const clearButton = document.getElementById("clear-chat");
const copyEmailButton = document.getElementById("copy-email");
const contactEmail = document.getElementById("contact-email");
const copyWechatButton = document.getElementById("copy-wechat");
const contactWechat = document.getElementById("contact-wechat");
const header = document.querySelector(".site-header");
const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const year = document.getElementById("year");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let isThinking = false;
let composing = false;

const CHAT_ENDPOINT = "/api/chat";
const MAX_HISTORY_MESSAGES = 10;
let conversation = [];
let activeRequestController = null;

/* ---------- Helpers ---------- */

function getReply(question) {
  const text = question.toLowerCase().replace(/\s+/g, " ").trim();

  if (!text) {
    return FALLBACK_REPLY;
  }

  for (const intent of INTENTS) {
    if (intent.patterns.some((pattern) => pattern.test(text))) {
      return intent.reply;
    }
  }

  return FALLBACK_REPLY;
}

async function requestReply(question, signal) {
  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [...conversation, { role: "user", content: question }].slice(
        -MAX_HISTORY_MESSAGES
      ),
    }),
    signal,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error((data && data.error) || `请求失败（${response.status}）`);
  }

  if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("模型没有返回内容");
  }

  return data.reply.trim();
}

function scrollToLatest() {
  if (!chatLog) return;
  chatLog.scrollTo({
    top: chatLog.scrollHeight,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}

function createMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message message-${role}`;

  if (role === "bot") {
    const avatar = document.createElement("span");
    avatar.className = "msg-avatar";
    avatar.setAttribute("aria-hidden", "true");

    const avatarImage = document.createElement("img");
    avatarImage.src = "photo.jpg";
    avatarImage.alt = "";
    avatarImage.width = 1024;
    avatarImage.height = 1366;
    avatar.appendChild(avatarImage);
    message.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  message.appendChild(bubble);

  return message;
}

function appendMessage(role, text) {
  if (!chatLog) return;
  chatLog.appendChild(createMessage(role, text));
  scrollToLatest();
}

function createTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "message message-bot typing";
  typing.setAttribute("aria-label", "数字分身正在输入");

  const avatar = document.createElement("span");
  avatar.className = "msg-avatar";
  avatar.setAttribute("aria-hidden", "true");

  const avatarImage = document.createElement("img");
  avatarImage.src = "photo.jpg";
  avatarImage.alt = "";
  avatarImage.width = 1024;
  avatarImage.height = 1366;
  avatar.appendChild(avatarImage);

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement("span");
    dot.className = "typing-dot";
    bubble.appendChild(dot);
  }

  typing.append(avatar, bubble);
  return typing;
}

function setThinking(state) {
  isThinking = state;
  if (sendButton) sendButton.disabled = state;
  suggestionButtons.forEach((button) => {
    button.disabled = state;
  });
}

function resizeInput() {
  if (!chatInput) return;
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 110)}px`;
}

function resetChat() {
  if (!chatLog) return;

  if (activeRequestController) {
    activeRequestController.abort();
    activeRequestController = null;
  }

  setThinking(false);
  conversation = [];
  chatLog.replaceChildren();
  appendMessage("bot", PROFILE.greeting);

  if (chatInput) {
    chatInput.value = "";
    resizeInput();
    chatInput.focus();
  }
}

async function ask(question) {
  const cleanQuestion = String(question || "").trim().slice(0, 200);
  if (!chatLog || !cleanQuestion || isThinking) return;

  appendMessage("user", cleanQuestion);

  if (chatInput) {
    chatInput.value = "";
    resizeInput();
  }

  setThinking(true);
  const typing = createTypingIndicator();
  chatLog.appendChild(typing);
  scrollToLatest();

  const controller = new AbortController();
  activeRequestController = controller;

  try {
    const reply = await requestReply(cleanQuestion, controller.signal);
    conversation.push(
      { role: "user", content: cleanQuestion },
      { role: "assistant", content: reply }
    );
    conversation = conversation.slice(-MAX_HISTORY_MESSAGES);

    typing.remove();
    appendMessage("bot", reply);
  } catch (error) {
    // 用户点了「清空」时静默退出，不把旧回答写回已清空的窗口
    if (error && error.name === "AbortError") return;

    // 详细原因写进控制台，页面上只给访客一句友好的提示
    console.warn("[数字分身] 调用失败：", error);
    typing.remove();
    appendMessage("bot", getReply(cleanQuestion));
    appendMessage("bot", "（AI 分身暂时不可用，以上是本地预设回答。）");
  } finally {
    if (activeRequestController === controller) activeRequestController = null;
    setThinking(false);
    if (chatInput && !reduceMotion) chatInput.focus();
  }
}

/* ---------- Chat events ---------- */

if (chatLog) {
  appendMessage("bot", PROFILE.greeting);
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(chatInput.value);
  });

  chatInput.addEventListener("input", resizeInput);

  chatInput.addEventListener("compositionstart", () => {
    composing = true;
  });

  chatInput.addEventListener("compositionend", () => {
    composing = false;
  });

  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !composing) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });
}

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ask(button.dataset.question);
  });
});

if (clearButton) {
  clearButton.addEventListener("click", resetChat);
}

/* ---------- Copy email ---------- */

function legacyCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  textarea.remove();
  return copied;
}

function markCopyButton(button, originalLabel, success) {
  if (!button) return;
  button.textContent = success ? "已复制" : "复制失败，请手动选择";

  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1800);
}

function setupCopyButton(button, target, originalLabel) {
  if (!button || !target) return;

  button.addEventListener("click", async () => {
    const text = target.textContent.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        markCopyButton(button, originalLabel, true);
        return;
      }

      markCopyButton(button, originalLabel, legacyCopy(text));
    } catch (error) {
      markCopyButton(button, originalLabel, legacyCopy(text));
    }
  });
}

setupCopyButton(copyEmailButton, contactEmail, "复制邮箱");
setupCopyButton(copyWechatButton, contactWechat, "复制微信号");

/* ---------- Mobile menu ---------- */

function closeMenu() {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "打开菜单");
  mobileNav.hidden = true;
}

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "打开菜单" : "关闭菜单");
    mobileNav.hidden = isOpen;
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      !menuToggle.contains(event.target) &&
      !mobileNav.contains(event.target)
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) closeMenu();
  });
}

/* ---------- Header shadow ---------- */

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

if (header) {
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

/* ---------- Current year ---------- */

if (year) {
  year.textContent = String(new Date().getFullYear());
}

/* ---------- Reveal on scroll ---------- */

const revealElements = Array.from(document.querySelectorAll(".reveal"));

if (revealElements.length && "IntersectionObserver" in window && !reduceMotion) {
  const groupCounters = new WeakMap();

  revealElements.forEach((element) => {
    element.classList.add("reveal-init");

    const parent = element.parentElement;
    const index = groupCounters.get(parent) || 0;
    element.style.transitionDelay = `${Math.min(index, 3) * 65}ms`;
    groupCounters.set(parent, index + 1);
  });

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
  );

  revealElements.forEach((element) => observer.observe(element));
}
