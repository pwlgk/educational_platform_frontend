// src/views/Notifications/NotificationsPage.vue
<template>
  <div class="notifications-page">
    <h1>Notifications</h1>

    <div class="notifications-header">
      <span>WebSocket Status: {{ wsStatus }}</span>
      <button @click="notificationsStore.markAllAsRead" :disabled="unreadCount === 0 || notificationsStore.getListLoading">
        Mark All as Read
      </button>
    </div>

    <div v-if="notificationsStore.getListLoading" class="loading">
      Loading notifications...
    </div>
    <div v-else-if="notificationsStore.errorList" class="error">
      Error: {{ notificationsStore.errorList }}
      <button @click="notificationsStore.fetchNotifications">Retry</button>
    </div>
    <div v-else-if="notifications.length === 0" class="empty">
      You have no notifications.
    </div>
    <div v-else class="notifications-list">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, onUnmounted } from 'vue';
import { useNotificationsStore } from '@/store/notifications.store';
import NotificationItem from '@/components/notifications/NotificationItem.vue';
import { storeToRefs } from 'pinia';

const notificationsStore = useNotificationsStore();

// Используем storeToRefs для сохранения реактивности при деструктуризации
const { notifications, isWebSocketConnected } = storeToRefs(notificationsStore);

// Получаем счетчик через геттер
const unreadCount = computed(() => notificationsStore.getUnreadCount);
const wsStatus = computed(() => isWebSocketConnected.value ? 'Connected' : 'Disconnected');

onMounted(() => {
  // Загружаем уведомления при монтировании компонента, если их еще нет
  if (notifications.value.length === 0) {
      notificationsStore.fetchNotifications();
  }
  // Попытка подключиться к WS, если еще не подключены (на случай если переход был до инициализации)
   if(!isWebSocketConnected.value) {
       notificationsStore.connectWebSocket();
   }
});

// Опционально: отключать WS при размонтировании, если не нужно постоянное соединение в фоне
// onUnmounted(() => {
//     notificationsStore.disconnectWebSocket();
// });

</script>

<style scoped>
.notifications-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
    color: #6c757d;
}
.notifications-header button {
    padding: 0.3rem 0.8rem;
    font-size: 0.85rem;
}
.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
.error button {
    margin-left: 1rem;
}
.notifications-list {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden; /* Для скругления углов */
}
</style>