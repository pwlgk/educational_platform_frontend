// src/views/Messaging/ChatLayout.vue
<template>
  <div class="chat-layout">
    <!-- Левая колонка: Список чатов -->
    <div class="chat-list-panel">
      <div class="panel-header">
          <h2>Chats</h2>
          <button @click="showCreateChatModal = true" class="create-chat-button" title="Create Chat">+</button>
          <!-- TODO: Кнопка создания нового чата -->
          <!-- <button @click="showCreateChatModal = true">+</button> -->
      </div>
      <div v-if="messagingStore.getIsLoadingChats && chats.length === 0" class="loading">Loading chats...</div>
      <div v-else-if="messagingStore.errorChats" class="error">
          Error: {{ messagingStore.errorChats }}
          <button @click="messagingStore.fetchChats">Retry</button>
      </div>
       <div v-else-if="chats.length === 0" class="empty">No chats found.</div>
       <ul v-if="!messagingStore.getIsLoadingChats && chats.length > 0" class="chat-list">
            <ChatListItem
              v-for="chat in chats"
              :key="chat.id"
              :chat="chat"
              :is-active="String(chat.id) === String(activeChatId)"
              @select="handleChatSelect"
            />
          </ul>
    </div>

    <!-- Правая колонка: Активный чат -->
    <div class="active-chat-panel">
      <div v-if="!activeChatId" class="no-chat-selected">
         Select a chat to start messaging.
      </div>
      <!-- Используем ChatWindow для отображения сообщений активного чата -->
      <ChatWindow v-else :chat-id="activeChatId" :key="activeChatId" />
      <!-- :key="activeChatId" заставит ChatWindow перемонтироваться при смене чата -->
    </div>

     <!-- TODO: Модальное окно для создания чата -->
     <!-- <CreateChatModal v-if="showCreateChatModal" @close="showCreateChatModal = false" /> -->
     <CreateChatModal
        v-if="showCreateChatModal"
        @close="showCreateChatModal = false"
        @chat-created="handleChatCreated"
     />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessagingStore } from '@/store/messaging.store';
import { storeToRefs } from 'pinia';
import ChatListItem from '@/components/messaging/ChatListItem.vue';
import ChatWindow from '@/components/messaging/ChatWindow.vue';
import CreateChatModal from '@/components/messaging/CreateChatModal.vue'; // <--- Импорт модалки
import type { Chat } from '@/services/generated'; // Импорт типа Chat

const messagingStore = useMessagingStore();
const { chats, activeChatId } = storeToRefs(messagingStore);

// Состояние для отображения модального окна
const showCreateChatModal = ref(false);

onMounted(() => {
    if (chats.value.length === 0) {
        messagingStore.fetchChats();
    }
});

const handleChatSelect = (chatId: number | string) => {
    messagingStore.setActiveChat(chatId);
};

// Обработчик события после успешного создания чата
const handleChatCreated = (newChat: Chat) => {
    console.log('ChatLayout: New chat created:', newChat);
    // Опционально: Сразу сделать новый чат активным
    messagingStore.setActiveChat(newChat.id);
    // Модальное окно закроется само через @close="$emit('close')"
}

</script>

<style scoped>
.chat-layout {
  display: flex;
  height: calc(100vh - 100px); /* Пример: высота экрана минус хедер/футер */
  border: 1px solid #ccc;
  background-color: #fff;
}

.chat-list-panel {
  width: 300px; /* Ширина списка чатов */
  flex-shrink: 0;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
   background-color: #f8f9fa;
}
.panel-header {
    padding: 1rem;
    border-bottom: 1px solid #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #e9ecef;
}
.panel-header h2 {
    margin: 0;
    font-size: 1.2rem;
}
.chat-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto; /* Прокрутка списка чатов */
  flex-grow: 1;
}

.active-chat-panel {
  flex-grow: 1; /* Занимает оставшееся место */
  display: flex; /* Чтобы ChatWindow растянулся */
  flex-direction: column; /* ChatWindow будет управлять своей высотой */
}

.no-chat-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-size: 1.1rem;
}
.loading, .error, .empty { text-align: center; padding: 2rem; color: #6c757d; }
.error button { margin-left: 1rem; }
.panel-header button.create-chat-button {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #0d6efd;
    line-height: 1;
    padding: 0 0.5rem;
}
.panel-header button.create-chat-button:hover {
    color: #0b5ed7;}
</style>