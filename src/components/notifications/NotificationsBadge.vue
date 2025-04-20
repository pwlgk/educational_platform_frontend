// src/components/notifications/NotificationsBadge.vue
<template>
  <button class="notification-badge-button" @click="goToNotifications">
    <span class="icon">🔔</span> <!-- Замените на иконку -->
    <span v-if="unreadCount > 0" class="badge">{{ badgeCount }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationsStore } from '@/store/notifications.store';
import { useRouter } from 'vue-router';

const notificationsStore = useNotificationsStore();
const router = useRouter();

// Используем геттер для получения счетчика
const unreadCount = computed(() => notificationsStore.getUnreadCount);

// Ограничиваем отображаемое число (например, 99+)
const badgeCount = computed(() => {
  return unreadCount.value > 99 ? '99+' : unreadCount.value;
});

const goToNotifications = () => {
    // TODO: Замените 'NotificationsPage' на имя вашего роута для страницы уведомлений
    router.push({ name: 'NotificationsPage' });
}
</script>

<style scoped>
.notification-badge-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin: 0 0.5rem; /* Отступы по бокам */
  color: inherit; /* Наследовать цвет текста */
}
.icon {
  font-size: 1.5rem; /* Размер иконки */
}
.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 0.1em 0.4em;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 1.2em; /* Минимальная ширина для одной цифры */
  height: 1.2em;
  line-height: 1.2em; /* Центрирование текста */
  text-align: center;
  transform: translate(40%, -40%); /* Сдвигаем для лучшего позиционирования */
}
</style>