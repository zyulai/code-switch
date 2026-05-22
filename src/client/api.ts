import type { Provider, ConfigPreview } from '../shared/types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}): ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchProviders(app?: string): Promise<Provider[]> {
  const url = app ? `/api/providers?app=${encodeURIComponent(app)}` : '/api/providers';
  return request<Provider[]>(url);
}

export async function createProvider(data: unknown): Promise<Provider> {
  return request<Provider>('/api/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteProvider(id: string): Promise<void> {
  await request<void>(`/api/providers/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function enableProvider(id: string): Promise<void> {
  await request<void>(`/api/providers/${encodeURIComponent(id)}/enable`, { method: 'POST' });
}

export async function getPreview(id: string): Promise<ConfigPreview> {
  return request<ConfigPreview>(`/api/providers/${encodeURIComponent(id)}/preview`);
}
