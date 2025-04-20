// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
// Импортируем стор ПОСЛЕ создания Pinia
import { useAuthStore } from '@/store/auth.store';
import { initializeApiConfiguration } from './services/initApi';


initializeApiConfiguration();


const app = createApp(App);
const pinia = createPinia(); // Создаем экземпляр Pinia

app.use(pinia); // СНАЧАЛА подключаем Pinia
app.use(router);

// Инициализируем аутентификацию ПОСЛЕ подключения Pinia и Router
// Чтобы стор был доступен и роутер был готов для редиректов
const authStore = useAuthStore(); // Получаем экземпляр стора
authStore.initializeAuth()
  .catch(err => console.error("Auth initialization failed:", err))
  .finally(() => {
      // Монтируем приложение только ПОСЛЕ попытки инициализации аутентификации
      // Это гарантирует, что роутер-гарды будут работать с актуальным состоянием auth
      app.mount('#app');
      console.log('Vue App Mounted');
  });

