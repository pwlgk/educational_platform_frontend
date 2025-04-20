// src/store/user.store.ts
import { defineStore } from 'pinia';
import {
    UsersService, // Используем сервис пользователей
    type User,
    ApiError
} from '@/services/generated';
import { getErrorMessage } from './_helpers';
import { useAuthStore } from './auth.store'; // Для ID текущего пользователя

interface UserState {
  searchResults: User[];
  isLoadingSearch: boolean;
  errorSearch: string | null;
  // Опционально: для хранения профилей других пользователей, если будем их загружать
  // viewedUserProfile: User | null;
  // isLoadingViewedProfile: boolean;
  // errorViewedProfile: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    searchResults: [],
    isLoadingSearch: false,
    errorSearch: null,
    // viewedUserProfile: null,
    // isLoadingViewedProfile: false,
    // errorViewedProfile: null,
  }),

  getters: {
    getSearchResults: (state): User[] => state.searchResults,
    getIsLoadingSearch: (state): boolean => state.isLoadingSearch,
    getSearchError: (state): string | null => state.errorSearch,
    // getCurrentlyViewedProfile: (state) => state.viewedUserProfile,
  },

  actions: {
    // --- Поиск пользователей ---
    async searchUsers(searchTerm: string) {
      // Минимальная длина для поиска
      if (!searchTerm || searchTerm.trim().length < 2) {
          this.searchResults = [];
          this.isLoadingSearch = false;
          return;
      }
      if (this.isLoadingSearch) return;

      console.log(`[userStore] Searching users with term: "${searchTerm}"`);
      this.isLoadingSearch = true;
      this.errorSearch = null;
      try {
           // Используем UserViewSet для поиска (доступен всем аутентифицированным)
           const response = await UsersService.usersUsersList({ search: searchTerm });
           // Фильтрация самого себя уже происходит на бэкенде в UserViewSet.get_queryset
           this.searchResults = response;
           console.log(`[userStore] Found ${response.length} users.`);
      } catch (error: any) {
           console.error('[userStore] Failed to search users:', getErrorMessage(error), error);
           this.errorSearch = getErrorMessage(error) || 'Failed to search users';
           this.searchResults = [];
      } finally {
           this.isLoadingSearch = false;
      }
    },

    // Очистка результатов поиска
    clearUserSearch() {
        this.searchResults = [];
        this.errorSearch = null;
        this.isLoadingSearch = false;
    }

    // Опционально: Загрузка профиля другого пользователя по ID (если нужно будет)
    /*
    async fetchUserProfileById(userId: number) {
        if (this.isLoadingViewedProfile) return;
        console.log(`[userStore] Fetching profile for user ${userId}`);
        this.isLoadingViewedProfile = true;
        this.errorViewedProfile = null;
        this.viewedUserProfile = null;
        try {
            // Используем АДМИНСКИЙ эндпоинт для получения данных любого пользователя
            // Убедитесь, что текущий пользователь - админ перед вызовом!
            const authStore = useAuthStore();
            if (!authStore.isAdmin) {
                 throw new Error("Permission denied to view other user profiles.");
            }
            // Метод из AdminUserViewSet (если он есть в UsersService или отдельном AdminUsersService)
            const response = await UsersService.usersAdminUsersRetrieve({ id: userId }); // Или AdminUsersService.retrieve...
            this.viewedUserProfile = response;
            console.log(`[userStore] Fetched profile for user ${userId}`);
        } catch (error: any) {
            console.error(`[userStore] Failed to fetch profile for user ${userId}:`, getErrorMessage(error), error);
            this.errorViewedProfile = getErrorMessage(error) || 'Failed to load user profile';
        } finally {
             this.isLoadingViewedProfile = false;
        }
    }
    */
  },
});