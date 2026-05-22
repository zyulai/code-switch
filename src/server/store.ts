import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'fs-extra';
import type { Provider, ProviderStore } from '../shared/types.js';
import type { ProviderInput } from './schemas.js';

const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const storePath = path.join(dataDir, 'providers.json');

const emptyStore = (): ProviderStore => ({ providers: [] });

export async function readStore(): Promise<ProviderStore> {
  await fs.ensureDir(dataDir);
  if (!(await fs.pathExists(storePath))) {
    await writeStore(emptyStore());
  }
  return fs.readJson(storePath) as Promise<ProviderStore>;
}

export async function writeStore(store: ProviderStore): Promise<void> {
  await fs.ensureDir(dataDir);
  const tmp = `${storePath}.${process.pid}.tmp`;
  await fs.writeJson(tmp, store, { spaces: 2 });
  await fs.move(tmp, storePath, { overwrite: true });
}

export function maskProvider(provider: Provider): Provider {
  if (!provider.apiKey) return provider;
  const key = provider.apiKey;
  return {
    ...provider,
    apiKey: key.length <= 8 ? '********' : `${key.slice(0, 4)}...${key.slice(-4)}`,
  };
}

export async function listProviders(app?: string): Promise<Provider[]> {
  const store = await readStore();
  return store.providers.filter((p: Provider) => !app || p.app === app).map(maskProvider);
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  const store = await readStore();
  return store.providers.find((p: Provider) => p.id === id);
}

export async function addProvider(input: ProviderInput): Promise<Provider> {
  const now = new Date().toISOString();
  const provider: Provider = {
    ...input,
    id: crypto.randomUUID(),
    enabled: false,
    createdAt: now,
    updatedAt: now,
  };
  const store = await readStore();
  store.providers.push(provider);
  await writeStore(store);
  return maskProvider(provider);
}

export async function updateProvider(id: string, input: ProviderInput): Promise<Provider | null> {
  const store = await readStore();
  const index = store.providers.findIndex((p: Provider) => p.id === id);
  if (index < 0) return null;
  const updated: Provider = {
    ...store.providers[index],
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };
  store.providers[index] = updated;
  await writeStore(store);
  return maskProvider(updated);
}

export async function deleteProvider(id: string): Promise<boolean> {
  const store = await readStore();
  const next = store.providers.filter((p: Provider) => p.id !== id);
  if (next.length === store.providers.length) return false;
  await writeStore({ providers: next });
  return true;
}

export async function markEnabled(id: string): Promise<void> {
  const store = await readStore();
  const target = store.providers.find((p: Provider) => p.id === id);
  if (!target) return;
  store.providers = store.providers.map((p: Provider) => ({
    ...p,
    enabled: p.app === target.app ? p.id === id : p.enabled,
    updatedAt: (p.app === target.app) ? new Date().toISOString() : p.updatedAt,
  }));
  await writeStore(store);
}
