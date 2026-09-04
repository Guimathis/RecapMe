import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/medias': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/recaps': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/chats': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/feedbacks': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
