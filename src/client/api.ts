import type { Provider, ConfigPreview } from '../shared/types';

export async function fetchProviders(app?: string): Promise<Provider[]> {
  const url = app ? `/api/providers?app=${app}` : '/api/providers';
  const res = await fetch(url);
  return res.json();
}

export async function createProvider(data: any): Promise<Provider> {
  const res = await fetch('/api/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProvider(id: string): Promise<void> {
  await fetch(`/api/providers/${id}`, { method: 'DELETE' });
}

export async function enableProvider(id: string): Promise<void> {
  await fetch(`/api/providers/${id}/enable`, { method: 'POST' });
}

export async function getPreview(id: string): Promise<ConfigPreview> {
  const res = await fetch(`/api/providers/${id}/preview`);
  return res.json();
}
