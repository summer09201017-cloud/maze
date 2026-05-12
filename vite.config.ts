import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // 允許手機同 WiFi 連線測試
    port: 3000,
  },
  build: {
    target: 'es2020',
  },
});
