// src/services/apiClient.ts
import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { API_BASE_URL } from './config';
import { useAuthStore } from '@/store/auth.store';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Не устанавливаем Authorization здесь, пусть это делает интерцептор
  },
});

// --- isRefreshing, failedQueue ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void; config: InternalAxiosRequestConfig }> = [];
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            // Обновляем заголовок в сохраненной конфигурации запроса
            if (token) {
                 prom.config.headers['Authorization'] = `Bearer ${token}`;
                 console.log(`[processQueue] Retrying request to ${prom.config.url} with new token.`);
            } else {
                 console.warn(`[processQueue] Retrying request to ${prom.config.url} WITHOUT token (refresh failed).`);
                 delete prom.config.headers['Authorization'];
            }
            // Повторяем исходный запрос с обновленной конфигурацией
            prom.resolve(apiClient(prom.config));
        }
    });
    failedQueue = [];
};


// --- Интерцептор ЗАПРОСА (САМАЯ ПОДРОБНАЯ ОТЛАДКА) ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore(); // Получаем доступ к стору КАЖДЫЙ раз
    const token = authStore.accessToken; // Получаем АКТУАЛЬНЫЙ токен из стора

    const url = config.url ?? '';
    console.log(`[Request Interceptor] Intercepting: ${config.method?.toUpperCase()} ${url}`);
    console.log(`[Request Interceptor] Current token in store: ${token ? '***' : 'null'}`);
    console.log('[Request Interceptor] Headers BEFORE modification:', JSON.stringify(config.headers));


    // Логика добавления токена
    const isLoginRefresh = url.includes('/users/login/refresh'); // Проверяем URL рефреша

    if (token && !isLoginRefresh) {
        // Устанавливаем заголовок КАЖДЫЙ РАЗ для защищенных запросов
        console.log(`[Request Interceptor] Attaching token to header for ${url}`);
        // Используем явное присваивание, а не проверку (!config.headers['Authorization'])
        config.headers.set('Authorization', `Bearer ${token}`); // Используем .set() для надежности
    } else if (!token && !url.includes('/users/login') && !url.includes('/users/register')) {
        // Если токена нет, а URL не для логина/регистрации (подразумеваем, что он защищен)
        console.warn(`[Request Interceptor] No token found for potentially protected URL: ${url}. Removing Authorization header just in case.`);
        // Убедимся, что заголовок точно удален, если токена нет
        config.headers.delete('Authorization');
    } else {
        // Либо это запрос на рефреш, либо логин/регистрация, либо есть токен, но URL - рефреш
       console.log(`[Request Interceptor] No token attached or modifying headers for this request (URL: ${url}, Token present: ${!!token})`);
       // Убедимся, что для неаутентифицированных запросов нет старого заголовка
       if (!token) {
           config.headers.delete('Authorization');
       }
    }

    console.log('[Request Interceptor] Headers AFTER modification:', JSON.stringify(config.headers));

    return config;
  },
  (error) => {
    console.error('[Request Interceptor] Error in request setup:', error);
    return Promise.reject(error);
  }
);

// --- Интерцептор ОТВЕТА (с небольшими уточнениями логов) ---
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Возвращаем только данные
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    // Проверка на наличие config обязательна, его может не быть при ошибках сети
    if (!originalRequest) {
        console.error('[Response Interceptor] Error without original request config:', error);
        return Promise.reject(error);
    }

    const authStore = useAuthStore();
    const url = originalRequest.url ?? '';

    console.log(`[Response Interceptor] Received error for ${originalRequest.method?.toUpperCase()} ${url}: Status ${error.response?.status}`);

    // Обработка 401
    if (error.response?.status === 401 && !url.includes('/users/login/refresh/') && !originalRequest._retry) {
        console.log(`[Response Interceptor] Handling 401 for ${url}`);
        if (isRefreshing) {
            console.log(`[Response Interceptor] Refresh already in progress. Queueing request to ${url}`);
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject, config: originalRequest });
            }).catch(err => Promise.reject(err));
        }

        console.log(`[Response Interceptor] Marking request as retry and starting token refresh for ${url}`);
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshedSuccessfully = await authStore.refreshTokenAction();
            if (refreshedSuccessfully && authStore.accessToken) {
                console.log(`[Response Interceptor] Token refreshed. Processing queue and retrying ${url}`);
                processQueue(null, authStore.accessToken); // Обрабатываем очередь
                // Повторяем оригинальный запрос СРАЗУ после обработки очереди
                 originalRequest.headers['Authorization'] = `Bearer ${authStore.accessToken}`; // Обновляем заголовок в ретрае
                return apiClient(originalRequest);
            } else {
                console.warn(`[Response Interceptor] Refresh failed. Processing queue with error for ${url}.`);
                processQueue(new Error('Token refresh failed'), null);
                authStore.logout();
                return Promise.reject(error);
            }
        } catch (refreshError) {
            console.error('[Response Interceptor] Catch block during refresh attempt.');
            processQueue(refreshError, null);
            authStore.logout();
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
            console.log(`[Response Interceptor] Finished refresh logic for ${url}. isRefreshing: ${isRefreshing}`);
        }
    } else if (error.response?.status === 401 && url.includes('/users/login/refresh/')) {
        console.warn('[Response Interceptor] Refresh token is invalid (401 on refresh endpoint). Logging out.');
        authStore.logout();
    } else if (originalRequest._retry && error.response?.status === 401) {
         console.warn(`[Response Interceptor] Request failed with 401 even after retry for ${url}. Logging out.`);
         authStore.logout();
    }

    // Пробрасываем остальные ошибки
    console.log(`[Response Interceptor] Passing error through for ${url} (Status: ${error.response?.status})`);
    return Promise.reject(error);
  }
);


export default apiClient;