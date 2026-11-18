import { useEffect, useMemo, useState } from "react";
import { Button, Card, Chip, Link } from "@heroui/react";
import Chat from "./components/Chat";
import { navItems, profile, projects, research } from "./data";

/* ---------- small icons ---------- */

const Arrow = ({ className = "size-4" }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h11M11 5l5 5-5 5" />
  </svg>
);

const External = ({ className = "size-3" }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h7v7M13 3 6.5 9.5M11 9.5V13H3V5h3.5" />
  </svg>
);

const MenuIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    {open ? (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ) : (
      <>
        <path d="M4 8h16M4 16h16" />
      </>
    )}
  </svg>
);

const icon = (path) => (
  <svg
    viewBox="0 0 24 24"
    className="size-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

/* ---------- shared layout ---------- */

function SectionHeading({ kicker, title, lead }) {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,.48fr)] md:items-end">
      <div>
        <p className="mb-4 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#1f66e5]">{kicker}</p>
        <h2 className="text-balance text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.15] tracking-[-0.045em] text-[#08182e]">
          {title}
        </h2>
      </div>
      <p className="max-w-[430px] border-l-2 border-[#1f66e5]/30 pl-5 text-sm leading-7 text-[#5d6f87] md:mb-1">
        {lead}
      </p>
    </div>
  );
}

function Tag({ children }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      className="h-6 rounded-full border border-[#e2ebf7] bg-[#f0f5fc] px-2.5 text-[10.5px] font-normal text-[#48617f]"
    >
      {children}
    </Chip>
  );
}

function Status({ children, warn = false }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={warn ? "warning" : "accent"}
      className="h-6 rounded-full px-2.5 text-[10px] font-medium"
    >
      <i className={`size-1.5 rounded-full ${warn ? "bg-amber-500" : "bg-[#1f66e5]"}`} />
      {children}
    </Chip>
  );
}

function scrollTo(hash) {
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- page ---------- */

export default function App() {
  const [activeId, setActiveId] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const sectionIds = useMemo(
    () => navItems.filter((item) => !item.cta).map((item) => item.href.slice(1)),
    []
  );

  useEffect(() => {
    function update() {
      setScrolled(window.scrollY > 8);
      let current = "";
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) {
            current = id;
            break;
          }
        }
      }
      setActiveId(current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [sectionIds]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [menuOpen]);

  async function copyText(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faff] text-[#0b1f3a]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-[#08182e] focus:px-4 focus:py-2 focus:text-white">
        跳到主要内容
      </a>

      <header className={`sticky top-0 z-50 border-b transition-all ${scrolled ? "border-[#dfe7f2] bg-[#f7faff]/95 shadow-[0_8px_30px_rgba(8,24,46,0.04)]" : "border-transparent bg-[#f7faff]/80"} backdrop-blur-xl`}>
        <div className="mx-auto flex min-h-[80px] w-full max-w-[1160px] items-center justify-between gap-6 px-5 sm:px-6">
          <a href="#top" className="flex shrink-0 items-center gap-3" aria-label="程志鹏的个人主页，回到顶部">
            <span className="grid size-10 place-items-center rounded-xl border border-[#7db1ff]/25 bg-[#08182e] font-mono text-[11px] tracking-[0.12em] text-[#dcebff] shadow-inner">
              CZP
            </span>
            <span className="flex flex-col leading-none">
              <strong className="text-[15px] tracking-[0.02em]">程志鹏</strong>
              <span className="mt-1 font-mono text-[8px] tracking-[0.2em] text-[#8394a9]">CHENG ZHI PENG</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#5d6f87] md:flex" aria-label="主导航">
            {navItems.map((item) =>
              item.cta ? (
                <Button
                  key={item.href}
                  size="sm"
                  className="h-10 rounded-full bg-[#08182e] px-5 text-[13px] text-white shadow-sm hover:bg-[#1f66e5]"
                  onPress={() => scrollTo(item.href)}
                >
                  {item.label}
                </Button>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 transition-colors hover:text-[#0b1f3a] ${
                    activeId === item.href.slice(1) ? "text-[#0b1f3a]" : ""
                  }`}
                  aria-current={activeId === item.href.slice(1) ? "location" : undefined}
                >
                  {item.label}
                  {activeId === item.href.slice(1) && (
                    <i className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-full rounded-full bg-[#1f66e5]" />
                  )}
                </a>
              )
            )}
          </nav>

          <Button
            isIconOnly
            variant="outline"
            size="sm"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="size-10 rounded-xl border-[#dfe7f2] text-[#0b1f3a] md:hidden"
            onPress={() => setMenuOpen((value) => !value)}
          >
            <MenuIcon open={menuOpen} />
          </Button>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" className="flex flex-col border-t border-[#dfe7f2] bg-[#f7faff] px-5 pb-5 pt-2 md:hidden" aria-label="移动端导航">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-[#e8eef7] py-3 text-[15px] ${
                  item.cta ? "font-semibold text-[#1f66e5]" : "text-[#0b1f3a]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="main">
        {/* Hero */}
        <section id="top" className="relative mx-auto grid w-full max-w-[1160px] items-center gap-14 px-5 pb-16 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_.78fr] lg:gap-16 lg:pb-28">
          <div className="hero-fade max-w-[660px]">
            <p className="mb-6 flex items-center gap-2.5 font-mono text-[10.5px] font-semibold tracking-[0.15em] text-[#1f66e5]">
              <i className="size-2 rounded-full bg-[#1f66e5] shadow-[0_0_0_4px_rgba(31,102,229,.11)]" />
              AI APPLICATION <span className="font-normal text-[#a9bcd4]">/</span> FULL-STACK DEVELOPER
            </p>

            <h1 className="flex flex-col text-[#08182e] leading-[.95]">
              <span className="mb-3 text-[clamp(16px,1.8vw,20px)] font-medium tracking-[0.02em] text-[#5d6f87]">你好，我是</span>
              <span className="text-[clamp(4.5rem,10.7vw,8.25rem)] font-extrabold tracking-[-0.07em]">
                程志鹏<span className="text-[#1f66e5]">。</span>
              </span>
            </h1>

            <p className="mb-3 mt-4 text-[clamp(1.25rem,2.1vw,1.55rem)] font-semibold leading-relaxed tracking-[-0.025em] text-[#0b1f3a]">
              {profile.tagline}
            </p>
            <p className="mb-4 text-[12.5px] font-medium leading-relaxed text-[#1558cc]">
              {profile.education}
            </p>
            <p className="max-w-[540px] text-[15px] leading-[1.85] text-[#5d6f87] sm:text-[15.5px]">
              {profile.intro}
            </p>

            <div className="my-8 flex flex-wrap items-center gap-3">
              <Button
                className="h-12 rounded-full bg-[#1f66e5] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-[#1558cc]"
                onPress={() => scrollTo("#projects")}
              >
                看项目 <Arrow />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-[#dfe7f2] bg-white/60 px-6 text-sm font-semibold text-[#0b1f3a] hover:bg-white"
                onPress={() => scrollTo("#contact")}
              >
                联系我
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-[#dfe7f2] pt-5 text-[13px]">
              <div>
                <p className="mb-1 font-mono text-[9px] tracking-[0.16em] text-[#8394a9]">身份</p>
                <p className="font-medium">AI 应用开发 / 全栈开发</p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[9px] tracking-[0.16em] text-[#8394a9]">关注</p>
                <p className="font-medium">RAG / GraphRAG · 多模态</p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[9px] tracking-[0.16em] text-[#8394a9]">状态</p>
                <p className="flex items-center gap-1.5 font-medium">
                  <i className="size-1.5 rounded-full bg-emerald-500" />2027 届校招 · 可实习
                </p>
              </div>
            </div>
          </div>

          <div className="hero-fade-delay relative mx-auto w-full max-w-[440px]">
            <div className="tech-grid pointer-events-none absolute inset-x-6 -bottom-5 -top-5 rounded-[2.5rem] border border-[#1f66e5]/10" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/60 bg-[#0d2444] shadow-[0_34px_80px_rgba(8,24,46,.24)]">
              <img src="/photo.jpg" alt="程志鹏的头像" className="size-full object-cover object-[center_18%] saturate-[.88]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,24,46,.18)_0%,transparent_24%,transparent_57%,rgba(8,24,46,.76)_100%),linear-gradient(90deg,rgba(31,102,229,.08),transparent_48%)]" />
              <div className="absolute inset-x-5 top-4 flex justify-between font-mono text-[8.5px] tracking-[0.16em] text-white/80">
                <span>CHENG ZHI PENG</span>
                <span>HANGZHOU / 2027</span>
              </div>
              <p className="absolute inset-x-5 bottom-5 text-[11px] tracking-[0.12em] text-white/80">
                AI 应用 · 全栈开发 · 知识图谱
              </p>
            </div>

            <Card className="absolute -bottom-5 left-0 flex flex-row items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3 shadow-[0_14px_38px_rgba(8,24,46,.14)] backdrop-blur-xl sm:-left-8">
              <span className="grid size-9 place-items-center rounded-xl border border-[#d9e7fd] bg-[#eaf2ff] text-[#1f66e5]">
                {icon("M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1")}
                <span className="absolute size-1.5 rounded-full bg-[#1f66e5]" />
              </span>
              <span>
                <span className="block font-mono text-[8px] tracking-[0.14em] text-[#8394a9]">NOW</span>
                <strong className="block text-[12.5px] font-semibold text-[#0b1f3a]">Mimi 校园配送 · 试运行</strong>
              </span>
            </Card>

            <Card className="absolute -right-2 top-16 flex flex-row items-center gap-2 rounded-2xl border border-white/90 bg-white/95 px-3 py-2.5 shadow-[0_14px_38px_rgba(8,24,46,.14)] backdrop-blur-xl sm:-right-6">
              <i className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.13)]" />
              <span>
                <span className="block font-mono text-[8px] tracking-[0.14em] text-[#8394a9]">DIGITAL TWIN</span>
                <strong className="block text-[12px] font-semibold text-[#0b1f3a]">数字分身可试用</strong>
              </span>
            </Card>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto w-full max-w-[1160px] px-5 py-14 sm:px-6 sm:py-16 lg:py-24">
          <SectionHeading
            kicker="01 / ABOUT"
            title={<>先把我讲清楚，<br />再聊别的。</>}
            lead="人工智能硕士在读，2027 届校招。比起只做 Demo，我更在意能不能把一条完整链路跑通。"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                index: "01",
                label: "身份",
                title: "AI 应用开发 / 全栈开发",
                body: "人工智能硕士在读，2027 届校招；从模型调用、后端接口到前端交互，都愿意自己动手。",
                tags: ["2027 届校招", "可实习"],
                icon: "M4 3.5h16v17H4zM8 8h8M8 12h8M8 16h5",
              },
              {
                index: "02",
                label: "教育",
                title: "浙江科技大学 · 人工智能硕士",
                body: "2024.09–2027.07（预计）· GPA 3.4 · 专业排名 5/66\n本科：山东财经大学 · 人工智能 · GPA 3.54 / 排名 6/31",
                icon: "m12 3 9 5-9 5-9-5 9-5Zm-9 9.5 9 5 9-5M3 17l9 5 9-5",
              },
              {
                index: "03",
                label: "技术栈",
                title: "RAG / GraphRAG · 全栈工程",
                body: "做过 Text2Cypher、混合检索和 SSE 流式问答；也做 Next.js / Vue 3 前端与 FastAPI / Flask 后端。",
                tags: ["RAG / GraphRAG", "Python", "Next.js", "Vue 3"],
                icon: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM3.5 12h17M12 3.5c2.3 2.4 3.5 5.3 3.5 8.5S14.3 18.1 12 20.5C9.7 18.1 8.5 15.2 8.5 12S9.7 5.9 12 3.5Z",
              },
              {
                index: "04",
                label: "现在",
                title: "做项目，准备校招",
                body: "Mimi 校园配送在试运行；医学数据平台已在内网投入使用。2027 届校招，一周内可到岗。",
                tags: ["一周内到岗", "实习 6 个月+"],
                icon: "M20.5 3.5c-7 .4-11.3 3.4-13 9.2M4 21c.7-6.5 4.2-10.1 10.8-11.1M14.5 4c1.7 1.2 3.2 2.7 4.4 4.4",
              },
            ].map((card) => (
              <Card key={card.index} className="group flex min-h-[240px] flex-col rounded-2xl border border-[#dfe7f2] bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#cbd9ed] hover:bg-white hover:shadow-[0_18px_50px_rgba(8,24,46,.08)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9.5px] tracking-[0.12em] text-[#a6b4c6]">{card.index}</span>
                  <span className="grid size-9 place-items-center rounded-xl border border-[#dbe8fc] bg-[#eef5ff] text-[#1f66e5]">
                    {icon(card.icon)}
                  </span>
                </div>
                <p className="mb-2 mt-7 font-mono text-[9px] tracking-[0.16em] text-[#8394a9]">{card.label}</p>
                <h3 className="mb-2.5 text-[18.5px] font-semibold leading-snug tracking-[-0.02em] text-[#0b1f3a]">{card.title}</h3>
                <p className="whitespace-pre-line text-[13.5px] leading-7 text-[#5d6f87]">{card.body}</p>
                {card.tags && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {card.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Card className="relative mt-4 grid overflow-hidden rounded-[1.6rem] border-0 bg-[#08182e] p-6 text-white shadow-[0_28px_70px_rgba(8,24,46,.16)] md:grid-cols-[1.6fr_.4fr] md:gap-12 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_360px_at_86%_-8%,rgba(31,102,229,.42),transparent_68%),radial-gradient(420px_300px_at_4%_110%,rgba(76,164,255,.15),transparent_70%)]" />
            <div className="tech-grid-dark pointer-events-none absolute inset-0" />
            <div className="relative z-10">
              <span className="block h-8 font-serif text-6xl leading-[.7] text-[#7db1ff]/80">“</span>
              <p className="mb-5 mt-2 text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.14] tracking-[-0.05em]">
                不只停在 Demo，<br /><span className="text-[#7db1ff]">把它跑通。</span>
              </p>
              <p className="max-w-[540px] text-sm leading-7 text-white/60">
                从模型调用、后端接口到前端交互，我习惯把一条链路自己走完；遇到问题就拆开，直到能稳定复现。
              </p>
            </div>
            <div className="relative z-10 hidden flex-col justify-end border-l border-white/15 pl-8 md:flex">
              <span className="font-mono text-[9px] tracking-[0.16em] text-white/40">我的工作方式</span>
              <ol className="mt-4">
                {["先跑通", "再拆解", "做成产品"].map((step, index) => (
                  <li key={step} className="flex items-center gap-3 border-b border-white/10 py-3 text-sm text-white/90 last:border-0">
                    <span className="font-mono text-[9px] text-[#7db1ff]">0{index + 1}</span>{step}
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </section>

        {/* Projects */}
        <section id="projects" className="mx-auto w-full max-w-[1160px] px-5 py-14 sm:px-6 sm:py-16 lg:py-24">
          <SectionHeading
            kicker="02 / PROJECTS"
            title={<>项目不在多，<br />在于能跑通。</>}
            lead="从校园配送到临床数据平台，再到中医药知识图谱问答；每个项目都尽量覆盖数据、后端、前端和部署。"
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={`group flex flex-col rounded-2xl border border-[#dfe7f2] bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#cbd9ed] hover:bg-white hover:shadow-[0_18px_50px_rgba(8,24,46,.08)] ${
                  project.featured ? "lg:col-span-2 lg:p-8" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[9.5px] tracking-[0.12em] text-[#a6b4c6]">{project.index}</span>
                  <Status>{project.status}</Status>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 font-mono text-[9.5px] tracking-[0.05em] text-[#8394a9]">
                  <span>{project.period}</span>
                  <span>{project.role}</span>
                </div>
                <h3 className={`mt-4 font-semibold tracking-[-0.02em] text-[#0b1f3a] ${project.featured ? "max-w-[900px] text-[clamp(1.4rem,3vw,1.9rem)] leading-tight" : "text-[20px] leading-snug"}`}>
                  {project.title}
                </h3>
                <p className={`mt-3 max-w-[900px] text-[13.5px] leading-7 text-[#5d6f87] ${project.featured ? "text-sm" : ""}`}>
                  {project.description}
                </p>
                {project.metrics && (
                  <div className="mt-5 flex flex-wrap gap-8">
                    {project.metrics.map((metric) => (
                      <div key={metric.label}>
                        <strong className="block text-[25px] font-bold leading-none tracking-[-0.04em] text-[#08182e]">{metric.value}</strong>
                        <span className="mt-1 block text-[10.5px] text-[#8394a9]">{metric.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                  </div>
                  {project.links && (
                    <div className="flex gap-2">
                      {project.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-[#dce8fc] bg-[#eff5ff] px-2.5 py-1.5 text-[10.5px] font-medium text-[#1f66e5] no-underline hover:bg-[#1f66e5] hover:text-white"
                        >
                          {link.label} <External />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Research */}
        <section id="research" className="mx-auto w-full max-w-[1160px] px-5 py-14 sm:px-6 sm:py-16 lg:py-24">
          <SectionHeading
            kicker="03 / RESEARCH"
            title={<>科研与论文，<br />是另一条训练链路。</>}
            lead="三篇论文在投或大修，一项发明专利受理中；方向集中在多模态知识图谱、知识补全与推荐。"
          />

          <div className="flex flex-col gap-3">
            {research.map((item) => (
              <Card key={item.index} className="grid gap-4 rounded-2xl border border-[#dfe7f2] bg-white/80 p-6 shadow-sm transition hover:border-[#cbd9ed] hover:bg-white md:grid-cols-[42px_minmax(0,1fr)_250px] md:items-start md:gap-5">
                <span className="hidden pt-1 font-mono text-[9.5px] tracking-[0.12em] text-[#a6b4c6] md:block">{item.index}</span>
                <div>
                  <h3 className="mb-1.5 text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[#0b1f3a]">{item.title}</h3>
                  <p className="text-[13.5px] leading-7 text-[#5d6f87]">{item.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end md:text-right">
                  <Status warn={item.warn}>{item.status}</Status>
                  <span className="text-[11px] leading-5 text-[#8394a9]">{item.meta}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Chat */}
        <section id="chat" className="border-y border-[#d9e6f8] bg-[radial-gradient(720px_480px_at_90%_10%,rgba(31,102,229,.12),transparent_68%),linear-gradient(180deg,#f0f6ff_0%,#eaf2ff_100%)] py-14 sm:py-16 lg:py-24">
          <div className="mx-auto grid w-full max-w-[1160px] gap-10 px-5 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
            <div className="pt-1">
              <p className="mb-4 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#1f66e5]">04 / DIGITAL TWIN</p>
              <h2 className="text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.13] tracking-[-0.045em] text-[#08182e]">
                和我的<br />数字分身聊聊
              </h2>
              <p className="mt-5 max-w-[430px] text-sm leading-7 text-[#52657e]">
                它了解这一页上的公开信息，可以回答关于我的教育背景、项目经历、技术栈、科研和联系方式。回答有边界——不知道的，它会直接说不知道。
              </p>

              <Card className="mt-7 max-w-[430px] gap-3 rounded-2xl border border-white/90 bg-white/65 p-5 shadow-sm backdrop-blur">
                <span className="font-mono text-[9px] tracking-[0.16em] text-[#8394a9]">它知道</span>
                <ul className="flex flex-col gap-2.5 text-[13px] text-[#40536c]">
                  {["我是谁、教育背景和求职状态", "项目、技术栈和科研经历", "怎么联系我"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5"><span className="text-[#1f66e5]">↗</span>{item}</li>
                  ))}
                </ul>
              </Card>
              <p className="mt-5 flex items-center gap-2 font-mono text-[9.5px] text-[#70839a]">
                <i className="size-1.5 rounded-full bg-emerald-500" />AI 驱动 · 基于公开信息 · 不保存对话
              </p>
            </div>

            <Chat />
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto w-full max-w-[1160px] px-5 py-14 sm:px-6 sm:py-16 lg:py-24">
          <Card className="relative grid overflow-hidden rounded-[1.9rem] border-0 bg-[#08182e] p-7 text-white shadow-[0_30px_80px_rgba(8,24,46,.18)] md:grid-cols-[1.14fr_.86fr] md:items-center md:gap-14 md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_400px_at_86%_2%,rgba(31,102,229,.36),transparent_64%),radial-gradient(440px_340px_at_4%_108%,rgba(76,164,255,.13),transparent_70%)]" />
            <div className="tech-grid-dark pointer-events-none absolute inset-0" />
            <div className="relative z-10">
              <p className="mb-4 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#8bb8ff]">05 / CONTACT</p>
              <h2 className="mb-4 text-balance text-[clamp(1.65rem,3.6vw,2.7rem)] font-bold leading-[1.15] tracking-[-0.045em]">
                2027 届校招，<br />找 AI 应用 / 全栈机会。
              </h2>
              <p className="max-w-[480px] text-sm leading-7 text-white/60">
                我是 2027 届校招，方向是 AI 应用开发 / 全栈开发；一周内可到岗，每周 5 天，实习 6 个月及以上。欢迎校招、实习或项目交流。
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["浙江杭州", "2027 届校招", "一周内到岗", "实习 6 个月+"].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[10.5px] text-[#cfe2ff]">{item}</span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur md:mt-0">
              <p className="font-mono text-[8.5px] tracking-[0.18em] text-[#8bb8ff]">EMAIL</p>
              <a href={`mailto:${profile.email}`} className="mt-1.5 block break-all text-[clamp(1.15rem,2.2vw,1.55rem)] font-semibold tracking-[-0.025em] text-white hover:text-[#7db1ff]">
                {profile.email}
              </a>
              <div className="my-4 border-t border-white/10" />
              <p className="font-mono text-[8.5px] tracking-[0.18em] text-[#8bb8ff]">WECHAT / TEL</p>
              <p className="mt-1.5 text-[clamp(1.1rem,2vw,1.35rem)] font-semibold tracking-[0.02em] text-white">{profile.phone}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button size="sm" className="rounded-full bg-white px-4 text-xs font-semibold text-[#08182e] hover:bg-[#eaf2ff]" onPress={() => copyText(profile.email, "email")}>
                  {copied === "email" ? "已复制" : "复制邮箱"}
                </Button>
                <Button size="sm" variant="outline" className="rounded-full border-white/20 bg-white/[0.08] px-4 text-xs text-[#dcebff] hover:bg-white/15" onPress={() => copyText(profile.phone, "phone")}>
                  {copied === "phone" ? "已复制" : "复制电话/微信"}
                </Button>
                <button type="button" onClick={() => scrollTo("#chat")} className="inline-flex items-center gap-1 px-1 py-2 text-xs text-[#cfe2ff] hover:text-white">
                  让数字分身介绍我 <External />
                </button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-[#dfe7f2] py-7">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col items-start justify-between gap-2 px-5 text-[11px] text-[#8394a9] sm:flex-row sm:items-center sm:px-6">
          <p>© {new Date().getFullYear()} 程志鹏 <span className="mx-1 text-[#c2cedd]">·</span> AI 应用开发 / 全栈开发</p>
          <a href="#top" className="inline-flex items-center gap-1.5 text-[#5d6f87] hover:text-[#1f66e5]">回到顶部 <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </div>
  );
}
