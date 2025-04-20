// src/store/auth.store.ts
import { defineStore } from 'pinia';
import apiClient from '@/services/apiClient';
import { useNotificationsStore } from './notifications.store';
import router from '@/router';
import { nextTick } from 'vue'; // Используем nextTick
import {
  // Добавьте ApiError, если нужно явно типизировать ошибки catch
  ApiError,
  UsersService,
  type User,
  type TokenObtainPairRequest,
  type TokenRefreshRequest,
  type UserRegistrationRequest,
  type ChangePasswordRequest,
  type UserRequest,
  type TokenObtainPair,
  type TokenRefresh,
  type UserRegistration,
  type RoleEnum,
  OpenAPI,
} from '@/services/generated';
import axios from 'axios';

// Интерфейс состояния
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isInitialized: boolean;
}

// --- Вспомогательная функция для извлечения ошибки ---
// (Чтобы не дублировать код в catch блоках)
function getErrorMessage(error: any): string {
  if (error instanceof ApiError || error?.body) {
    // Проверяем и ApiError и наличие body у других ошибок
    const body = error.body as any;
    return (
      body?.detail ||
      (typeof body === 'object' ? JSON.stringify(body) : String(body)) ||
      error.message ||
      'API Error'
    );
  } else if (axios.isAxiosError(error) && error.response?.data) {
    // Если это Axios ошибка без ApiError обертки
    const data = error.response.data;
    return (
      data?.detail ||
      (typeof data === 'object' ? JSON.stringify(data) : String(data)) ||
      error.message ||
      'Request failed'
    );
  } else {
    return error.message || 'An unknown error occurred';
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: null,
    status: 'idle',
    error: null,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken && !!state.user,
    isLoading: (state): boolean => state.status === 'loading',
    getUser: (state): User | null => state.user,
    getUserRole: (state): RoleEnum | null =>
      (state.user?.role as RoleEnum) ?? null,
    isAdmin: (state): boolean => state.user?.role === 'ADMIN',
    isTeacher: (state): boolean => state.user?.role === 'TEACHER',
    isStudent: (state): boolean => state.user?.role === 'STUDENT',
    isParent: (state): boolean => state.user?.role === 'PARENT',
    getIsInitialized: (state): boolean => state.isInitialized,
  },

  actions: {
    // --- Управление токенами ---
    setTokens(access: string, refresh: string) {
      console.log('[setTokens] Setting tokens...');
      this.accessToken = access;
      this.refreshToken = refresh;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // --- ИЗМЕНЕНИЕ: Устанавливаем токен через OpenAPI ---
      OpenAPI.TOKEN = access;
      console.log('[setTokens] OpenAPI.TOKEN set.');
      // --- КОНЕЦ ИЗМЕНЕНИЯ ---

      // Установка дефолтного заголовка Axios теперь не нужна для UsersService,
      // но может быть полезна, если вы будете использовать apiClient где-то еще.
      // apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      // console.log('[setTokens] Default Axios header set (may not be used by generated services).');
    },

    clearTokens() {
      console.log('[clearTokens] Clearing tokens...');
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // --- ИЗМЕНЕНИЕ: Очищаем токен OpenAPI ---
      OpenAPI.TOKEN = undefined; // или null
      console.log('[clearTokens] OpenAPI.TOKEN cleared.');
      // --- КОНЕЦ ИЗМЕНЕНИЯ ---

      // delete apiClient.defaults.headers.common['Authorization'];
      // console.log('[clearTokens] Default Axios header removed.');
    },
    // --- Основные действия ---
    async login(credentials: TokenObtainPairRequest) {
      console.log('[login] Attempting login...');
      this.status = 'loading';
      this.error = null;
      try {
        const response: TokenObtainPair =
          await UsersService.usersLoginCreate(credentials);
        console.log('[login] Login API call successful.');

        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);

          // Ждем следующего тика, чтобы состояние Pinia обновилось
          console.log('[login] Waiting for nextTick after setting tokens...');
          await nextTick();
          console.log(
            '[login] nextTick finished. Current accessToken:',
            this.accessToken ? '***' : 'null'
          ); // Проверяем токен ПОСЛЕ nextTick

          // Пытаемся загрузить профиль
          await this.fetchUserProfile(); // fetchUserProfile сам обработает свой статус и возможный logout

          // Проверяем результат ПОСЛЕ попытки загрузки профиля
          if (this.user) {
            // Если пользователь есть, значит fetchUserProfile удался
            console.log(
              '[login] Profile fetched successfully, redirecting to dashboard.'
            );
            router.push('/');
          } else {
            // Если пользователя нет, значит fetchUserProfile вызвал logout
            // Ничего не делаем, logout уже перенаправил
            console.warn(
              '[login] fetchUserProfile resulted in logout. Staying on login page.'
            );
          }
        } else {
          console.error('[login] Access or Refresh token missing in response.');
          throw new Error('Access or Refresh token missing in login response');
        }
        await this.fetchUserProfile();
        if (this.user) {
          console.log('[login] Profile fetched. Connecting WebSocket...');
          const notificationsStore = useNotificationsStore(); // Получаем стор
          notificationsStore.connectWebSocket(); // <--- Подключаем WS
          router.push('/');
        } else {
          console.warn('[login] fetchUserProfile resulted in logout.');
        }
      } catch (error: any) {
        console.error('[login] Login failed:', getErrorMessage(error), error);
        this.status = 'failed';
        this.error = getErrorMessage(error) || 'Failed to login';
        this.clearTokens(); // Убедимся, что токены очищены при ошибке логина
        this.user = null;
      }
    },

    async register(userData: UserRegistrationRequest): Promise<boolean> {
      console.log('[register] Attempting registration...');
      this.status = 'loading';
      this.error = null;
      try {
        const response: UserRegistration =
          await UsersService.usersRegisterCreate(userData);
        console.log('[register] Registration successful:', response);
        this.status = 'succeeded';
        return true;
      } catch (error: any) {
        console.error(
          '[register] Registration failed:',
          getErrorMessage(error),
          error
        );
        this.status = 'failed';
        this.error = getErrorMessage(error) || 'Failed to register';
        return false;
      }
    },

    async fetchUserProfile() {
      console.log('[fetchUserProfile] Starting...');
      // --- ИЗМЕНЕНИЕ: Проверяем OpenAPI.TOKEN или this.accessToken ---
      // Лучше проверять this.accessToken, так как он отражает состояние стора
      if (!this.accessToken) {
        console.error(
          '[fetchUserProfile] No access token in store state! Logging out.'
        );
        this.logout();
        return;
      }
      // Проверим и OpenAPI.TOKEN для диагностики
      console.log(
        `[fetchUserProfile] Token in store: ${this.accessToken ? '***' : 'null'}. Token in OpenAPI: ${OpenAPI.TOKEN ? '***' : 'null'}`
      );
      // --- КОНЕЦ ИЗМЕНЕНИЯ ---

      if (this.status !== 'loading') this.status = 'loading';
      this.error = null;

      try {
        console.log(
          '[fetchUserProfile] Calling UsersService.usersProfileRetrieve...'
        );
        // Вызов остается прежним, __request внутри использует OpenAPI.TOKEN
        const response: User = await UsersService.usersProfileRetrieve();
        console.log('[fetchUserProfile] API call successful.');
        this.user = response;
        this.status = 'succeeded';
        console.log('[fetchUserProfile] User profile loaded:', this.user);
      } catch (error: any) {
        // Ловим ApiError или другие
        console.error(
          '[fetchUserProfile] API call failed:',
          getErrorMessage(error),
          error
        );
        this.status = 'failed';
        this.error = getErrorMessage(error) || 'Failed to fetch profile';
        // Проверим статус ошибки, если это ApiError
        const status =
          error instanceof ApiError ? error.status : error.response?.status;
        console.log(`[fetchUserProfile] Error status: ${status}`);
        // Обработка 401 (токен не принят / истек) - пытаемся обновить
        if (status === 401) {
          console.log(
            '[fetchUserProfile] Received 401, attempting token refresh...'
          );
          const refreshed = await this.refreshTokenAction();
          if (refreshed) {
            // Если обновили, ПОВТОРЯЕМ запрос профиля
            console.log(
              '[fetchUserProfile] Token refreshed, retrying fetchUserProfile...'
            );
            // Очистим ошибку перед повторной попыткой
            this.error = null;
            // НЕ устанавливаем status loading снова, чтобы избежать зацикливания, если и ретрай упадет
            await this.fetchUserProfile(); // Рекурсивный вызов (но безопасно, т.к. refresh не будет вызываться повторно сразу)
            return; // Выходим после рекурсивного вызова
          } else {
            // Если обновить не удалось - разлогиниваемся
            console.warn(
              '[fetchUserProfile] Refresh failed after 401. Logging out.'
            );
            this.logout();
          }
        } else {
          // Если ошибка не 401, просто разлогиниваемся (или другая логика обработки)
          console.warn(
            `[fetchUserProfile] Unhandled error status ${status}. Logging out.`
          );
          this.logout();
        }
      }
    },

    async updateProfile(profileData: UserRequest): Promise<boolean> {
      if (!this.user) {
        console.error('[updateProfile] Cannot update: user not loaded.');
        return false;
      }
      console.log('[updateProfile] Attempting update...');
      this.status = 'loading';
      this.error = null;
      try {
        const response: User =
          await UsersService.usersProfilePartialUpdate(profileData);
        console.log('[updateProfile] Update successful.');
        this.user = response;
        this.status = 'succeeded';
        return true;
      } catch (error: any) {
        console.error(
          '[updateProfile] Update failed:',
          getErrorMessage(error),
          error
        );
        this.status = 'failed';
        this.error = getErrorMessage(error) || 'Failed to update profile';
        return false;
      }
    },

    async changePassword(
      passwordData: ChangePasswordRequest
    ): Promise<boolean> {
      console.log('[changePassword] Attempting password change...');
      this.status = 'loading';
      this.error = null;
      try {
        await UsersService.usersChangePasswordUpdate(passwordData); // или PartialUpdate
        console.log('[changePassword] Password change successful.');
        this.status = 'succeeded';
        return true;
      } catch (error: any) {
        console.error(
          '[changePassword] Password change failed:',
          getErrorMessage(error),
          error
        );
        this.status = 'failed';
        this.error = getErrorMessage(error) || 'Failed to change password';
        return false;
      }
    },

    async refreshTokenAction(): Promise<boolean> {
      if (!this.refreshToken) {
        console.warn('[refreshTokenAction] No refresh token available.');
        return false;
      }
      console.log('[refreshTokenAction] Attempting to refresh token...');
      try {
        // Вызов UsersService использует OpenAPI.TOKEN (если он там был),
        // но для запроса refresh токен не нужен в заголовке Authorization
        const response: TokenRefresh =
          await UsersService.usersLoginRefreshCreate({
            refresh: this.refreshToken,
          });
        console.log('[refreshTokenAction] Refresh API call successful.');

        if (response.access) {
          const newRefreshToken = response.refresh || this.refreshToken;
          // ВАЖНО: setTokens обновит OpenAPI.TOKEN новым access токеном
          this.setTokens(response.access, newRefreshToken);
          console.log('[refreshTokenAction] Tokens updated successfully.');
          return true;
        } else {
          console.error(
            '[refreshTokenAction] Access token missing in refresh response.'
          );
          throw new Error('Access token missing in refresh response');
        }
      } catch (error: any) {
        console.error(
          '[refreshTokenAction] Refresh failed:',
          getErrorMessage(error),
          error
        );
        // Если refresh упал (например, 401), то logout будет вызван из fetchUserProfile
        // или из интерцептора ответа, если мы его оставим
        return false; // Возвращаем false, чтобы вызывающий код знал об ошибке
      }
    },

    async initializeAuth() {
      if (this.isInitialized) {
        console.log('[initializeAuth] Already initialized.');
        return;
      }
      console.log('[initializeAuth] Initializing authentication...');
      this.status = 'loading';

      const storedAccessToken: string | null =
        localStorage.getItem('accessToken');
      const storedRefreshToken: string | null =
        localStorage.getItem('refreshToken');

      // --- ИСПРАВЛЕНИЕ: Проверяем наличие ОБОИХ токенов ---
      if (storedAccessToken && storedRefreshToken) {
        // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
        console.log('[initializeAuth] Both tokens found in storage.');
        // Теперь можно безопасно вызывать setTokens
        this.setTokens(storedAccessToken, storedRefreshToken); // Передаем string, string

        // Пытаемся загрузить профиль
        console.log('[initializeAuth] Attempting to fetch user profile...');
        await this.fetchUserProfile();
        if (this.user) {
          // Проверяем статус this.user после fetchUserProfile
          console.log(
            '[initializeAuth] Profile loaded. Connecting WebSocket...'
          );
          const notificationsStore = useNotificationsStore();
          notificationsStore.connectWebSocket(); // <--- Подключаем WS
        }
      } else {
        console.log(
          '[initializeAuth] Access or Refresh token (or both) not found in storage.'
        );
        if (storedAccessToken && !storedRefreshToken) {
          // Странная ситуация - есть access, но нет refresh. Лучше очистить.
          console.warn(
            '[initializeAuth] Access token found, but refresh token is missing. Clearing tokens.'
          );
        }
        if (!storedAccessToken && storedRefreshToken) {
          // Тоже странно - есть refresh, но нет access. Очищаем.
          console.warn(
            '[initializeAuth] Refresh token found, but access token is missing. Clearing tokens.'
          );
        }
        this.clearTokens(); // Очищаем все, если хотя бы одного токена нет
        this.user = null;
        this.status = 'idle';
      }

      this.isInitialized = true;
      console.log(
        `[initializeAuth] Finished. Status: ${this.status}, User loaded: ${!!this.user}, Initialized: ${this.isInitialized}`
      );
    },

    logout() {
      // Предотвращаем множественные вызовы logout, если он уже идет
      if (this.status === 'idle' && !this.accessToken && !this.user) {
        console.warn('[logout] Already logged out or in idle state.');
        return;
      }
      console.log('[logout] Disconnecting WebSocket...');
      const notificationsStore = useNotificationsStore();
      notificationsStore.disconnectWebSocket(); // <--- Отключаем WS ПЕРЕД очисткой токенов

      console.log('[logout] Logging out...');
      this.clearTokens();
      this.user = null;
      this.status = 'idle'; // Устанавливаем статус idle при выходе
      this.error = null;
      this.isInitialized = false; // Сбрасываем инициализацию при выходе

      // Перенаправляем на страницу входа ИЗБЕГАЯ рекурсии гарда
      // Проверяем, что мы еще не на странице логина
      if (router.currentRoute.value.name !== 'Login') {
        console.log('[logout] Redirecting to Login page.');
        router.replace({ name: 'Login' });
      } else {
        console.log('[logout] Already on Login page.');
      }
    },
  },
});
