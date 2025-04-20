// src/components/messaging/ChatListItem.vue
<template>
  <li
    :class="['chat-list-item', { active: isActive }]"
    @click="selectChat"
  >
    <UserAvatar :alt="chatDisplayName" size="40" /> <!-- TODO: Добавить src аватара чата/собеседника -->
    <div class="chat-info">
      <span class="chat-name">{{ chatDisplayName }}</span>
      <p v-if="chat.last_message_details?.content" class="last-message">
         {{ truncate(chat.last_message_details.content, 30) }}
      </p>
       <p v-else class="last-message no-message">
           No messages yet
       </p>
    </div>
    <div class="chat-meta">
        <span v-if="chat.last_message_details?.timestamp" class="timestamp">
            {{ formatTimestamp(chat.last_message_details.timestamp) }}
        </span>

        <span v-if="chat.unread_count && chat.unread_count > 0" class="unread-badge">
        {{ chat.unread_count }}
    </span>
    </div>
  </li>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';
import { type Chat } from '@/services/generated';
import UserAvatar from '@/components/user/UserAvatar.vue'; // Используем компонент аватара
import { formatDistanceToNowStrict, isToday, format } from 'date-fns'; // Для форматирования даты

const props = defineProps({
  chat: {
    type: Object as PropType<Chat>,
    required: true,
  },
   isActive: { // Флаг, является ли чат текущим активным
       type: Boolean,
       default: false
   }
});

// Эмитируем событие при выборе чата
const emit = defineEmits(['select']);

const selectChat = () => {
    emit('select', props.chat.id);
}

// Отображаемое имя чата (имя группы или имя собеседника)
// В вашем API есть поле chat.display_name, используем его
const chatDisplayName = computed(() => props.chat.display_name || 'Chat');

// Форматирование времени последнего сообщения
const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return format(date, 'HH:mm'); // Сегодня - показываем время
        } else {
             return format(date, 'dd MMM'); // Иначе - день и месяц
        }
    } catch { return ''; }
}

// Обрезка текста
 const truncate = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
 }

</script>

<style scoped>
.chat-list-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}
.chat-list-item:hover {
  background-color: #f8f9fa;
}
.chat-list-item.active {
  background-color: #e9ecef; /* Выделение активного чата */
}
.chat-info {
  flex-grow: 1;
  margin-left: 0.8rem;
  overflow: hidden; /* Чтобы длинные тексты не вылезали */
}
.chat-name {
  font-weight: 600;
  display: block; /* Чтобы занимал всю ширину */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.last-message {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0.1rem 0 0 0;
   white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
 .last-message.no-message {
     font-style: italic;
 }
 .chat-meta {
    margin-left: 0.5rem;
    text-align: right;
    font-size: 0.8rem;
    color: #6c757d;
    white-space: nowrap;
    display: flex;
    flex-direction: column; /* Время и значок друг под другом */
    align-items: flex-end;
 }
  .timestamp {
      margin-bottom: 0.2rem; /* Отступ под временем */
  }
  .unread-badge {
  background-color: #dc3545; /* Красный */
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.1em 0.4em;
  border-radius: 0.5rem; /* Овальный или круглый */
  margin-top: 0.2rem;
  min-width: 1.2em;
  text-align: center;
  line-height: 1.2em;
}
</style>