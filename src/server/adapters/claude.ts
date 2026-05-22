import type { Provider, ConfigPreview } from '../../shared/types.js';

export function generateClaudePreview(provider: Provider): ConfigPreview {
  const warnings: string[] = [];
  let isUnsafe = false;

  // Safety check: Claude Code directly connecting to OpenAI Chat/Responses without proxy
  if (provider.apiFormat.startsWith('openai') && !provider.claude?.forceUnsafeOpenAiDirect) {
    isUnsafe = true;
    warnings.push(
      'Claude Code might fail when connected directly to OpenAI formats without an adapter. ' +
      'Ensure your provider supports Anthropic Messages format or use a proxy.'
    );
  }

  const config = {
    model: provider.model,
    baseUrl: provider.baseUrl,
  };

  const envVars: Record<string, string> = {
    ANTHROPIC_BASE_URL: provider.baseUrl,
  };

  if (provider.apiKey) {
    // Desensitize API key in preview
    const masked = provider.apiKey.length <= 8 
      ? '<stored-secret>' 
      : `<stored-secret:${provider.apiKey.slice(0, 4)}...${provider.apiKey.slice(-4)}>`;
    envVars.ANTHROPIC_API_KEY = masked;
  } else if (provider.apiKeyEnv) {
    envVars.ANTHROPIC_API_KEY = `\${${provider.apiKeyEnv}}`;
  }

  const content = [
    '# Claude Code Environment Variables',
    ...Object.entries(envVars).map(([k, v]) => `export ${k}="${v}"`),
    '',
    '# Configuration JSON (if applicable)',
    JSON.stringify(config, null, 2)
  ].join('\n');

  return {
    app: 'claude',
    filePath: '~/.claude/config.json (Environment preferred)',
    content,
    isUnsafe,
    warnings,
  };
}
