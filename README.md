# 程志鹏 · 个人主页

一个单页个人主页，包含头像、自我介绍、教育背景、项目经历、科研经历和联系方式，以及一个由 DeepSeek 驱动的数字分身聊天区。

前端使用 **React 19 + Vite + Tailwind CSS 4 + HeroUI v3**，后端是一个零依赖 Node 服务，负责托管构建产物并把聊天请求转发给 DeepSeek；EdgeOne Pages 版本使用 `functions/api/chat.js`。

## 本地启动

```bash
npm install
npm run build
npm start
```

打开：`http://127.0.0.1:8787/`

`npm start` 会先构建再启动本地服务。聊天需要在 `.env` 里配置 `DEEPSEEK_API_KEY`。

### 开发模式

需要两个终端：

```bash
# 终端 1：本地 API 服务，端口 8787
npm run dev:api

# 终端 2：Vite 开发服务器，端口 5173
npm run dev
```

打开 `http://127.0.0.1:5173/`。Vite 会把 `/api` 代理到 `http://127.0.0.1:8787`。

如果只改样式或文案，Vite 开发模式有热更新；改完后用 `npm run build` 生成 `dist`。

## 环境变量

在项目根目录新建 `.env`：

```text
DEEPSEEK_API_KEY=sk-你的key
```

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DEEPSEEK_API_KEY` | 空 | 必填。只存在于服务端，不会发送到浏览器 |
| `DEEPSEEK_MODEL` | `deepseek-chat` | 模型名称 |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | 接口地址 |
| `PORT` | `8787` | 本地服务端口 |
| `HOST` | `127.0.0.1` | 监听地址；手机预览时改成 `0.0.0.0` |

`.env` 已被 Git 忽略，不会提交。修改后需要重启服务。

## 文件结构

```text
index.html               Vite 入口
src/
  App.jsx                页面布局与各区块
  components/Chat.jsx    数字分身聊天组件
  data.js                项目、科研、联系方式等前端数据
  index.css              Tailwind + HeroUI 样式入口
public/
  photo.jpg              头像
  favicon.svg            站点图标
functions/api/chat.js    EdgeOne Pages Function
knowledge.js             数字分身资料库与回答规则
server.js                本地 Node 服务
vite.config.mjs          Vite + Tailwind 配置
```

## 页面结构

- Hero：姓名、方向、教育信息、看项目 / 联系我
- About：身份、教育、技术栈、当前状态
- Projects：一个主项目 + 两个次级项目，使用 HeroUI Card / Chip
- Research：论文与专利状态
- Digital Twin：HeroUI Card + TextArea + Button 聊天区
- Contact：邮箱、电话/微信、复制按钮

主要组件来自 `@heroui/react`，样式由 Tailwind CSS 4 和 `@heroui/styles` 提供。

## 数字分身的工作方式

1. 前端把用户问题和最近几轮对话 POST 到 `/api/chat`
2. `server.js` 或 `functions/api/chat.js` 在服务端注入 `knowledge.js` 里的资料和回答边界，再请求 DeepSeek
3. 模型返回回答，前端显示

安全约束：

- API Key 只存在 `.env` 或 EdgeOne 环境变量里，不会出现在网页源码中
- `.env` 已被 Git 忽略
- 每个客户端 IP 每分钟最多 10 次请求，超过返回 `429` 和 `Retry-After`
- 单条用户消息最多 500 字符，请求体最多 16KB，最多保留 10 条历史消息
- 输入会过滤明显的提示注入、角色伪装和少量有害内容
- 输出会脱敏手机号、身份证号、邮箱、银行卡号和 API Key；本人公开的邮箱/电话保留
- 输出命中提示词泄露或有害内容时，返回统一的安全回复
- 服务端记录结构化审计日志：请求 ID、IP 哈希、输入/输出（已脱敏）、耗时、状态和过滤标记
- 本地审计日志写入 `logs/ai-audit.log`；EdgeOne 版本写入平台日志

> 当前是规则型基础过滤，不是完整内容审核系统。正式对外服务建议叠加 EdgeOne WAF、KV 全局限流和专业内容安全服务。

如果 API 不可用，前端会退回 `src/data.js` 里的本地预设回答，并在控制台输出具体原因。

## 部署到 EdgeOne Pages

1. 打开 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/makers)，选择「导入 Git 仓库」
2. 仓库选择 `zhipeng-anewl/cheng-zhipeng-homepage`，分支 `main`
3. 构建配置：
   - 根目录：`./`
   - 安装命令：`npm install`
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - Node.js：`22`
4. 环境变量添加 `DEEPSEEK_API_KEY`，值填 DeepSeek 控制台生成的 Key
5. 部署完成后在项目概览里获取预览链接

仓库已包含 `functions/api/chat.js`，EdgeOne Pages 会自动识别为 `/api/chat` 函数。

> 默认的 `edgeone.cool` 预览链接通常只有 3 小时有效；长期分享需要绑定自己的域名。

## 修改指南

1. **页面文案/项目/科研**：改 `src/data.js` 和 `src/App.jsx`
2. **数字分身知识**：改 `knowledge.js` 的 `KNOWLEDGE` 字符串；同时同步 `functions/api/chat.js` 里的提示词
3. **回答语气/边界**：改 `knowledge.js` 的 `SYSTEM_PROMPT`，并同步 EdgeOne 函数
4. **联系方式**：同步修改 `src/data.js` 的 `profile` 和 `knowledge.js` 的 `PROFILE`
5. **视觉样式**：优先用 HeroUI 组件 + Tailwind 类；复杂背景放在 `src/index.css`

## 注意事项

- 不要把 `.env` 发给任何人，也不要粘贴到聊天、截图或公开仓库里
- 如果 Key 意外泄露，去 DeepSeek 控制台删除旧 Key 并重新生成
- `dist/`、`node_modules/` 和本地日志都已加入 `.gitignore`
