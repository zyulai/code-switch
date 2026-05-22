import express from 'express';
import path from 'node:path';
import { 
  listProviders, 
  addProvider, 
  updateProvider, 
  deleteProvider, 
  getProvider,
  markEnabled 
} from './store.js';
import { providerInputSchema } from './schemas.js';
import { generateClaudePreview } from './adapters/claude.js';
import { generateCodexPreview } from './adapters/codex.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API Routes
app.get('/api/providers', async (req, res) => {
  const appQuery = typeof req.query.app === "string" ? req.query.app : undefined;
  const providers = await listProviders(appQuery);
  res.json(providers);
});

app.post('/api/providers', async (req, res) => {
  const result = providerInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  const provider = await addProvider(result.data);
  res.status(201).json(provider);
});

app.put('/api/providers/:id', async (req, res) => {
  const result = providerInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  const provider = await updateProvider(req.params.id, result.data);
  if (!provider) return res.status(404).end();
  res.json(provider);
});

app.delete('/api/providers/:id', async (req, res) => {
  const success = await deleteProvider(req.params.id);
  res.status(success ? 204 : 404).end();
});

app.post('/api/providers/:id/enable', async (req, res) => {
  await markEnabled(req.params.id);
  res.status(204).end();
});

app.get('/api/providers/:id/preview', async (req, res) => {
  const provider = await getProvider(req.params.id);
  if (!provider) return res.status(404).end();

  if (provider.app === 'claude') {
    res.json(generateClaudePreview(provider));
  } else {
    res.json(generateCodexPreview(provider));
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Static files (Vite build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist/client')));
  // Fallback for SPA
  app.use((req, res, next) => {
    if (req.accepts('html')) {
      res.sendFile(path.join(process.cwd(), 'dist/client/index.html'));
    } else {
      next();
    }
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
