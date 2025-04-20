// src/components/messaging/MessageBubble.vue
<template>
  <div :class="['message-wrapper', { 'is-sender': isSender }]">
    <div class="message-bubble">
      <!-- Опционально: Имя отправителя для групповых чатов и чужих сообщений -->
      <div v-if="!isSender && showSenderName" class="sender-name">
          {{ message.sender?.first_name || message.sender?.email }}
      </div>
      <p class="message-content">{{ message.content }}</p>
      <!-- TODO: Отображение файла, если есть message.file_url -->
       <a v-if="message.file_url" :href="message.file_url" target="_blank" rel="noopener noreferrer">
           [Attachment] <!-- Или имя файла, если оно есть -->
       </a>
      <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
       <!-- TODO: Статус сообщения (отправлено, доставлено, прочитано), если есть -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';
import { type Message } from '@/services/generated';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns'; // Для форматирования времени

const props = defineProps({
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
  // Флаг для отображения имени отправителя (например, в групповых чатах)
  showSenderName: {
      type: Boolean,
      default: false, // По умолчанию не показываем для 1-на-1 чатов
  }
});

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.id);

// Определяем, является ли текущий пользователь отправителем
const isSender = computed(() => props.message.sender?.id === currentUserId.value);

// Форматирование времени HH:MM
const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
        return format(new Date(timestamp), 'HH:mm');
    } catch { return ''; }
}
</script>

<style scoped>
.message-wrapper {
  display: flex;
  margin-bottom: 0.5rem;
}
.message-wrapper.is-sender {
  justify-content: flex-end; /* Свои сообщения справа */
}
.message-bubble {
  max-width: 75%; /* Макс ширина сообщения */
  padding: 0.6rem 0.9rem;
  border-radius: 15px; /* Скругление */
  background-color: #e9ecef; /* Фон для чужих */
  color: #212529;
   position: relative; /* Для позиционирования времени */
}
.message-wrapper.is-sender .message-bubble {
  background-color: #0d6efd; /* Фон для своих */
  color: white;
  border-bottom-right-radius: 5px; /* Другое скругление для своих */
}
 .message-wrapper:not(.is-sender) .message-bubble {
     border-bottom-left-radius: 5px; /* Другое скругление для чужих */
 }

 .sender-name {
     font-size: 0.8rem;
     font-weight: bold;
     margin-bottom: 0.2rem;
     color: #6c757d; /* Цвет имени отправителя */
      /* Для синих сообщений можно другой цвет */
     /* .message-wrapper.is-sender .sender-name { color: rgba(255, 255, 255, 0.8); } */
 }

.message-content {
  margin: 0;
  white-space: pre-wrap; /* Сохраняем переносы строк */
  word-wrap: break-word; /* Переносим длинные слова */
}
.timestamp {
  display: block; /* Чтобы был на новой строке или в углу */
  font-size: 0.7rem;
  text-align: right;
  margin-top: 0.3rem;
  color: #6c757d; /* Цвет времени для чужих */
  opacity: 0.8;
}
.message-wrapper.is-sender .timestamp {
   color: rgba(255, 255, 255, 0.8); /* Цвет времени для своих */
}
 .message-bubble a { /* Ссылка на вложение */
     display: block;
     margin-top: 0.5rem;
     color: inherit; /* Наследовать цвет текста */
     text-decoration: underline;
 }
</style>