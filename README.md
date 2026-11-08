# 程志鹏 · 个人主页

一个单页个人主页，包含头像、自我介绍、作品方向和联系方式，以及一个由 DeepSeek 驱动的数字分身聊天区。

项目分为两部分：

- **前端**：`index.html` + `styles.css` + `script.js`，纯静态，没有构建步骤
- **后端**：`server.js`，零依赖 Node 服务，负责托管静态文件并把聊天请求转发给 DeepSeek

## 启动方式

> 聊天功能依赖后端。直接双击 `index.html` 只能看页面，数字分身会退回本地预设回答。

1. 在项目根目录的 `.env` 里填入 API Key（等号后直接粘贴，不要加引号）：

   ```
   DEEPSEEK_API_KEY=sk-你的key
   ```

2. 启动服务（不需要 `npm install`，本项目没有第三方依赖）：

   ```bash
   node server.js
   ```

   或者：

   ```bash
   npm start
   ```

   开发时想改代码自动重启，可以用 `npm run dev`。

3. 浏览器打开：`http://127.0.0.1:8787/`

### 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DEEPSEEK_API_KEY` | 空 | 必填。只存在于服务端，不会发送到浏览器 |
| `DEEPSEEK_MODEL` | `deepseek-chat` | 模型名称 |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | 接口地址 |
| `PORT` | `8787` | 服务端口 |
| `HOST` | `127.0.0.1` | 监听地址；手机预览时改成 `0.0.0.0` |

改完 `.env` 需要重启服务才会生效。

### 手机预览

1. 把 `.env` 里的 `HOST` 改成 `0.0.0.0`，重启服务
2. 在电脑上运行 `ipconfig`，找到 WLAN 的 IPv4 地址，例如 `10.182.15.102`
3. 手机和电脑连同一个 Wi-Fi，用手机浏览器打开 `http://10.182.15.102:8787/`
4. 如果打不开，检查 Windows 防火墙是否允许 Node 或 8787 端口通过专用网络

微信内置浏览器可能限制局域网地址，优先用手机自带的 Safari / Chrome。

## 文件说明

- `index.html`：页面结构与全部文案
- `styles.css`：视觉样式与手机适配
- `script.js`：聊天交互、导航和动效
- `knowledge.js`：**数字分身的资料库和回答规则**，改这里就能更新分身知道的内容
- `server.js`：本地后端，托管页面 + `/api/chat` 转发 DeepSeek
- `.env`：本地密钥（已被 Git 忽略，不会提交）
- `.env.example`：环境变量模板
- `photo.jpg`：头像
- `favicon.svg`：浏览器标签页小图标

## 数字分身的工作方式

1. 前端把用户问题和最近几轮对话 POST 到 `/api/chat`
2. `server.js` 在服务端注入 `knowledge.js` 里的资料和回答边界，再请求 DeepSeek
3. 模型返回回答，前端显示

安全约束：

- API Key 只存在 `.env`，不会出现在网页源码里
- `.env` 已在 `.gitignore` 中，不会被存档或提交
- 后端有基础限流（每个 IP 每分钟 20 次）和输入长度限制
- 页面不保存聊天记录，刷新即清空

如果 API 不可用（网络问题、Key 未配置等），前端会退回 `script.js` 里的本地预设回答，并在控制台输出具体原因。

## 部署到 EdgeOne Pages

[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/makers/new?repository-url=https%3A%2F%2Fgithub.com%2Fzhipeng-anewl%2Fcheng-zhipeng-homepage&project-name=cheng-zhipeng-homepage&env=DEEPSEEK_API_KEY)

仓库已包含 `functions/api/chat.js`，EdgeOne Pages 会自动把它识别为 `/api/chat` 函数。

首次部署时：

1. 点击上方按钮，登录腾讯云并授权 EdgeOne 访问 GitHub
2. 仓库选择 `zhipeng-anewl/cheng-zhipeng-homepage`
3. 构建配置保持默认；项目根目录为 `./`，构建命令 `npm run build` 会生成 `dist`
4. 环境变量填入 `DEEPSEEK_API_KEY`（只在 EdgeOne 控制台填写，不要写进仓库）
5. 完成首次部署后，在「项目概览」或「构建部署」里获取预览链接

如果暂时不配置 `DEEPSEEK_API_KEY`，静态页面仍可正常访问，数字分身会自动退回本地预设回答。

## 修改指南

1. **页面文案**：直接改 `index.html`
2. **数字分身知识**：改 `knowledge.js` 的 `KNOWLEDGE` 字符串
3. **分身回答语气/边界**：改 `knowledge.js` 的 `SYSTEM_PROMPT`
4. **联系方式**：同步修改 `index.html` 的 `#contact`、`script.js` 的 `PROFILE`、`knowledge.js` 的 `PROFILE`
5. **作品方向**：有具体案例后，把 `#directions` 中的卡片替换成真实作品链接

## 注意事项

- 不要把 `.env` 发给任何人，也不要粘贴到聊天、截图或公开仓库里
- 如果 Key 意外泄露，去 DeepSeek 控制台删除旧 Key 并重新生成
