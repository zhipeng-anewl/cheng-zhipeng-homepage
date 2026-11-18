export const profile = {
  name: "程志鹏",
  role: "AI 应用开发 / 全栈开发",
  tagline: "AI 应用开发 / 全栈开发，2027 届校招",
  education: "浙江科技大学 · 人工智能硕士 · GPA 3.4 · 专业排名 5/66",
  intro:
    "人工智能硕士在读，做过 RAG/GraphRAG 问答、医学数据平台和校园配送系统。习惯把 AI 能力从模型调用一路做到前端交互，尽量把一条链路自己跑通。",
  location: "浙江杭州",
  email: "2362952677@qq.com",
  phone: "15179367585",
  availability: "2027 届校招，一周内可到岗，每周 5 天，实习 6 个月及以上",
  greeting:
    "你好，我是程志鹏的数字分身。\n可以问我：做过哪些项目、技术栈、教育背景，或者怎么联系我。",
};

export const navItems = [
  { label: "关于我", href: "#about" },
  { label: "项目", href: "#projects" },
  { label: "科研", href: "#research" },
  { label: "数字分身", href: "#chat" },
  { label: "联系", href: "#contact", cta: true },
];

export const projects = [
  {
    id: "tcmqa",
    featured: true,
    index: "01 / FEATURED",
    status: "已上线",
    period: "2026.04 – 2026.06",
    role: "独立开发",
    title: "中医药知识图谱智能问答系统",
    description:
      "在 3.2 万节点、48 万条边的中医药图谱上搭 GraphRAG 问答；规划器完成改写、意图路由和实体抽取，支持 Text2Cypher、混合检索与 SSE 流式输出。",
    metrics: [
      { value: "3.2万", label: "图谱节点" },
      { value: "48万", label: "图谱边" },
      { value: "4层", label: "Cypher 只读守卫" },
    ],
    tags: ["RAG / GraphRAG", "FastAPI", "Vue 3", "SSE"],
    links: [
      { label: "GitHub", href: "https://github.com/zhipeng-anewl/tcmqa" },
      { label: "在线访问", href: "https://tcmqa.zaynepeng.cn" },
    ],
  },
  {
    id: "mimi",
    index: "02",
    status: "试运行",
    period: "2026.09 – 至今",
    role: "全栈开发",
    title: "Mimi 校园宿舍区餐饮配送平台",
    description:
      "打通商家审核、菜单库存、购物车下单和订单取消的核心流程；用幂等键、事务和状态机处理重复下单、库存锁定与取消释放。",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  {
    id: "medical",
    index: "03",
    status: "内网已上线",
    period: "2025.11 – 至今",
    role: "全栈开发",
    title: "中西医结合乳腺癌新辅助化疗数据化共享平台",
    description:
      "面向临床病例、四诊录入、疗效评估和知识图谱问答；参与构建 976 节点、800 条关系的图谱，平台已在浙江省人民医院、浙江省中医院投入使用。",
    tags: ["Vue 3", "Flask", "Neo4j", "XGBoost"],
  },
];

export const research = [
  {
    index: "01",
    title: "FLAME：多模态知识图谱补全与大语言模型语义推理",
    description: "设计前缀适配器与细粒度语义推理模块，用于多模态知识图谱补全。",
    status: "在投",
    meta: "第一作者 · COLING（CCF-B）",
  },
  {
    index: "02",
    title: "中医药多模态知识图谱构建与 LLM 推理框架",
    description:
      "围绕中医药多模态图谱构建、知识补全与机制导向推理开展研究；发明专利 1 项，受理中。",
    status: "在投",
    meta: "第一作者 · Applied Intelligence",
  },
  {
    index: "03",
    title: "电商视觉特效模板多模态推荐",
    description: "设计多模态混合专家表示网络，用于视觉特效模板推荐。",
    status: "大修",
    warn: true,
    meta: "第二作者（导师一作）· ESWA（中科院 1 区）",
  },
];

export const quickQuestions = [
  "你做过哪些项目？",
  "你的技术栈是什么？",
  "怎么联系你？",
];

export const localReplies = [
  {
    keywords: ["项目", "作品", "做过什么", "mimi", "配送", "中医药", "乳腺癌"],
    reply:
      "我做过三个主要项目：Mimi 校园宿舍区餐饮配送平台、中西医结合乳腺癌新辅助化疗数据化共享平台，以及中医药知识图谱智能问答系统。中医药问答项目有公开的 GitHub 和在线访问地址。",
  },
  {
    keywords: ["技术栈", "技能", "擅长", "全栈", "会什么"],
    reply:
      "我主要做 AI 应用和全栈开发：RAG / GraphRAG、Text2Cypher、SSE 流式输出，后端用 Python / FastAPI / Flask，前端用 Next.js / Vue 3，数据层做过 PostgreSQL 和 Neo4j。",
  },
  {
    keywords: ["教育", "学校", "学历", "gpa", "硕士", "本科"],
    reply:
      "我是浙江科技大学人工智能硕士在读，预计 2027 年毕业，GPA 3.4、专业排名 5/66；本科是山东财经大学人工智能专业，GPA 3.54、专业排名 6/31。",
  },
  {
    keywords: ["联系", "邮箱", "微信", "电话"],
    reply: `可以通过邮箱 ${profile.email} 或电话/微信 ${profile.phone} 联系我。我在${profile.location}，2027 届校招，一周内可到岗。`,
  },
  {
    keywords: ["科研", "论文", "专利", "coling", "eswa"],
    reply:
      "目前有三篇论文在投或大修，分别关于多模态知识图谱补全、中医药多模态图谱构建与推理、多模态推荐；另有一项发明专利受理中。",
  },
];

export const fallbackReply =
  "这个问题还没有写进我的资料里，所以我不想编答案。\n\n你可以换个问法，或者试试问：\n· 你做过哪些项目？\n· 你的技术栈是什么？\n· 怎么联系你？";

export function getLocalReply(question) {
  const text = question.toLowerCase();
  const found = localReplies.find((item) =>
    item.keywords.some((keyword) => text.includes(keyword))
  );
  return found ? found.reply : fallbackReply;
}
