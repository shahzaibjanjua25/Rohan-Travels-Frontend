import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The proxy is doing real work, not just convenience.
 *
 * Auth is an httpOnly cookie with SameSite=lax. If the browser saw the API on
 * a different origin (localhost:5000) from the app (localhost:3000), that
 * cookie would be dropped on cross-site requests and every call would come
 * back 401 — with nothing visibly wrong in the network tab.
 *
 * Proxying /api through the dev server makes everything same-origin, so the
 * development setup matches how it behaves deployed behind one domain.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
