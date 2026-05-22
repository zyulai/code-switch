import assert from 'node:assert';
import test from 'node:test';
import path from 'node:path';
import fs from 'fs-extra';
import { spawn } from 'node:child_process';
import http from 'node:http';

const TEST_DATA_DIR = '/tmp/code-provider-api-test';
const PORT = 3333;

test('API Integration', async (t) => {
  await fs.remove(TEST_DATA_DIR);
  await fs.ensureDir(TEST_DATA_DIR);

  const server = spawn('node', ['dist/server/server/index.js'], {
    env: { ...process.env, DATA_DIR: TEST_DATA_DIR, PORT: PORT.toString(), NODE_ENV: 'production' }
  });

  // Wait for server to start
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Server running')) resolve(true);
    });
  });

  const fetchApi = (path: string, options: any = {}) => {
    return new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${PORT}${path}`, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
      });
      req.on('error', reject);
      if (options.body) req.write(JSON.stringify(options.body));
      req.end();
    });
  };

  await t.test('health check', async () => {
    const res: any = await fetchApi('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  await t.test('CRUD cycle', async () => {
    // Create
    const createRes: any = await fetchApi('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        app: 'claude',
        name: 'API Test',
        baseUrl: 'https://api.test',
        apiFormat: 'anthropic',
        model: 'm1'
      }
    });
    assert.strictEqual(createRes.status, 201);
    const id = createRes.body.id;

    // List
    const listRes: any = await fetchApi('/api/providers');
    assert.strictEqual(listRes.body.length, 1);

    // Preview
    const previewRes: any = await fetchApi(`/api/providers/${id}/preview`);
    assert.strictEqual(previewRes.status, 200);
    assert.strictEqual(previewRes.body.app, 'claude');

    // Enable
    const enableRes: any = await fetchApi(`/api/providers/${id}/enable`, { method: 'POST' });
    assert.strictEqual(enableRes.status, 204);

    // Delete
    const deleteRes: any = await fetchApi(`/api/providers/${id}`, { method: 'DELETE' });
    assert.strictEqual(deleteRes.status, 204);
  });

  server.kill();
});
