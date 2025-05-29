import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'; // 导入 path 模块

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 配置 @ 为 src 目录的别名
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端 API 地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀
      },
    },
  },
})
