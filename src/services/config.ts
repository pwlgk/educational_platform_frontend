// src/services/config.ts

// Базовый URL вашего бэкенда
// Берем из переменных окружения (.env файл) или используем дефолтное значение
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// URL для WebSocket соединений (если отличается)
// Может понадобиться отдельная переменная окружения VITE_WS_BASE_URL
export const WEBSOCKET_URL: string =
  import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000/ws'; // Пример

console.log('API Base URL:', API_BASE_URL); // Для отладки при запуске