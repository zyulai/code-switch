# Code Switch Web

[English README](./README.md)

Code Switch Web 是一个本地优先的网页工具，用来管理 Claude Code 和 Codex CLI 的模型 provider 配置档案。

它参考了 [`cc-switch`](https://github.com/farion1231/cc-switch) 的 provider 管理思路，但这是一个独立的 Web 版本实现。桌面端/Tauri 相关能力已经被刻意裁剪掉。当前版本是安全优先的 MVP：只在本地保存 provider 档案并生成配置预览，**暂时不会写入** `~/.claude` 或 `~/.codex/config.toml`。

## 为什么做这个工具

Claude Code 和 Codex 都可以接不同模型 provider，但配置格式很容易踩坑：

- Claude Code 通常更适合 Anthropic Messages 兼容格式。
- Codex 需要根据 provider 能力区分 OpenAI Chat Completions 或 Responses wire API。
- 很多 OpenAI-compatible endpoint 只是“部分兼容”，在工具调用、`tool_use`、request format 上可能失败。
- API Key 不能在网页预览或接口返回里泄露。

这个工具的目标是：在真正改动 CLI 配置之前，把 provider 的格式、安全风险和生成结果先看清楚。

## 功能

- 管理 Claude Code / Codex 的 provider 档案。
- 本地 HTTP API + React 网页 UI。
- 生成 Claude Code / Codex 配置预览。
- provider 列表和配置预览都会脱敏 API Key。
- 对高风险组合给出警告，尤其是 Claude Code 直连 OpenAI Chat/Responses 格式。
- Codex preview 明确区分 `chat` / `responses` wire API。
- 使用 Node.js 原生测试框架，包含单测和 API 集成测试。
- 支持 `DATA_DIR`，测试和实验不会污染真实配置。

## 当前状态

这是第一阶段 MVP。

已经实现：

- 本地 provider 存储：`data/providers.json`。
- 新增、列表、删除、启用 provider。
- 生成配置预览。
- 覆盖 store、adapter、API 集成、生产健康检查相关测试。

暂未实现：

- 写入真实 `~/.claude` / `~/.codex/config.toml`。
- 对真实 CLI 配置文件做备份和回滚。
- 真实写入时保留未知字段和注释。
- 本地网页访问鉴权。
- Copilot/Gemini 等 OAuth 登录流程。
- 所有高级 provider 字段的完整 UI。

## 环境要求

- 推荐 Node.js 20+。当前验证环境是 Node.js `v25.8.2`。
- pnpm。

## 快速开始

```bash
pnpm install
pnpm dev
```

浏览器打开：

```text
http://localhost:3000
```

默认数据文件：

```text
./data/providers.json
```

如果想用临时目录测试：

```bash
DATA_DIR=/tmp/code-provider-web pnpm dev
```

## 生产构建

```bash
pnpm build
pnpm start
```

健康检查：

```bash
curl http://localhost:3000/health
```

预期返回：

```json
{"status":"ok"}
```

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务。 |
| `pnpm build` | 清理并构建 server + client 到 `dist/`。 |
| `pnpm start` | 从 `dist/` 启动生产服务。 |
| `pnpm test` | 编译测试到 `dist-test/`，使用 Node 原生 test runner 执行。 |
| `pnpm test:coverage` | 使用 Node 实验性 coverage reporter 跑覆盖率。 |
| `pnpm typecheck` | TypeScript 类型检查。 |

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/health` | 健康检查。 |
| `GET` | `/api/providers` | provider 列表，可选 `?app=claude` 或 `?app=codex`。 |
| `POST` | `/api/providers` | 创建 provider。 |
| `PUT` | `/api/providers/:id` | 更新 provider。 |
| `DELETE` | `/api/providers/:id` | 删除 provider。 |
| `POST` | `/api/providers/:id/enable` | 为对应 app 启用一个 provider。 |
| `GET` | `/api/providers/:id/preview` | 生成配置预览。 |

provider 示例：

```json
{
  "app": "codex",
  "name": "OpenAI Responses Provider",
  "baseUrl": "https://api.openai.com/v1",
  "apiKeyEnv": "OPENAI_API_KEY",
  "authMode": "bearer",
  "apiFormat": "openai-responses",
  "model": "gpt-4.1",
  "codex": {
    "wireApi": "responses",
    "reasoningEffort": "medium"
  }
}
```

## Provider 兼容性说明

### Claude Code

Claude Code 优先使用 Anthropic Messages 兼容 provider。

如果直接把 Claude Code 指向普通 OpenAI Chat/Responses endpoint，可能因为工具调用 schema、消息格式、`tool_use` 等差异失败。Code Switch Web 会把这种组合标记为 unsafe，除非用户显式强制允许。

### Codex

Codex 预览会明确 provider format 和 wire API：

- `openai-chat` + `wireApi: "chat"`
- `openai-responses` + `wireApi: "responses"`

请根据真实 provider 能力选择，不要默认认为所有 OpenAI-compatible 网关都同时支持两者。

## 安全模型

- 默认设计为本地运行。
- provider 列表接口会脱敏 API Key。
- 配置预览使用 `<stored-secret:sk-1...7890>` 这类占位符，不展示真实 key。
- 测试使用临时 `DATA_DIR`，不会触碰真实 Claude/Codex 配置。
- 当前 MVP 不会写入真实 CLI 配置文件。

如果要暴露到非 localhost 环境，请先增加鉴权，并检查 CORS / 网络边界。

## 项目结构

```text
src/client/             React UI
src/server/             Express API、store、adapters、tests
src/server/adapters/    Claude Code 和 Codex 配置预览生成
src/shared/             前后端共享 TypeScript 类型
docs/                   方案、review、开源检查清单
data/                   本地运行数据，git 忽略
dist/                   生产构建产物，git 忽略
dist-test/              测试构建产物，git 忽略
```

## 开发流程

提交前建议执行：

```bash
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm build
```

可选生产 smoke test：

```bash
PORT=3010 DATA_DIR=/tmp/code-provider-health NODE_ENV=production node dist/server/server/index.js
curl http://127.0.0.1:3010/health
```

## 路线图

- 增加显式导出/应用配置流程，并要求用户确认。
- 安全写入 `~/.claude` 和 `~/.codex/config.toml`，带备份和回滚。
- 尽量保留未知字段和注释。
- 完善 UI：auth mode、自定义 headers、只使用环境变量的密钥、高级 app-specific 设置。
- 如果要非本机访问，增加本地鉴权。
- 仓库开放协作前增加 CI。

## License

暂未选择 License。正式作为开源项目发布前，请添加 `LICENSE` 文件。
