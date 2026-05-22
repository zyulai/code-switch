# Codex Review: Existing code-provider-web MVP

## Observations
- **Architecture**: The standard Express + React (Vite) setup is clean and appropriate.
- **Store**: `store.ts` uses atomic writes with a temp file, which is good. However, it lacks a `backups/` rotation mechanism.
- **Schemas**: `schemas.ts` is too simple. It doesn't capture the nuance of `cc-switch`'s `UniversalProviderPreset` or `ProviderType`.
- **Adapters**: The existing `adapters/` are placeholders. They need to implement the actual configuration generation for `~/.claude/config.json` and `~/.codex/config.toml`.
- **UI**: The current UI is likely a basic list. It needs to clearly distinguish between the "Source Provider" (the API) and the "Application Profile" (how Claude Code or Codex sees it).

## Recommendations
1. **Model Convergence**: Align types with `cc-switch`'s `UniversalProvider` concept but simplified for web.
2. **Explicit Safety**: The tool must explicitly flag "Unsafe" configurations (e.g., Claude Code -> OpenAI Chat directly).
3. **Dry-Run first**: Prioritize the "Preview" feature over actual file writing to ensure user trust.
4. **Metadata Preservation**: Ensure that when we *do* eventually write to config files, we preserve existing comments/unknown fields (using `smol-toml` for Codex and careful JSON merge for Claude).


## Post-Cleanup Fixes (2026-05-22)

## Review Findings & Fixes (2026-05-22)
- **Bug Fixed**: `markEnabled` was incorrectly updating the `updatedAt` field for all providers instead of only the affected app group. Fixed to scoped update.
- **Bug Fixed**: `listProviders` was failing when `app` query parameter was missing or not a string. Fixed with explicit type checking.
- **Security**: Verified API key desensitization in `store.ts` (masking) and `adapters/` (preview masking). Added tests to ensure no leakage.
- **Validation**: Added comprehensive unit and integration tests using Node.js native test runner.
- **Build**: Fixed server entry point in `package.json` and ensured production build assets are correctly mapped.
- **Build & Start**: Fixed `package.json` to properly compile server-side TypeScript to `dist/server/` and updated `start` script.
- **Security**: Implemented desensitization for API keys in configuration previews for both Claude and Codex adapters to prevent secret leakage in the UI.
- **Port Consistency**: Verified `/health` endpoint and ensured server listens on the documented port (3000).
