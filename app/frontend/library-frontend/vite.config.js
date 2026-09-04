import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Everything in public/ is served from / and copied into the build as-is,
// which is why index.html now uses plain absolute paths instead of the
// %PUBLIC_URL% placeholder Create React App substituted at build time.
export default defineConfig({
  plugins: [react()],
  server: {
    // The backend hardcodes http://localhost:3000, and the README and
    // devcontainer both expect the UI on 3001.
    port: 3001,
    strictPort: true,
  },
  build: {
    outDir: 'build',
  },
});
