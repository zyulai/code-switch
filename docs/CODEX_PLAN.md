# Codex Execution Plan: Code Switch Web Tool

## Phase 1: Foundation & Modeling
- [ ] Refine `src/shared/types.ts` to include explicit `ProviderType`, `ApiFormat`, and metadata for dry-run/preview.
- [ ] Enhance Zod schemas in `src/server/schemas.ts` to match `cc-switch` logic (e.g., auth modes, environment variable mappings).
- [ ] Implement robust store logic with atomic writes and backup capability in `src/server/store.ts`.

## Phase 2: Core Logic & Adapters
- [ ] Implement Claude adapter logic: handle Anthropic-native vs. OpenAI-compatible transformation mapping.
- [ ] Implement Codex adapter logic: handle Chat vs. Responses wire API distinction.
- [ ] Add "Preview" generators for:
    - Claude Code (`~/.claude/config.json` or env vars)
    - Codex (`~/.codex/config.toml`)
- [ ] Implement "Safety Guard": logic to detect and warn against Claude Code direct connection to OpenAI without a proxy/transform.

## Phase 3: Web UI Enhancement
- [ ] Update CRUD forms to support new fields (e.g., smallFastModel, custom headers, reasoning effort).
- [ ] Add a "Preview / Dry Run" panel to visualize generated configurations before writing.
- [ ] Implement provider testing (dry-run) via the server-side proxy or direct health check.
- [ ] Add "Application Profile" view: separate tabs for Claude Code and Codex settings.

## Phase 4: Verification & Documentation
- [ ] Add server-side health checks.
- [ ] Write README with startup instructions and limitations.
- [ ] (Optional) Add basic unit tests for transformation logic.

