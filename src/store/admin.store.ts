// src/store/admin.store.ts
import { defineStore } from 'pinia';
import {
    ScheduleService, // <-- Добавляем сервис расписания
    NewsService, 
    UsersService, // Сервис содержит и админские методы
    type User,
    type Classroom, 
    type ClassroomRequest,
    
    type InvitationCode,
    type InvitationCodeRequest,
    type PatchedInvitationCodeRequest, // Для PATCH
    ApiError
} from '@/services/generated';
import { getErrorMessage } from './_helpers';

interface AdminState {
  users: User[];
  invitations: InvitationCode[];
  isLoadingUsers: boolean;
  isLoadingInvitations: boolean;
  errorUsers: string | null;
  errorInvitations: string | null;
  // Можно добавить состояние для отдельного пользователя/приглашения при редактировании
  // currentInvitation: InvitationCode | null;
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    users: [],
    invitations: [],
    isLoadingUsers: false,
    isLoadingInvitations: false,
    errorUsers: null,
    errorInvitations: null,
    // currentInvitation: null,
  }),

  getters: {
    getUsers: (state): User[] => state.users,
    getInvitations: (state): InvitationCode[] => state.invitations,
    // Можно добавить геттер для подсчета активных приглашений
    getActiveInvitationCount: (state): number => {
        return state.invitations.filter(inv => inv.is_valid).length; // is_valid - строка 'true'/'false'? Проверить тип
        // Если is_valid boolean: return state.invitations.filter(inv => inv.is_valid).length;
    },
  },

  actions: {
    // --- Пользователи ---
    async fetchUsers() {
      if (this.isLoadingUsers) return;
      console.log('[adminStore] Fetching users...');
      this.isLoadingUsers = true;
      this.errorUsers = null;
      try {
        // Вызываем админский метод для получения списка пользователей
        const response = await UsersService.usersAdminUsersList();
        this.users = response;
        console.log(`[adminStore] Fetched ${response.length} users.`);
      } catch (error: any) {
        console.error('[adminStore] Failed to fetch users:', getErrorMessage(error), error);
        this.errorUsers = getErrorMessage(error) || 'Failed to load users';
        this.users = [];
      } finally {
        this.isLoadingUsers = false;
      }
    },

    // --- Приглашения ---
    async fetchInvitations() {
        if (this.isLoadingInvitations) return;
        console.log('[adminStore] Fetching invitations...');
        this.isLoadingInvitations = true;
        this.errorInvitations = null;
        try {
            // Вызываем админский метод для получения списка приглашений
            const response = await UsersService.usersAdminInvitationsList();
            // Сортируем (например, неиспользованные и свежие сверху)
            this.invitations = response.sort((a, b) => {
                 const aIsValid = a.is_valid; // Проверить тип is_valid
                 const bIsValid = b.is_valid;
                 if (aIsValid && !bIsValid) return -1;
                 if (!aIsValid && bIsValid) return 1;
                 // Если оба валидны или не валидны, сортируем по дате создания (новые сверху)
                 return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            console.log(`[adminStore] Fetched ${response.length} invitations.`);
        } catch (error: any) {
            console.error('[adminStore] Failed to fetch invitations:', getErrorMessage(error), error);
            this.errorInvitations = getErrorMessage(error) || 'Failed to load invitations';
            this.invitations = [];
        } finally {
            this.isLoadingInvitations = false;
        }
    },

    async createInvitation(invitationData: InvitationCodeRequest): Promise<InvitationCode | null> {
        console.log('[adminStore] Creating invitation...');
        this.isLoadingInvitations = true; // Используем общий флаг загрузки для приглашений
        this.errorInvitations = null;
        try {
            const newInvitation = await UsersService.usersAdminInvitationsCreate(invitationData);
            console.log('[adminStore] Invitation created:', newInvitation);
            // Добавляем новое приглашение в начало списка
            this.invitations.unshift(newInvitation);
            // Пересортируем список
            this.invitations.sort((a, b) => { /* ... логика сортировки ... */ });
            return newInvitation;
        } catch (error: any) {
            console.error('[adminStore] Failed to create invitation:', getErrorMessage(error), error);
            this.errorInvitations = getErrorMessage(error) || 'Failed to create invitation';
            return null;
        } finally {
            this.isLoadingInvitations = false;
        }
    },

    async deleteInvitation(invitationId: number | string): Promise<boolean> {
         // ID может быть строкой (UUID?) или числом? Проверить тип InvitationCode.id
         // Метод destroy ожидает ID как параметр пути string
         const idString = String(invitationId);
         console.log(`[adminStore] Deleting invitation ${idString}...`);
         this.isLoadingInvitations = true;
         this.errorInvitations = null; // Можно сделать отдельную ошибку удаления
         try {
             await UsersService.usersAdminInvitationsDestroy({ id: idString });
             console.log(`[adminStore] Invitation ${idString} deleted.`);
             // Удаляем приглашение из списка
             this.invitations = this.invitations.filter(inv => String(inv.id) !== idString);
             return true;
         } catch (error: any) {
             console.error(`[adminStore] Failed to delete invitation ${idString}:`, getErrorMessage(error), error);
             this.errorInvitations = getErrorMessage(error) || `Failed to delete invitation ${idString}`;
             return false;
         } finally {
              this.isLoadingInvitations = false;
         }
    },

    // Опционально: Методы для retrieve, update, partial_update приглашения, если нужно редактирование
    // async fetchInvitationById(id: string) { ... }
    // async updateInvitation(id: string, data: InvitationCodeRequest) { ... }
    // async patchInvitation(id: string, data: PatchedInvitationCodeRequest) { ... }

     // Опционально: метод для очистки состояния админки при выходе админа
     clearAdminState() {
         this.users = [];
         this.invitations = [];
         this.errorUsers = null;
         this.errorInvitations = null;
         // this.currentInvitation = null;
     }
  },
});