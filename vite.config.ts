import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Privacy-first: the app stores personal health-adjacent data only on the
// user's own device (IndexedDB/localStorage). No server-side datastore is
// deployed. The service worker is hand-rolled (public/sw.js) so we control
// exactly what gets cached and never cache personal data.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Keep the real design system available to touch-target accessibility tests.
    css: { include: [/index\.css/] },
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
