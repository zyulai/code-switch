import assert from 'node:assert';
import test from 'node:test';
import { generateClaudePreview } from './claude.js';
import type { Provider } from '../../shared/types.js';

test('Claude adapter previews', () => {
  const base: Provider = {
    id: '1',
    app: 'claude',
    name: 'Test',
    baseUrl: 'https://api.example.com',
    apiFormat: 'openai-chat',
    model: 'gpt-4',
    authMode: 'header',
    enabled: false,
    createdAt: '',
    updatedAt: '',
  };

  test('unsafe warning for direct OpenAI format', () => {
    const preview = generateClaudePreview(base);
    assert.strictEqual(preview.isUnsafe, true);
    assert.ok(preview.warnings[0].includes('Claude Code might fail'));
  });

  test('no unsafe warning if forced', () => {
    const preview = generateClaudePreview({
      ...base,
      claude: { forceUnsafeOpenAiDirect: true }
    });
    assert.strictEqual(preview.isUnsafe, false);
  });

  test('API key desensitization', () => {
    const preview = generateClaudePreview({ ...base, apiKey: 'sk-1234567890' });
    assert.ok(preview.content.includes('<stored-secret:sk-1...7890>'));
    assert.ok(!preview.content.includes('sk-1234567890'));
  });

  test('API key env variable', () => {
    const preview = generateClaudePreview({ ...base, apiKeyEnv: 'MY_KEY' });
    assert.ok(preview.content.includes('${MY_KEY}'));
  });
});
