import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 配置：开发时将 /api 请求代理到后端 NestJS 服务
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // 代码块体积告警阈值调大，Pyodide/编辑器走懒加载
    chunkSizeWarningLimit: 1500,
  },
});
