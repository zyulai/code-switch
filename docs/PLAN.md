# Web Provider Switch Plan

## 0. Goal
Build a new web-first tool next to cc-switch. It must not depend on Tauri or desktop APIs. It should start a local HTTP server and expose a browser UI for managing Claude Code and Codex providers safely.

Suggested name: `code-provider-web`.

Primary command:

```bash
cd ~/Desktop/code-switch/code-provider-web
pnpm install
pnpm dev
# open http://127.0.0.1:17888
```

## 1. What to borrow from cc-switch
Borrow concepts, not Tauri implementation:

- Provider card UX: add/edit/delete/enable/test.
- Separate app profiles: Claude Code and Codex first; OpenClaw later.
- Provider presets and API format metadata.
- Model fields and model-test idea.
- Safe config writes with backup.
- Explicit handling for Anthropic native, OpenAI-compatible chat, OpenAI Responses, and provider-specific base URLs.
- Warnings for provider formats that require a local compatibility proxy to avoid tool_use/request errors.

Delete/avoid:

- Tauri invoke API, tray menu, desktop updater, deep links, OS startup integration.
- Native file dialogs.
- Desktop app packaging.
- Claude Desktop, MCP/Skills/session manager/workspace editor in MVP.
- Proxy daemon in MVP unless needed for format bridging; config-only switching first.

## 2. Architecture

Stack:

- Monorepo-ish but simple Vite + Express TypeScript app.
- Backend: Node.js + Express, zod validation, fs-extra, jsonc-parser/smol-toml.
- Frontend: React + Vite + TanStack Query + simple CSS.
- Config DB: JSON file under project data directory.

Directories:

```text
code-provider-web/
  package.json
  pnpm-workspace.yaml? optional
  tsconfig.json
  vite.config.ts
  src/
    client/
      App.tsx
      api.ts
      components/
    server/
      index.ts
      routes/
      services/
      adapters/
      schemas.ts
    shared/
      types.ts
  data/
    providers.json
    backups/
  docs/
    PLAN.md
```

Runtime model:

- One Node server serves both API and built frontend.
- Default bind: `127.0.0.1`, port `17888`.
- Optional env: `HOST`, `PORT`, `DATA_DIR`.
- If binding non-localhost, require `ADMIN_TOKEN` and use Bearer auth.

## 3. Backend APIs

Health:

- `GET /api/health`

Providers:

- `GET /api/apps` -> supported app profiles.
- `GET /api/providers?app=claude|codex`
- `POST /api/providers`
- `PUT /api/providers/:id`
- `DELETE /api/providers/:id`
- `POST /api/providers/:id/enable`
- `POST /api/providers/:id/test` optional MVP stub or live request with explicit confirmation.

Config:

- `GET /api/live/:app` -> read current live config summary.
- `POST /api/import/:app` -> import current live config as provider.
- `POST /api/backups/restore` later.

Security:

- Never return full API keys by default. Return masked keys; explicit edit endpoint can return secret only if local-only or token-authenticated.
- Atomic writes: write temp then rename.
- Backup before changing external CLI config.
- Path allowlist: only known Claude/Codex config files, unless user starts with explicit `ALLOW_CUSTOM_CONFIG_PATHS=1`.

## 4. Config targets

Claude Code:

Need support for two modes:

1. Native Anthropic provider:
   - env/settings containing `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, optional model envs.
   - Tool use safest because Claude Code speaks Anthropic wire format.

2. OpenAI-compatible provider:
   - Direct config may break tool_use if Claude Code expects Anthropic format.
   - MVP should mark as `requiresProxy: true` unless provider exposes Anthropic-compatible endpoint.
   - For direct use, only allow if user selects `apiFormat: anthropic`.

Codex:

- Manage `~/.codex/config.toml` provider sections.
- Support wire API variants:
  - `responses`
  - `chat`
- Store model, base_url, api_key_env_var or direct key strategy.
- Preserve unrelated TOML fields.

Internal provider object:

```ts
type AppId = 'claude' | 'codex';
type ApiFormat = 'anthropic' | 'openai-chat' | 'openai-responses';
interface Provider {
  id: string;
  app: AppId;
  name: string;
  baseUrl: string;
  apiKey?: string;
  apiKeyEnv?: string;
  apiFormat: ApiFormat;
  model: string;
  smallFastModel?: string;
  headers?: Record<string, string>;
  codex?: { wireApi?: 'chat' | 'responses'; envKey?: string };
  claude?: { useAnthropicEnv?: boolean };
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 5. Avoiding tool_use / request format failures

Rules:

- Claude Code native tool_use expects Anthropic-compatible messages and tool schema. Do not blindly point Claude at `/v1/chat/completions`.
- Provider form must ask for API format.
- If Claude provider is OpenAI Chat/Responses, show warning: requires compatibility proxy/transform. MVP can save provider but should not enable it for Claude direct config unless user force-enables advanced unsafe mode.
- Codex can use Responses or Chat depending on adapter. Write matching `wire_api` when supported.
- Test endpoint should send minimal request matching selected format:
  - Anthropic: `/v1/messages` with tools field optional test.
  - OpenAI Chat: `/v1/chat/completions` with tool_calls-compatible schema.
  - OpenAI Responses: `/v1/responses`.
- Always validate base URL normalization: no double `/v1/v1`, no missing path for full endpoints.

## 6. MVP milestones

Milestone 1: skeleton

- Create `code-provider-web`.
- Package scripts: `dev`, `build`, `start`, `typecheck`.
- Express API + Vite frontend proxy.
- Health endpoint and basic UI shell.

Milestone 2: provider store

- `data/providers.json` read/write.
- CRUD APIs with zod validation.
- React list/add/edit/delete.
- Mask API keys in list.

Milestone 3: live config adapters

- Claude adapter reads/writes a dedicated managed settings/env fragment with backup.
- Codex adapter reads/writes TOML provider config with backup.
- Enable provider action.
- Import current live config.

Milestone 4: safety and tests

- Atomic writes, backups.
- Typecheck.
- Unit tests for URL normalization and TOML/JSON patching.
- Manual smoke: start server, open UI, add provider, enable dry-run.

Enhancements later:

- Real model test endpoint.
- Local compatibility proxy for Claude OpenAI-compatible providers.
- Provider presets from cc-switch.
- OpenClaw support.
- Auth UI and remote access.

## 7. First implementation files

Implement first:

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/shared/types.ts`
- `src/server/index.ts`
- `src/server/store.ts`
- `src/server/schemas.ts`
- `src/server/adapters/claude.ts`
- `src/server/adapters/codex.ts`
- `src/client/App.tsx`
- `src/client/api.ts`
- `src/client/main.tsx`
- `README.md`

First version should have UI CRUD and a dry-run enable preview before writing real config. Then add actual write once preview looks correct.
