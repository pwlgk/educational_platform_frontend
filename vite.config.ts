// vite.config.ts
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path'; // <--- Импортируем path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Заменяем стандартный alias на новый с использованием path
      '@': path.resolve(__dirname, './src'), // <--- Обновляем alias
      // '@': fileURLToPath(new URL('./src', import.meta.url)) // Старый вариант
    },
  },
});