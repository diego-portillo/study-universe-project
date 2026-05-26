import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/tests/setup.ts'],
    // CSS is irrelevant for unit/component tests and Tailwind v4's PostCSS
    // plugin can crash the worker thread when imported in a test environment.
    css: false,
    // Set a stable base URL so that fetch('/api/chat') in jsdom resolves to
    // http://localhost/api/chat — matching the msw handler URL exactly.
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
  },
});
