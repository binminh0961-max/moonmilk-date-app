import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Quan trọng cho Electron khi load dist/index.html
  server: {
    port: 5173,
    strictPort: true,
  },
});
