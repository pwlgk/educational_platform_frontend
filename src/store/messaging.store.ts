// src/store/messaging.store.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth.store'; // Для получения токена
import {
    MessagingService,
    type Chat,
    type Message,
    type ChatRequest,
    type PatchedChatRequest,
    type MessageRequest,
    ApiError,
    type User // Убедитесь, что импортирован
} from '@/services/generated';
import { getErrorMessage } from './_helpers'; // Убедитесь, что хелпер существует и импортирован
import { WEBSOCKET_URL } from '@/services/config'; // Базовый WS URL
import { format, isToday } from 'date-fns'; // Для возможного использования
import axios from 'axios'; // Нужен для isAxiosError в getErrorMessage

interface MessagingState {
  chats: Chat[];
  activeChatId: number | string | null;
  activeChatMessages: Message[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isCreatingChat: boolean;
  errorChats: string | null;
  errorMessages: string | null;
  errorSending: string | null;
  errorCreatingChat: string | null;
  // WebSocket State (для активного чата)
  activeChatWebSocket: WebSocket | null;
  isConnectingWebSocket: boolean;
  webSocketError: string | null;
  // Состояния для действий с чатом
  isUpdatingChat: boolean;
  errorChatAction: string | null;
}

const WS_RECONNECT_DELAY = 5000; // 5 секунд

export const useMessagingStore = defineStore('messaging', {
  state: (): MessagingState => ({
    chats: [],
    activeChatId: null,
    activeChatMessages: [],
    isLoadingChats: false,
    isLoadingMessages: false,
    isSendingMessage: false,
    isCreatingChat: false,
    errorChats: null,
    errorMessages: null,
    errorSending: null,
    errorCreatingChat: null,
    // WebSocket State
    activeChatWebSocket: null,
    isConnectingWebSocket: false,
    webSocketError: null,
    // Chat Actions State
    isUpdatingChat: false,
    errorChatAction: null,
  }),

  getters: {
    getChats: (state): Chat[] => state.chats,
    getActiveChatId: (state): number | string | null => state.activeChatId,
    getActiveChatMessages: (state): Message[] => state.activeChatMessages,
    getActiveChat: (state): Chat | undefined => {
        if (!state.activeChatId) return undefined;
        return state.chats.find(chat => String(chat.id) === String(state.activeChatId));
    },
    getIsLoadingChats: (state): boolean => state.isLoadingChats,
    getIsLoadingMessages: (state): boolean => state.isLoadingMessages,
    // Статус WS соединения активного чата
    getIsWebSocketConnected: (state): boolean =>
        !!state.activeChatWebSocket && state.activeChatWebSocket.readyState === WebSocket.OPEN,
    getWebSocketError: (state): string | null => state.webSocketError,
    // Права на редактирование (пример)
    canEditActiveChat: (state): boolean => {
        const activeChat = state.chats.find(c => String(c.id) === String(state.activeChatId));
        // Редактировать можно только групповые чаты (и, возможно, только админ/создатель)
        return !!activeChat && activeChat.chat_type === 'GROUP';
    },
    // Участники активного чата
    getActiveChatParticipants: (state): User[] => {
        const activeChat = state.chats.find(c => String(c.id) === String(state.activeChatId));
        // Убедитесь, что тип Chat содержит participants: User[] или participants_details
        // Используем participants_details если он есть и содержит пользователей
        if (activeChat && Array.isArray(activeChat.participants_details)) {
            // Если participants_details это массив объектов User
            return activeChat.participants_details as User[];
        }
        // Если participants это массив ID или нет нужного поля
        // return []; // Или загружать отдельно
        // Предположим, что participants содержит User[]
         return activeChat?.participants ?? [];
    },
    getIsUpdatingChat: (state): boolean => state.isUpdatingChat,
    getChatActionError: (state): string | null => state.errorChatAction,
  },

  actions: {
    // --- Чаты ---
    async fetchChats() {
      if (this.isLoadingChats) return;
      console.log('[messagingStore] Fetching chats...');
      this.isLoadingChats = true;
      this.errorChats = null;
      try {
        const response = await MessagingService.messagingChatsList();
        this.chats = response.sort((a, b) => {
            const dateA = a.last_message_details?.timestamp ? new Date(a.last_message_details.timestamp).getTime() : 0;
            const dateB = b.last_message_details?.timestamp ? new Date(b.last_message_details.timestamp).getTime() : 0;
            return dateB - dateA; // Новые сверху
        });
        console.log(`[messagingStore] Fetched ${this.chats.length} chats.`);
      } catch (error: any) {
        console.error('[messagingStore] Failed to fetch chats:', getErrorMessage(error), error);
        this.errorChats = getErrorMessage(error) || 'Failed to load chats';
        this.chats = [];
      } finally {
        this.isLoadingChats = false;
      }
    },

    async createChat(chatData: ChatRequest): Promise<Chat | null> {
        if (this.isCreatingChat) return null;
        console.log('[messagingStore] Creating chat...', chatData);
        this.isCreatingChat = true;
        this.errorCreatingChat = null;
        try {
            // Передаем chatData напрямую
            const newChat = await MessagingService.messagingChatsCreate(chatData);
            console.log('[messagingStore] Chat created:', newChat);
            this.chats.unshift(newChat);
            // Пересортировываем
            this.chats.sort((a, b) => {
                const dateA = a.last_message_details?.timestamp ? new Date(a.last_message_details.timestamp).getTime() : 0;
                const dateB = b.last_message_details?.timestamp ? new Date(b.last_message_details.timestamp).getTime() : 0;
                return dateB - dateA;
            });
            return newChat;
        } catch (error: any) {
             console.error('[messagingStore] Failed to create chat:', getErrorMessage(error), error);
             this.errorCreatingChat = getErrorMessage(error) || 'Failed to create chat';
             return null;
        } finally {
             this.isCreatingChat = false;
        }
    },

    // Обновление названия чата
    async updateChatName(chatId: number | string, newName: string): Promise<boolean> {
        const chat = this.chats.find(c => String(c.id) === String(chatId));
        // Простая проверка - можно редактировать только группы
        if (!chat || chat.chat_type !== 'GROUP' || this.isUpdatingChat) return false;

        console.log(`[messagingStore] Updating name for chat ${chatId} to "${newName}"`);
        this.isUpdatingChat = true;
        this.errorChatAction = null;
        const chatPk = String(chatId); // API ожидает строку

        try {
            // Тип для PATCH может быть PatchedChatRequest
            const requestBody: PatchedChatRequest = { name: newName };
            // Передаем ID первым, тело вторым
            const updatedChat = await MessagingService.messagingChatsPartialUpdate(chatPk, requestBody);
            console.log(`[messagingStore] Chat ${chatId} name updated.`);
            this._updateChatInList(updatedChat); // Обновляем чат в списке
            return true;
        } catch (error: any) {
            console.error(`[messagingStore] Failed to update chat ${chatId} name:`, getErrorMessage(error), error);
            this.errorChatAction = getErrorMessage(error) || 'Failed to update chat name';
            return false;
        } finally {
            this.isUpdatingChat = false;
        }
    },

    // Добавление участника
    async addParticipant(chatId: number | string, userIdToAdd: number): Promise<boolean> {
         // TODO: Проверка прав (например, из объекта Chat, если там есть поле is_admin или creator_id)
         if (this.isUpdatingChat) return false;
         console.log(`[messagingStore] Adding user ${userIdToAdd} to chat ${chatId}...`);
         this.isUpdatingChat = true;
         this.errorChatAction = null;
         const chatPk = String(chatId);

         try {
             // API ожидает ChatRequest с полем user_id
             // Убедитесь, что тип ChatRequest содержит user_id: number
             const requestBody: ChatRequest = { user_id: userIdToAdd };
             // Передаем ID чата первым, тело вторым
             const updatedChat = await MessagingService.messagingChatsAddParticipantCreate(chatPk, requestBody);
             console.log(`[messagingStore] User ${userIdToAdd} added to chat ${chatId}.`);
             this._updateChatInList(updatedChat); // Обновляем чат новыми данными (включая participants)
             return true;
         } catch (error: any) {
             console.error(`[messagingStore] Failed to add participant ${userIdToAdd} to chat ${chatId}:`, getErrorMessage(error), error);
             this.errorChatAction = getErrorMessage(error) || 'Failed to add participant';
             return false;
         } finally {
              this.isUpdatingChat = false;
         }
    },

     // Удаление участника
     async removeParticipant(chatId: number | string, userIdToRemove: number): Promise<boolean> {
         // TODO: Проверка прав
         if (this.isUpdatingChat) return false;
         console.log(`[messagingStore] Removing user ${userIdToRemove} from chat ${chatId}...`);
         this.isUpdatingChat = true;
         this.errorChatAction = null;
         const chatPk = String(chatId);

         try {
             const requestBody: ChatRequest = { user_id: userIdToRemove };
             // Передаем ID чата первым, тело вторым
             const updatedChat = await MessagingService.messagingChatsRemoveParticipantCreate(chatPk, requestBody);
             console.log(`[messagingStore] User ${userIdToRemove} removed from chat ${chatId}.`);
             this._updateChatInList(updatedChat); // Обновляем чат
             return true;
         } catch (error: any) {
              console.error(`[messagingStore] Failed to remove participant ${userIdToRemove} from chat ${chatId}:`, getErrorMessage(error), error);
              this.errorChatAction = getErrorMessage(error) || 'Failed to remove participant';
              return false;
         } finally {
              this.isUpdatingChat = false;
         }
    },

    // Пометка чата прочитанным
    async markChatAsRead(chatId: number | string) {
        console.log(`[messagingStore] Marking chat ${chatId} as read...`);
        const chatPk = String(chatId);
        // Оптимистично обновляем счетчик в UI
        const chat = this.chats.find(c => String(c.id) === chatPk);
        let originalUnreadCount: number | undefined | null = null;
         if (chat) {
             originalUnreadCount = chat.unread_count; // Сохраняем для возможного отката
             chat.unread_count = 0;
         }

        try {
            // Вызываем API, requestBody не нужен или пустой
            // Убедитесь, что тип ChatRequest необязательный или пустой
            await MessagingService.messagingChatsMarkReadCreate(chatPk, undefined); // или {}
            console.log(`[messagingStore] Chat ${chatId} marked as read via API.`);
            // UI уже обновлен оптимистично
        } catch (error: any) {
             console.error(`[messagingStore] Failed to mark chat ${chatId} as read:`, getErrorMessage(error), error);
             // Откатываем оптимистичное обновление
              if (chat && originalUnreadCount !== null && originalUnreadCount !== undefined) {
                 chat.unread_count = originalUnreadCount;
             }
             // Можно показать ошибку
             this.errorChatAction = getErrorMessage(error) || 'Failed to mark chat as read';
        }
    },


    // --- Сообщения и WebSocket ---
    async setActiveChat(chatId: number | string | null) {
        const currentActiveStr = this.activeChatId !== null ? String(this.activeChatId) : null;
        const newActiveStr = chatId !== null ? String(chatId) : null;

        if (currentActiveStr === newActiveStr) {
             console.log(`[messagingStore] Chat ${chatId} is already active.`);
             return;
        }

        if (this.activeChatWebSocket) {
            this.disconnectActiveChatWebSocket(true);
        }

        console.log(`[messagingStore] Setting active chat to ${newActiveStr}`);
        this.activeChatId = chatId;
        this.activeChatMessages = [];
        this.errorMessages = null;
        this.webSocketError = null;

        if (newActiveStr !== null) {
            await this.fetchMessages(newActiveStr);
            if (!this.errorMessages) {
                this.connectActiveChatWebSocket(newActiveStr);
                // Помечаем как прочитанный после загрузки и подключения
                await this.markChatAsRead(newActiveStr);
            }
        }
    },

    async fetchMessages(chatId: number | string) {
        if (this.isLoadingMessages || String(this.activeChatId) !== String(chatId)) return;
        console.log(`[messagingStore] Fetching messages for active chat ${chatId}`);
        this.isLoadingMessages = true;
        this.errorMessages = null;
        try {
            const chatPkString = String(chatId);
            const response = await MessagingService.messagingChatsMessagesList(chatPkString);
            this.activeChatMessages = response.sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() // Старые сверху
            );
            console.log(`[messagingStore] Fetched ${this.activeChatMessages.length} messages for chat ${chatId}`);
        } catch (error: any) {
            console.error(`[messagingStore] Failed to fetch messages for chat ${chatId}:`, getErrorMessage(error), error);
            this.errorMessages = getErrorMessage(error) || 'Failed to load messages';
            this.activeChatMessages = [];
        } finally {
            this.isLoadingMessages = false;
        }
    },

    async sendMessage(chatId: number | string, content: string): Promise<boolean> {
        if (this.isSendingMessage) return false;
        console.log(`[messagingStore] Sending message to chat ${chatId}`);
        this.isSendingMessage = true;
        this.errorSending = null;

        // Убедитесь, что тип 'chat' в MessageRequest это number
        const messageData: MessageRequest = {
            chat: Number(chatId),
            content: content,
        };

        try {
            const chatPkString = String(chatId);
            const sentMessage: Message = await MessagingService.messagingChatsMessagesCreate(
                chatPkString,
                messageData
            );
            console.log('[messagingStore] Message sent successfully via API:', sentMessage);
            // Ждем ответа WS
            this._updateChatLastMessage(chatId, sentMessage); // Обновляем инфо в списке чатов
            return true;
        } catch (error: any) {
             console.error(`[messagingStore] Failed to send message to chat ${chatId}:`, getErrorMessage(error), error);
             this.errorSending = getErrorMessage(error) || 'Failed to send message';
             return false;
        } finally {
             this.isSendingMessage = false;
        }
    },

    // --- WebSocket Actions (для активного чата) ---
    connectActiveChatWebSocket(chatId: string | number) {
      const authStore = useAuthStore();
      const token = authStore.accessToken;
      const chatPk = String(chatId);

      if (!token) {
        console.warn('[messagingStore] WS: Cannot connect without auth token.');
        return;
      }
      if (this.activeChatWebSocket || this.isConnectingWebSocket) {
           if(String(this.activeChatId) === chatPk && this.activeChatWebSocket?.readyState !== WebSocket.CLOSED) {
                console.log(`[messagingStore] WS: Already connected or connecting to chat ${chatPk}.`);
                return;
           }
           this.disconnectActiveChatWebSocket(true);
      }

      const wsUrl = `${WEBSOCKET_URL}/chat/${chatPk}/?token=${token}`;
      console.log(`[messagingStore] WS: Connecting to ${wsUrl} for chat ${chatPk}...`);

      this.isConnectingWebSocket = true;
      this.webSocketError = null;
      try {
           this.activeChatWebSocket = new WebSocket(wsUrl);
      } catch (error) {
           console.error(`[messagingStore] WS: Error creating WebSocket instance for chat ${chatPk}:`, error);
           this.isConnectingWebSocket = false;
           this.webSocketError = 'Failed to create WebSocket.';
           this.activeChatWebSocket = null;
           return;
      }

      this.activeChatWebSocket.onopen = () => {
        if (String(this.activeChatId) === chatPk) {
            console.log(`[messagingStore] WS: Connection opened for chat ${chatPk}.`);
            this.isConnectingWebSocket = false;
            this.webSocketError = null;
        } else {
             console.warn(`[messagingStore] WS: Connection opened for chat ${chatPk}, but active chat changed to ${this.activeChatId}. Closing.`);
             this.activeChatWebSocket?.close(1000, 'Chat switched during connection');
        }
      };

      this.activeChatWebSocket.onmessage = (event) => {
        if (String(this.activeChatId) === chatPk) {
            console.log(`[messagingStore] WS: Message received for active chat ${chatPk}:`, event.data);
            try {
                const messageData = JSON.parse(event.data);
                this.handleChatMessage(messageData);
            } catch (error) {
                console.error('[messagingStore] WS: Failed to parse message:', error);
            }
        } else {
             console.log(`[messagingStore] WS: Ignored message for inactive chat ${chatPk}.`);
        }
      };

      this.activeChatWebSocket.onerror = (event) => {
        console.error(`[messagingStore] WS: Error for chat ${chatPk}:`, event);
         if (String(this.activeChatId) === chatPk) {
            this.webSocketError = 'WebSocket connection error.';
            this.isConnectingWebSocket = false;
            this.activeChatWebSocket = null;
         }
      };

      this.activeChatWebSocket.onclose = (event) => {
        console.log(`[messagingStore] WS: Connection closed for chat ${chatPk}. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        if (String(this.activeChatId) === chatPk) {
             this.activeChatWebSocket = null;
             this.isConnectingWebSocket = false;
             if (event.code !== 1000 && !this.webSocketError) {
                  this.webSocketError = `WebSocket closed unexpectedly (Code: ${event.code}).`;
             }
        } else {
             console.log(`[messagingStore] WS: Ignoring close event for non-active chat ${chatPk}.`);
        }
      };
    },

    disconnectActiveChatWebSocket(isSwitching: boolean = false) {
      if (this.activeChatWebSocket) {
        const closingChatId = this.activeChatId;
        console.log(`[messagingStore] WS: Closing connection for chat ${closingChatId}. Intentional: ${isSwitching}`);
        this.activeChatWebSocket.onopen = null;
        this.activeChatWebSocket.onmessage = null;
        this.activeChatWebSocket.onerror = null;
        this.activeChatWebSocket.onclose = null;
        this.activeChatWebSocket.close(1000, isSwitching ? 'Switching chat' : 'User action');
        this.activeChatWebSocket = null;
      }
      this.isConnectingWebSocket = false;
    },

    // Обработчик входящего сообщения WS
    handleChatMessage(messageDataFromWs: any) {
        console.log('[messagingStore] START handleChatMessage with raw data:', messageDataFromWs);

        let message: Message | null = null;
        let wsChatId: string | number | null | undefined = undefined;

        // Извлекаем сообщение и ID чата (адаптируйте под ваш формат!)
        if (messageDataFromWs?.type === 'message' && messageDataFromWs.payload) {
            console.log('[messagingStore] WS: Recognized format {type: "message", payload: ...}');
            message = messageDataFromWs.payload as Message;
            // Ищем ID чата в payload (проверьте ваш тип Message.ts!)
            wsChatId = message.chat_id; // Используем chat_id, если он есть после регенерации
            // wsChatId = message.chat?.id ?? (message as any).chat_id ?? (message as any).chat; // Старая проверка
        } else {
              console.warn('[messagingStore] WS: Received unknown message format:', messageDataFromWs);
              return;
        }

        if (!message) {
             console.error('[messagingStore] WS: Failed to extract message object.');
             return;
        }
        if (wsChatId === null || wsChatId === undefined) {
            console.warn('[messagingStore] WS: Received message without valid chat ID in payload.');
            return;
        }

        console.log('[messagingStore] Parsed message object:', message);
        console.log(`[messagingStore] Extracted wsChatId from message: ${wsChatId}`);
        console.log(`[messagingStore] Current activeChatId: ${this.activeChatId}`);

        // 1. Обновляем последнее сообщение в списке чатов
        this._updateChatLastMessage(wsChatId, message);

        // 2. Добавляем в активный чат, если он совпадает
        if (String(this.activeChatId) === String(wsChatId)) {
             console.log('[messagingStore] Message IS for active chat.');
             const exists = this.activeChatMessages.some(m => m.id === message!.id);
             if (!exists) {
                 this.activeChatMessages.push(message);
                 this.activeChatMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                 console.log('[messagingStore] WS: Added message to activeChatMessages array.');
                 // Если сообщение пришло по WS для активного чата, помечаем его прочитанным
                 this.markChatAsRead(wsChatId);
             } else {
                  console.warn(`[messagingStore] WS: Received duplicate message ID ${message!.id} for active chat.`);
             }
        } else {
             console.log(`[messagingStore] WS: Message IS NOT for active chat (${this.activeChatId}). Increment unread.`);
             // Увеличиваем счетчик непрочитанных для чата wsChatId
             const chat = this.chats.find(c => String(c.id) === String(wsChatId));
             if (chat && typeof chat.unread_count === 'number') {
                chat.unread_count++;
             } else if (chat) { // Если unread_count не было, ставим 1
                 chat.unread_count = 1;
             }
        }
    },

    // --- Вспомогательные методы ---
    _updateChatLastMessage(chatId: number | string, message: Message) {
        const chatIndex = this.chats.findIndex(c => String(c.id) === String(chatId));
        if (chatIndex !== -1) {
            // Клонируем чат перед обновлением для лучшей реактивности
            const updatedChat = { ...this.chats[chatIndex], last_message_details: message };
             // Если сообщение не для активного чата, увеличиваем счетчик (бэкенд тоже должен это делать)
             if(String(this.activeChatId) !== String(chatId)) {
                  updatedChat.unread_count = (updatedChat.unread_count ?? 0) + 1;
             }
            this.chats.splice(chatIndex, 1); // Удаляем старый
            this.chats.unshift(updatedChat); // Добавляем обновленный в начало
            // Сортируем
            this.chats.sort((a, b) => {
                const dateA = a.last_message_details?.timestamp ? new Date(a.last_message_details.timestamp).getTime() : 0;
                const dateB = b.last_message_details?.timestamp ? new Date(b.last_message_details.timestamp).getTime() : 0;
                return dateB - dateA;
            });
            console.log(`[messagingStore] Updated last message and sorted chats for chat ${chatId}`);
        } else {
            console.warn(`[messagingStore] Chat ${chatId} not found in list to update last message. Fetching chat list again.`);
             this.fetchChats(); // Перезапрашиваем список чатов
        }
    },

    // Очистка состояния
    clearMessagingState() {
        console.log('[messagingStore] Clearing state...');
        this.disconnectActiveChatWebSocket(true);
        this.chats = [];
        this.activeChatId = null;
        this.activeChatMessages = [];
        this.isLoadingChats = false;
        this.isLoadingMessages = false;
        this.isSendingMessage = false;
        this.isCreatingChat = false;
        this.errorChats = null;
        this.errorMessages = null;
        this.errorSending = null;
        this.errorCreatingChat = null;
        this.webSocketError = null;
        this.isUpdatingChat = false;
        this.errorChatAction = null;
    }
  },
});

// --- Убедитесь, что getErrorMessage импортирован или определен здесь ---
// import { ApiError } from '@/services/generated';
// import axios from 'axios';
// function getErrorMessage(error: any): string { ... }