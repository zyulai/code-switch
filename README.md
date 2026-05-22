# Code Switch Web

[中文文档](./README_ZH.md)

Code Switch Web is a local-first web UI for managing model provider profiles for Claude Code and Codex CLI.

It was inspired by the provider-management workflow in [`cc-switch`](https://github.com/farion1231/cc-switch), but it is a separate web-focused implementation. Desktop/Tauri-only features are intentionally removed. The current version is a safe preview-first MVP: it stores provider profiles locally and generates configuration previews, but it does **not** write to `~/.claude` or `~/.codex/config.toml` yet.

## Why this exists

Claude Code and Codex can talk to different model providers, but provider configuration is easy to get wrong:

- Claude Code generally expects Anthropic-compatible request/response semantics.
- Codex can use OpenAI Chat Completions or Responses-style providers, depending on the configured wire API.
- Some OpenAI-compatible endpoints are only partially compatible and may fail with `tool_use`, tool-call, or request-format errors.
- API keys must not be leaked in UI previews or API responses.

This project provides a small local dashboard to make those differences explicit before any real CLI config is changed.

## Features

- Provider CRUD for Claude Code and Codex profiles.
- Local HTTP API and React web UI.
- Config preview for Claude Code and Codex.
- API-key masking in list responses and previews.
- Safety warnings for risky combinations, especially Claude Code directly using OpenAI Chat/Responses formats.
- Codex preview distinguishes `chat` and `responses` wire APIs.
- Native Node.js test suite with unit and integration tests.
- Temporary `DATA_DIR` support for safe tests and local experiments.

## Current status

This is an MVP.

Implemented:

- Local provider store in `data/providers.json`.
- Add/list/delete/enable providers.
- Preview generated config content.
- Tests for store behavior, adapters, API integration, production health check behavior.

Not implemented yet:

- Writing to real `~/.claude` / `~/.codex/config.toml`.
- Backup and rollback of real CLI config files.
- Preserving existing unknown fields/comments during real config writes.
- Authentication for the local web UI.
- OAuth flows such as Copilot/Gemini login.
- Full UI for every advanced provider option.

## Requirements

- Node.js 20+ recommended. Current validation was run on Node.js `v25.8.2`.
- pnpm.

## Quick start

```bash
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

By default, data is stored in:

```text
./data/providers.json
```

Use a temporary data directory when testing:

```bash
DATA_DIR=/tmp/code-provider-web pnpm dev
```

## Production build

```bash
pnpm build
pnpm start
```

Health check:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok"}
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the local development server. |
| `pnpm build` | Clean and build server + client output into `dist/`. |
| `pnpm start` | Start the production server from `dist/`. |
| `pnpm test` | Compile tests to `dist-test/` and run Node's native test runner. |
| `pnpm test:coverage` | Run tests with Node's experimental coverage reporter. |
| `pnpm typecheck` | Run TypeScript type checking. |

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check. |
| `GET` | `/api/providers` | List providers. Optional `?app=claude` or `?app=codex`. |
| `POST` | `/api/providers` | Create a provider. |
| `PUT` | `/api/providers/:id` | Update a provider. |
| `DELETE` | `/api/providers/:id` | Delete a provider. |
| `POST` | `/api/providers/:id/enable` | Enable one provider for its app. |
| `GET` | `/api/providers/:id/preview` | Generate a config preview. |

Example provider payload:

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

## Provider compatibility notes

### Claude Code

Prefer Anthropic Messages-compatible providers for Claude Code.

Directly pointing Claude Code at generic OpenAI Chat/Responses endpoints may fail because tool-calling and message schemas are not identical. Code Switch Web marks that combination as unsafe unless explicitly overridden.

### Codex

Codex previews include provider format information and can distinguish:

- `openai-chat` + `wireApi: "chat"`
- `openai-responses` + `wireApi: "responses"`

Use the option that matches the actual provider API. Do not assume every OpenAI-compatible gateway supports both.

## Security model

- This tool is designed to run locally.
- API keys are masked in provider list responses.
- Config previews use placeholders such as `<stored-secret:sk-1...7890>` instead of raw secrets.
- Tests use temporary `DATA_DIR` values and do not touch real Claude/Codex config files.
- The MVP does not write real CLI config files.

Before exposing this beyond localhost, add authentication and review CORS/network boundaries.

## Project structure

```text
src/client/             React UI
src/server/             Express API, store, adapters, tests
src/server/adapters/    Claude Code and Codex preview generation
src/shared/             Shared TypeScript types
docs/                   Plans, review notes, open-source checklist
data/                   Local runtime data, ignored by git
dist/                   Production build output, ignored by git
dist-test/              Test build output, ignored by git
```

## Development workflow

Recommended before committing:

```bash
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm build
```

Optional production smoke test:

```bash
PORT=3010 DATA_DIR=/tmp/code-provider-health NODE_ENV=production node dist/server/server/index.js
curl http://127.0.0.1:3010/health
```

## Roadmap

- Add explicit export/apply workflow with user confirmation.
- Add safe writes to `~/.claude` and `~/.codex/config.toml` with backups and rollback.
- Preserve unknown fields and comments where possible.
- Improve UI coverage for auth modes, custom headers, env-var-only secrets, and advanced app-specific settings.
- Add local auth if the app is used beyond localhost.
- Add CI once the repository is ready for public collaboration.

## License

License is not selected yet. Add a `LICENSE` file before presenting this as a formal open-source project.
