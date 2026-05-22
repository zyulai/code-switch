import React, { useState, useEffect } from 'react';
import { 
  fetchProviders, 
  createProvider, 
  deleteProvider, 
  enableProvider, 
  getPreview 
} from './api';
import type { Provider, ConfigPreview } from '../shared/types';

export default function App() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedApp, setSelectedApp] = useState<'claude' | 'codex'>('claude');
  const [preview, setPreview] = useState<ConfigPreview | null>(null);

  useEffect(() => {
    loadProviders();
  }, [selectedApp]);

  const loadProviders = async () => {
    const data = await fetchProviders(selectedApp);
    setProviders(data);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      app: selectedApp,
      name: formData.get('name') as string,
      baseUrl: formData.get('baseUrl') as string,
      apiKey: formData.get('apiKey') as string,
      apiFormat: formData.get('apiFormat') as any,
      model: formData.get('model') as string,
      authMode: 'header',
    };
    await createProvider(data);
    loadProviders();
    e.currentTarget.reset();
  };

  return (
    <div className="container">
      <header>
        <h1>Code Switch Web</h1>
        <div className="tabs">
          <button 
            className={selectedApp === 'claude' ? 'active' : ''} 
            onClick={() => setSelectedApp('claude')}
          >
            Claude Code
          </button>
          <button 
            className={selectedApp === 'codex' ? 'active' : ''} 
            onClick={() => setSelectedApp('codex')}
          >
            Codex
          </button>
        </div>
      </header>

      <main>
        <section className="form-section">
          <h2>Add Provider</h2>
          <form onSubmit={handleCreate}>
            <input name="name" placeholder="Provider Name" required />
            <input name="baseUrl" placeholder="Base URL" required />
            <input name="apiKey" placeholder="API Key" type="password" />
            <select name="apiFormat">
              <option value="anthropic">Anthropic (Messages)</option>
              <option value="openai-chat">OpenAI Chat</option>
              <option value="openai-responses">OpenAI Responses</option>
            </select>
            <input name="model" placeholder="Model (e.g. claude-3-5-sonnet-20240620)" required />
            <button type="submit">Add</button>
          </form>
        </section>

        <section className="list-section">
          <h2>Providers</h2>
          <ul>
            {providers.map(p => (
              <li key={p.id}>
                <span>{p.name} ({p.model})</span>
                <div>
                  <button onClick={async () => setPreview(await getPreview(p.id))}>Preview</button>
                  <button onClick={async () => { await enableProvider(p.id); loadProviders(); }}>
                    {p.enabled ? 'Enabled' : 'Enable'}
                  </button>
                  <button onClick={async () => { await deleteProvider(p.id); loadProviders(); }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {preview && (
          <section className="preview-section">
            <h2>Preview: {preview.filePath}</h2>
            {preview.isUnsafe && (
              <div className="warning">
                <strong>UNSAFE CONFIGURATION:</strong>
                <ul>
                  {preview.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            <pre>{preview.content}</pre>
            <button onClick={() => setPreview(null)}>Close</button>
          </section>
        )}
      </main>
    </div>
  );
}
