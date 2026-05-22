import { z } from 'zod';

export const appIdSchema = z.enum(['claude', 'codex']);
export const apiFormatSchema = z.enum(['anthropic', 'openai-chat', 'openai-responses', 'gemini-native']);
export const authModeSchema = z.enum(['header', 'bearer', 'none']);

export const providerInputSchema = z.object({
  app: appIdSchema,
  name: z.string().min(1),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  apiKeyEnv: z.string().optional(),
  authMode: authModeSchema.default('header'),
  apiFormat: apiFormatSchema,
  model: z.string().min(1),
  smallFastModel: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  codex: z.object({
    wireApi: z.enum(['chat', 'responses']).optional(),
    reasoningEffort: z.enum(['low', 'medium', 'high']).optional(),
  }).optional(),
  claude: z.object({
    useAnthropicEnv: z.boolean().optional(),
    forceUnsafeOpenAiDirect: z.boolean().optional(),
  }).optional(),
});

export type ProviderInput = z.infer<typeof providerInputSchema>;
