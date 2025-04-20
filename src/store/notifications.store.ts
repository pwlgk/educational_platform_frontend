// src/store/notifications.store.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth.store';
import axios from 'axios'; 

import {
    NotificationsService,
    OpenAPI,
    type Notification,
    type UserNotificationSettings,
    type UserNotificationSettingsRequest,
    ApiError, // Убедитесь, что ApiError импортирован
} from '@/services/generated';
import { getErrorMessage } from './_helpers';
import { WEBSOCKET_URL } from '@/services/config';

interface NotificationsState {
  notifications: Notification[];
  settings: UserNotificationSettings | null;
  isLoadingList: boolean;
  isLoadingSettings: boolean;
  errorList: string | null;
  errorSettings: string | null;
  isWebSocketConnected: boolean;
  webSocket: WebSocket | null;
  // --- ИСПРАВЛЕНИЕ: Убедитесь, что тип number | null ---
  wsReconnectTimeoutId: number | null; // ID для таймера переподключения
  // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
}
const WS_RECONNECT_DELAY = 5000;

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: [],
    settings: null,
    isLoadingList: false,
    isLoadingSettings: false,
    errorList: null,
    errorSettings: null,
    isWebSocketConnected: false,
    webSocket: null,
    wsReconnectTimeoutId: null, // Начальное значение null
}),

  getters: {
    getNotifications: (state): Notification[] => state.notifications,
    getSettings: (state): UserNotificationSettings | null => state.settings,
    getUnreadCount: (state): number => {
      return state.notifications.filter(n => !n.is_read).length;
    },
    getListLoading: (state): boolean => state.isLoadingList,
    getSettingsLoading: (state): boolean => state.isLoadingSettings,
    getWebSocketStatus: (state): boolean => state.isWebSocketConnected,
  },

  actions: {
    // --- REST API Actions ---

    async fetchNotifications() {
      if (this.isLoadingList) return;
      console.log('[notificationsStore] Fetching notifications...');
      this.isLoadingList = true;
      this.errorList = null;
      try {
        const response = await NotificationsService.notificationsListList();
        this.notifications = response.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        console.log('[notificationsStore] Notifications fetched:', this.notifications.length);
      } catch (error: any) {
        console.error('[notificationsStore] Failed to fetch notifications:', getErrorMessage(error), error);
        this.errorList = getErrorMessage(error) || 'Failed to load notifications';
        this.notifications = [];
      } finally {
        this.isLoadingList = false;
      }
    },

    async fetchSettings() {
       if (this.isLoadingSettings) return;
      console.log('[notificationsStore] Fetching settings...');
      this.isLoadingSettings = true;
      this.errorSettings = null;
      try {
        const response = await NotificationsService.notificationsSettingsRetrieve();
        this.settings = response;
        console.log('[notificationsStore] Settings fetched:', this.settings);
      } catch (error: any) {
        console.error('[notificationsStore] Failed to fetch settings:', getErrorMessage(error), error);
        this.errorSettings = getErrorMessage(error) || 'Failed to load settings';
        this.settings = null;
      } finally {
        this.isLoadingSettings = false;
      }
    },

    async updateSettings(newSettings: UserNotificationSettingsRequest) {
       console.log('[notificationsStore] Updating settings...');
      this.isLoadingSettings = true;
      this.errorSettings = null;
      try {
        const response = await NotificationsService.notificationsSettingsPartialUpdate(
          newSettings // <--- Передаем тело запроса напрямую
      );
        this.settings = response;
        console.log('[notificationsStore] Settings updated.');
        return true;
      } catch (error: any) {
        console.error('[notificationsStore] Failed to update settings:', getErrorMessage(error), error);
        this.errorSettings = getErrorMessage(error) || 'Failed to update settings';
        return false;
      } finally {
        this.isLoadingSettings = false;
      }
    },

    async _updateNotificationReadStatus(notificationId: number, targetStatus: boolean, serviceMethod: Function) {
      console.log(`[notificationsStore] Setting notification ${notificationId} read status to ${targetStatus}...`);
      const notification = this.notifications.find(n => n.id === notificationId);
      const originalStatus = notification?.is_read;

      if (!notification) {
           console.warn(`[notificationsStore] Notification ${notificationId} not found for status update.`);
           return;
      }

      if (notification.is_read !== targetStatus) {
          notification.is_read = targetStatus;
      }

      try {
           // --- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ: Передаем ID как СТРОКУ первым аргументом ---
           // Метод ожидает id: string, requestBody?: NotificationRequest
           // Передаем ID, преобразованный в строку, и undefined для requestBody
           await serviceMethod(
               String(notificationId), // <--- Преобразуем ID в строку
               undefined // <--- Явно передаем undefined для необязательного requestBody
               // Или можно передать пустой объект, если API это допускает:
               // {}
           );
           // --- КОНЕЦ ФИНАЛЬНОГО ИСПРАВЛЕНИЯ ---

           console.log(`[notificationsStore] Notification ${notificationId} status updated successfully.`);
      } catch (error: any) {
           console.error(`[notificationsStore] Failed to update notification ${notificationId} status:`, getErrorMessage(error), error);
           if (notification && originalStatus !== undefined && notification.is_read !== originalStatus) {
               notification.is_read = originalStatus;
           }
           this.errorList = getErrorMessage(error) || 'Failed to update notification status';
      }
  },

  markAsRead(notificationId: number) {
    this._updateNotificationReadStatus(notificationId, true, NotificationsService.notificationsListMarkReadCreate);
},

markAsUnread(notificationId: number) {
   this._updateNotificationReadStatus(notificationId, false, NotificationsService.notificationsListMarkUnreadCreate);
},

async markAllAsRead() {
  console.log('[notificationsStore] Marking all as read...');
  const originalNotifications = JSON.parse(JSON.stringify(this.notifications));
  let changed = false;
  this.notifications.forEach(n => {
      if (!n.is_read) {
          n.is_read = true;
          changed = true;
      }
  });
  if (!changed) {
      console.log('[notificationsStore] No unread notifications to mark.');
      return;
  }
  try {
      // Этот метод ожидает только requestBody?: NotificationRequest
      await NotificationsService.notificationsListMarkAllReadCreate(
          undefined // Передаем undefined для необязательного requestBody
          // Или {}
      );
      console.log('[notificationsStore] All notifications marked as read successfully.');
  } catch (error: any) {
       console.error('[notificationsStore] Failed to mark all as read:', getErrorMessage(error), error);
       this.notifications = originalNotifications;
       this.errorList = getErrorMessage(error) || 'Failed to mark all as read';
  }
},



    // --- WebSocket Actions ---

    connectWebSocket() {
      const authStore = useAuthStore();
      const token = authStore.accessToken;

      if (!token) {
        console.warn('[notificationsStore] WS: Cannot connect without auth token.');
        return;
      }
       if (this.webSocket && (this.webSocket.readyState === WebSocket.CONNECTING || this.webSocket.readyState === WebSocket.OPEN)) {
           console.log('[notificationsStore] WS: Already connected or connecting.');
           return;
       }
       if(this.wsReconnectTimeoutId) {
           clearTimeout(this.wsReconnectTimeoutId);
           this.wsReconnectTimeoutId = null;
       }

      // Адаптируйте URL под ваш бэкенд
      const wsUrl = `${WEBSOCKET_URL}/notifications/?token=${token}`; // Пример
      console.log(`[notificationsStore] WS: Connecting to ${wsUrl}...`);
      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        console.log('[notificationsStore] WS: Connection opened.');
        this.isWebSocketConnected = true;
         if(this.wsReconnectTimeoutId) {
             clearTimeout(this.wsReconnectTimeoutId);
             this.wsReconnectTimeoutId = null;
         }
      };

      this.webSocket.onmessage = (event) => {
        console.log('[notificationsStore] WS: Message received:', event.data);
        try {
          const messageData = JSON.parse(event.data);
          // Адаптируйте обработку под формат ваших сообщений
          if (messageData.type === 'new_notification' && messageData.payload) {
              this.handleNewNotification(messageData.payload as Notification);
          } else if (messageData.type === 'notification_update' && messageData.payload) {
              this.handleNotificationUpdate(messageData.payload as Notification);
          } else if (typeof messageData === 'object' && messageData.id && messageData.message) {
              this.handleNewNotification(messageData as Notification);
          }
           else {
              console.warn('[notificationsStore] WS: Received unknown message format:', messageData);
           }
        } catch (error) {
          console.error('[notificationsStore] WS: Failed to parse message:', error);
        }
      };

      this.webSocket.onerror = (error) => {
        console.error('[notificationsStore] WS: Error:', error);
        this.isWebSocketConnected = false;
      };

      this.webSocket.onclose = (event) => {
        console.log(`[notificationsStore] WS: Connection closed. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        this.isWebSocketConnected = false;
        this.webSocket = null;

        const authStore = useAuthStore();
        // Переподключаемся только если пользователь все еще авторизован и закрытие было не по нашей инициативе (код не 1000)
        if (authStore.isAuthenticated && event.code !== 1000) {
            console.log(`[notificationsStore] WS: Attempting reconnect in ${WS_RECONNECT_DELAY / 1000}s...`);
            if(this.wsReconnectTimeoutId !== null) clearTimeout(this.wsReconnectTimeoutId); // Очищаем предыдущий
            this.wsReconnectTimeoutId = setTimeout(() => { // setTimeout вернет number
                 console.log('[notificationsStore] WS: Reconnecting now...');
                 this.connectWebSocket();
            }, WS_RECONNECT_DELAY);
        } else if (!authStore.isAuthenticated) {
            console.log('[notificationsStore] WS: Not reconnecting, user is logged out.');
        } else {
             console.log('[notificationsStore] WS: Connection closed normally, not reconnecting.');
        }
      };
    },

    disconnectWebSocket() {
      if (this.webSocket) {
        console.log('[notificationsStore] WS: Closing connection intentionally.');
         if(this.wsReconnectTimeoutId) {
             clearTimeout(this.wsReconnectTimeoutId);
             this.wsReconnectTimeoutId = null;
         }
        this.webSocket.close(1000, 'User action or logout'); // Код 1000 - нормальное закрытие
      }
       // Состояние обновится в onclose
       // this.isWebSocketConnected = false; // Можно установить сразу
    },

    // Обработчики сообщений от WS
    handleNewNotification(newNotification: Notification) {
       console.log('[notificationsStore] Handling new notification:', newNotification);
       const exists = this.notifications.some(n => n.id === newNotification.id);
       if (!exists) {
           // Добавляем в начало и сортируем (на случай если порядок важен)
           this.notifications.unshift(newNotification);
            this.notifications.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
           console.log('[notificationsStore] New notification added.');
       } else {
            console.warn('[notificationsStore] Received duplicate new notification ID:', newNotification.id);
            this.handleNotificationUpdate(newNotification);
       }
    },

    handleNotificationUpdate(updatedNotification: Notification) {
        console.log('[notificationsStore] Handling notification update:', updatedNotification);
        const index = this.notifications.findIndex(n => n.id === updatedNotification.id);
        if (index !== -1) {
             this.notifications.splice(index, 1, updatedNotification);
             // Пересортируем на случай если изменилась дата (маловероятно для update)
              this.notifications.sort((a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            console.log('[notificationsStore] Notification updated.');
        } else {
             console.warn('[notificationsStore] Received update for non-existing notification ID:', updatedNotification.id, 'Adding as new.');
             this.handleNewNotification(updatedNotification);
        }
    },
  },
});

// --- Не забудьте хелпер getErrorMessage (либо здесь, либо в _helpers.ts) ---
// import axios from 'axios'; // Нужен для getErrorMessage
// export function getErrorMessage(error: any): string { ... }