# Code Switch Web

A specialized web tool for managing model providers for Claude Code and Codex CLI. This tool aims to simplify provider configuration while ensuring safety and compatibility.

## Features
- **Provider CRUD**: Manage multiple providers for both Claude Code and Codex.
- **Config Preview**: View generated `config.json`, `config.toml`, or environment variables before applying.
- **Safety Guards**: Detects and warns about "unsafe" configurations (e.g., direct OpenAI connection for Claude Code).
- **Format Support**: Supports Anthropic Messages, OpenAI Chat, and OpenAI Responses formats.

## Quick Start
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
3. Open `http://localhost:3000` in your browser.

## Tech Stack
- **Backend**: Node.js + Express + Zod + smol-toml
- **Frontend**: React + Vite + TypeScript

## Current Limitations
- **Read-Only**: This version provides previews and internal state management only. It does not write to `~/.claude` or `~/.codex` directly yet.
- **Auth**: Only Basic/Bearer auth is implemented; OAuth (Copilot/Gemini Cli) is not yet supported.
