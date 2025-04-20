// src/components/notifications/NotificationItem.vue
<template>
  <div :class="['notification-item', { 'is-read': notification.is_read }]">
    <div class="content">
      <!-- Иконка в зависимости от типа -->
      <span class="icon">{{ notificationIcon }}</span>
      <p class="message">{{ notification.message }}</p>
      <span class="timestamp">{{ timeAgo(notification.created_at) }}</span>
    </div>
    <div class="actions">
      <button v-if="!notification.is_read" @click="markRead" title="Mark as read">✔️</button>
      <button v-if="notification.is_read" @click="markUnread" title="Mark as unread">✉️</button>
      <!-- Можно добавить кнопку удаления -->
      <!-- <button @click="deleteNotification" title="Delete">🗑️</button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';
import { type Notification, NotificationTypeEnum } from '@/services/generated';
import { useNotificationsStore } from '@/store/notifications.store';
import { formatDistanceToNowStrict } from 'date-fns'; // Используем date-fns для "time ago"

const props = defineProps({
  notification: {
    type: Object as PropType<Notification>,
    required: true,
  },
});

const notificationsStore = useNotificationsStore();

const markRead = () => {
  if (props.notification.id) { // Убедимся что ID есть
    notificationsStore.markAsRead(props.notification.id);
  }
};

const markUnread = () => {
   if (props.notification.id) {
      notificationsStore.markAsUnread(props.notification.id);
   }
};

// Функция для форматирования времени "N времени назад"
const timeAgo = (dateString: string) => {
    try {
        return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true });
    } catch {
        return dateString; // Возвращаем как есть при ошибке
    }
}

// Иконка в зависимости от типа уведомления
const notificationIcon = computed(() => {
    switch (props.notification.notification_type) {
        case NotificationTypeEnum.NEWS: return '📰';
        case NotificationTypeEnum.SCHEDULE: return '📅';
        case NotificationTypeEnum.MESSAGE: return '💬';
        case NotificationTypeEnum.FORUM: return '👥';
        case NotificationTypeEnum.SYSTEM: return '⚙️';
        default: return '🔔';
    }
});

</script>

<style scoped>
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}
.notification-item:hover {
  background-color: #f9f9f9;
}
.notification-item.is-read {
  opacity: 0.7;
  background-color: #f8f9fa; /* Слегка серый фон для прочитанных */
}
.notification-item.is-read .message {
    font-weight: normal;
}
.content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-grow: 1;
}
.icon {
  font-size: 1.2rem;
}
.message {
  margin: 0;
  flex-grow: 1;
   font-weight: bold; /* Непрочитанные жирным */
}
.timestamp {
  font-size: 0.8rem;
  color: #6c757d;
  white-space: nowrap;
  margin-left: 1rem;
}
.actions button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 0.5rem;
  font-size: 1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}
 .actions button:hover {
     opacity: 1;
 }
</style>