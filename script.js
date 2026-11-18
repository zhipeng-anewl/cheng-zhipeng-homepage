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
  phone: "15179367585",
  location: "浙江杭州",
  availability: "2027 届校招，一周内可到岗，每周 5 天，实习 6 个月及以上",
  greeting:
    "你好，我是程志鹏的数字分身。\n可以问我：做过哪些项目、技术栈、教育背景，或者怎么联系我。",
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
    reply: `目前可以通过这两种方式联系我：\n\n· 邮箱：${PROFILE.email}\n· 电话 / 微信：${PROFILE.wechat}\n\n我在${PROFILE.location}，2027 届校招，一周内可到岗。`,
  },
  {
    id: "tcm",
    patterns: [/中医药/, /知识图谱问答/, /tcmqa/i, /智能问答/],
    reply:
      "中医药知识图谱智能问答系统是我独立开发的项目。\n\n我在 3.2 万节点、48 万条边的图谱上搭 GraphRAG 问答，支持 Text2Cypher、向量与 BM25 的 RRF 混合检索、SSE 流式输出和引用校验。项目有公开的 GitHub 和在线访问地址，可以继续问我。",
  },
  {
    id: "medical",
    patterns: [/乳腺癌/, /化疗/, /医学数据/, /医院/, /临床/],
    reply:
      "中西医结合乳腺癌新辅助化疗数据化共享平台是我参与的全栈项目。\n\n平台覆盖临床病例、四诊录入、疗效评估和知识图谱问答；我参与构建了 976 节点、800 条关系的图谱，平台已部署到内网，浙江省人民医院和浙江省中医院已在使用。",
  },
  {
    id: "mimi",
    patterns: [/mimi/i, /配送/, /外卖/, /餐饮/, /校园.*订单/],
    reply:
      "Mimi 是校园宿舍区的餐饮配送平台，我负责全栈开发。\n\n核心流程包括商家审核、菜单库存、购物车下单和订单取消；我用幂等键、事务和状态机处理重复下单、库存锁定与取消释放。目前项目处于试运行阶段。",
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
      "我最近主要在做 AI 应用和全栈项目：Mimi 校园配送在试运行，医学数据平台已经在内网使用。\n\n同时也在准备 2027 届校招，方向是 AI 应用开发 / 全栈开发。",
  },
  {
    id: "projects",
    patterns: [
      /项目/,
      /作品/,
      /案例/,
      /做过什么/,
      /有什么成果/,
      /作品集/,
      /portfolio/i,
    ],
    reply:
      "我做过三个主要项目：\n\n· Mimi 校园宿舍区餐饮配送平台：全栈开发，试运行中\n· 中西医结合乳腺癌新辅助化疗数据化共享平台：内网已上线，医院已在使用\n· 中医药知识图谱智能问答系统：独立开发，有公开的 GitHub 和在线访问地址\n\n想了解哪一个，可以继续问我。",
  },
  {
    id: "education",
    patterns: [
      /教育/,
      /学历/,
      /学校/,
      /本科/,
      /硕士/,
      /gpa/i,
      /排名/,
      /浙江科技大学/,
      /山东财经/,
    ],
    reply:
      "我是浙江科技大学人工智能硕士在读，2024.09–2027.07（预计），GPA 3.4，专业排名 5/66。\n\n本科是山东财经大学人工智能专业，GPA 3.54，专业排名 6/31。",
  },
  {
    id: "research",
    patterns: [
      /科研/,
      /论文/,
      /专利/,
      /coling/i,
      /applied intelligence/i,
      /eswa/i,
      /flame/i,
      /发表/,
    ],
    reply:
      "我目前有三篇论文在投或大修：\n\n· FLAME：多模态知识图谱补全与大语言模型语义推理，第一作者，COLING 在投（CCF-B）\n· 中医药多模态知识图谱构建与 LLM 推理框架，第一作者，Applied Intelligence 在投；发明专利 1 项受理中\n· 电商视觉特效模板多模态推荐，第二作者（导师一作），ESWA 大修（中科院 1 区）\n\n都还在流程中，还没有到已发表状态。",
  },
  {
    id: "job",
    patterns: [
      /校招/,
      /求职/,
      /实习/,
      /到岗/,
      /招聘/,
      /岗位/,
      /工作机会/,
      /简历/,
      /面试/,
      /合作/,
    ],
    reply: `我是 2027 届校招，方向是 AI 应用开发 / 全栈开发。\n\n一周内可到岗，每周 5 天，实习 6 个月及以上。欢迎校招、实习或项目交流，可以发到邮箱 ${PROFILE.email}，或加微信 ${PROFILE.wechat}。`,
  },
  {
    id: "strengths",
    patterns: [
      /技术栈/,
      /技能/,
      /擅长/,
      /优势/,
      /强项/,
      /会什么/,
      /能做.*什么/,
      /能力/,
      /前后端/,
      /全栈/,
    ],
    reply:
      "我主要做 AI 应用和全栈开发：\n\n· AI 应用：RAG / GraphRAG、Prompt 设计、Text2Cypher、CLIP 多模态检索、LoRA 微调\n· 后端：Python、FastAPI / Flask、PostgreSQL、Neo4j\n· 前端：Next.js、TypeScript、Vue 3 / Vite、微信小程序\n\n做过完整项目，但还在积累阶段，不敢说专家。",
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
      "我是程志鹏，浙江科技大学人工智能硕士在读，2027 届校招。\n\n方向是 AI 应用开发 / 全栈开发，做过 RAG/GraphRAG 问答、医学数据平台和校园配送项目。",
  },
  {
    id: "location",
    patterns: [/在哪/, /城市/, /杭州/, /地址/, /所在地/],
    reply:
      "我在浙江杭州，2027 届校招，方向是 AI 应用开发 / 全栈开发。\n\n如果岗位在杭州或愿意远程沟通，可以直接联系我。",
  },
  {
    id: "interests",
    patterns: [/兴趣/, /爱好/, /喜欢.*什么/, /平时.*喜欢/],
    reply:
      "我目前主要精力在 AI 应用开发、全栈项目和 2027 届校招上。\n\n其他个人爱好还没有写进公开资料，不想乱说。",
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
      "做这个主页，一方面是想把教育背景、项目和技术栈放在一个稳定的地方，方便校招沟通；另一方面也想试试用数字分身回答一些重复问题。\n\n现在这一版接了大模型，回答基于页面上的公开资料；网络不通时会退回本地预设回答。",
  },
  {
    id: "ai",
    patterns: [/\bai\b/i, /人工智能/, /大模型/, /智能体/, /提示词/, /rag/i],
    reply:
      "AI 应用开发是我现在的主要方向。\n\n我做过 RAG/GraphRAG 问答、Text2Cypher、SSE 流式输出和 CLIP 多模态检索，也在做全栈项目，把模型能力接到真实的前后端流程里。",
  },
  {
    id: "thanks",
    patterns: [/谢谢/, /感谢/, /\bthx\b/i, /\bthanks\b/i],
    reply:
      "不客气。想继续聊的话，可以问我做过的项目、技术栈，或者直接看页面底部的联系方式。",
  },
  {
    id: "greeting",
    patterns: [/^(你好|您好|嗨|hi|hello|hey|在吗)[！!。.，,\s]*$/i],
    reply:
      "你好，我在。想先聊哪一面：项目经历、技术栈、教育背景，还是怎么联系我？",
  },
];

const FALLBACK_REPLY =
  "这个问题还没有写进我的资料里，所以我不想编答案。\n\n你可以换个问法，或者试试问：\n· 你做过哪些项目？\n· 你的技术栈是什么？\n· 你的教育背景？";

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
