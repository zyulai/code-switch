import assert from 'node:assert';
import test from 'node:test';
import path from 'node:path';
import fs from 'fs-extra';
import { 
  addProvider, 
  listProviders, 
  getProvider, 
  updateProvider, 
  deleteProvider, 
  markEnabled,
  maskProvider
} from './store.js';
import type { ProviderInput } from './schemas.js';

const TEST_DATA_DIR = process.env.DATA_DIR || '/tmp/code-provider-test';

test.beforeEach(async () => {
  await fs.remove(TEST_DATA_DIR);
  await fs.ensureDir(TEST_DATA_DIR);
});

test('store operations', async (t) => {
  const input: ProviderInput = {
    app: 'claude',
    name: 'Test Claude',
    baseUrl: 'https://api.anthropic.com',
    apiKey: 'sk-ant-1234567890',
    apiFormat: 'anthropic',
    model: 'claude-3-opus',
    authMode: 'header'
  };

  await t.test('add and list providers', async () => {
    const p1 = await addProvider(input);
    assert.strictEqual(p1.name, 'Test Claude');
    assert.strictEqual(p1.apiKey, 'sk-a...7890');
    assert.strictEqual(p1.enabled, false);

    const list = await listProviders('claude');
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, p1.id);
  });

  await t.test('get provider (unmasked)', async () => {
    const p1 = await addProvider(input);
    const full = await getProvider(p1.id);
    assert.strictEqual(full?.apiKey, 'sk-ant-1234567890');
  });

  await t.test('update provider', async () => {
    const p1 = await addProvider(input);
    const updated = await updateProvider(p1.id, { ...input, name: 'Updated' });
    assert.strictEqual(updated?.name, 'Updated');
  });

  await t.test('delete provider', async () => {
    const p1 = await addProvider(input);
    const success = await deleteProvider(p1.id);
    assert.strictEqual(success, true);
    const list = await listProviders();
    assert.strictEqual(list.length, 0);
  });

  await t.test('mark enabled (exclusive per app)', async () => {
    const p1 = await addProvider({ ...input, name: 'P1' });
    const p2 = await addProvider({ ...input, name: 'P2' });
    const p3 = await addProvider({ ...input, name: 'P3', app: 'codex' as any });

    await markEnabled(p1.id);
    let list = await listProviders('claude');
    assert.strictEqual(list.find(p => p.id === p1.id)?.enabled, true);
    assert.strictEqual(list.find(p => p.id === p2.id)?.enabled, false);

    await markEnabled(p2.id);
    list = await listProviders('claude');
    assert.strictEqual(list.find(p => p.id === p1.id)?.enabled, false);
    assert.strictEqual(list.find(p => p.id === p2.id)?.enabled, true);
    
    // Codex should not be affected
    const codexList = await listProviders('codex');
    assert.strictEqual(codexList[0].enabled, false);
  });
});

test('masking logic', () => {
  const pBase = { id: '1', app: 'claude', name: 'N', baseUrl: 'B', apiFormat: 'anthropic', model: 'M', authMode: 'header', enabled: false, createdAt: '', updatedAt: '' } as any;
  
  assert.strictEqual(maskProvider({ ...pBase, apiKey: '12345678' }).apiKey, '********');
  assert.strictEqual(maskProvider({ ...pBase, apiKey: '123456789' }).apiKey, '1234...6789');
  assert.strictEqual(maskProvider({ ...pBase }).apiKey, undefined);
});
