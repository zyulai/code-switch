import type { Provider, ConfigPreview } from '../../shared/types.js';
import * as toml from 'smol-toml';

export function generateCodexPreview(provider: Provider): ConfigPreview {
  const warnings: string[] = [];
  const isUnsafe = false;

  const config: any = {
    providers: [
      {
        name: provider.name,
        base_url: provider.baseUrl,
        model: provider.model,
        api_format: provider.apiFormat.replace('-', '_'), // Codex uses snake_case
      }
    ]
  };

  if (provider.apiKey) {
    const masked = provider.apiKey.length <= 8 
      ? '<stored-secret>' 
      : `<stored-secret:${provider.apiKey.slice(0, 4)}...${provider.apiKey.slice(-4)}>`;
    config.providers[0].api_key = masked;
  } else if (provider.apiKeyEnv) {
    config.providers[0].api_key_env = provider.apiKeyEnv;
  }

  if (provider.codex?.wireApi) {
    config.providers[0].wire_api = provider.codex.wireApi;
  }

  if (provider.codex?.reasoningEffort) {
    config.providers[0].reasoning_effort = provider.codex.reasoningEffort;
  }

  const content = [
    '# Codex Configuration (~/.codex/config.toml)',
    toml.stringify(config)
  ].join('\n');

  return {
    app: 'codex',
    filePath: '~/.codex/config.toml',
    content,
    isUnsafe,
    warnings,
  };
}
