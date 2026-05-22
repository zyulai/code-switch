import assert from 'node:assert';
import test from 'node:test';
import { generateCodexPreview } from './codex.js';
import type { Provider } from '../../shared/types.js';

test('Codex adapter previews', () => {
  const base: Provider = {
    id: '1',
    app: 'codex',
    name: 'Test',
    baseUrl: 'https://api.example.com',
    apiFormat: 'openai-chat',
    model: 'gpt-4',
    authMode: 'header',
    enabled: false,
    createdAt: '',
    updatedAt: '',
    codex: { wireApi: 'chat', reasoningEffort: 'medium' }
  };

  test('TOML output format', () => {
    const preview = generateCodexPreview(base);
    assert.ok(preview.content.includes('api_format = "openai_chat"'));
    assert.ok(preview.content.includes('wire_api = "chat"'));
    assert.ok(preview.content.includes('reasoning_effort = "medium"'));
  });

  test('API key desensitization', () => {
    const preview = generateCodexPreview({ ...base, apiKey: 'sk-1234567890' });
    assert.ok(preview.content.includes('<stored-secret:sk-1...7890>'));
    assert.ok(!preview.content.includes('sk-1234567890'));
  });

  test('API key env variable and responses wire API', () => {
    const preview = generateCodexPreview({
      ...base,
      apiKey: undefined,
      apiKeyEnv: 'OPENAI_API_KEY',
      apiFormat: 'openai-responses',
      codex: { wireApi: 'responses', reasoningEffort: 'high' },
    });
    assert.ok(preview.content.includes('api_format = "openai_responses"'));
    assert.ok(preview.content.includes('api_key_env = "OPENAI_API_KEY"'));
    assert.ok(preview.content.includes('wire_api = "responses"'));
    assert.ok(preview.content.includes('reasoning_effort = "high"'));
  });
});
