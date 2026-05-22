import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src/client',
  plugins: [react()],
  server: {
    port: 17889,
    proxy: {
      '/api': 'http://127.0.0.1:17888',
    },
  },
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
});
