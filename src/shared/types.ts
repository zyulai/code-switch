export type AppId = 'claude' | 'codex';

export type ApiFormat = 'anthropic' | 'openai-chat' | 'openai-responses' | 'gemini-native';

export type AuthMode = 'header' | 'bearer' | 'none';

export interface Provider {
  id: string;
  app: AppId;
  name: string;
  baseUrl: string;
  apiKey?: string;
  apiKeyEnv?: string;
  authMode: AuthMode;
  apiFormat: ApiFormat;
  model: string;
  smallFastModel?: string;
  headers?: Record<string, string>;
  
  // App-specific metadata/overrides
  codex?: {
    wireApi?: 'chat' | 'responses';
    reasoningEffort?: 'low' | 'medium' | 'high';
  };
  claude?: {
    useAnthropicEnv?: boolean;
    forceUnsafeOpenAiDirect?: boolean;
  };

  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderStore {
  providers: Provider[];
}

export interface ConfigPreview {
  app: AppId;
  filePath: string;
  content: string;
  isUnsafe: boolean;
  warnings: string[];
}
