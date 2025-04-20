// src/components/forms/NotificationSettingsForm.vue
<template>
    <div v-if="notificationsStore.getSettingsLoading">Loading settings...</div>
    <div v-else-if="notificationsStore.errorSettings" class="error-message">
        Error loading settings: {{ notificationsStore.errorSettings }}
        <button @click="fetch">Retry</button>
    </div>
    <form v-else-if="currentSettings" @submit.prevent="handleUpdateSettings">
        <div class="form-group checkbox-group">
            <input type="checkbox" id="enable_news" v-model="currentSettings.enable_news">
            <label for="enable_news">Enable News Notifications</label>
        </div>
         <div class="form-group checkbox-group">
            <input type="checkbox" id="enable_schedule" v-model="currentSettings.enable_schedule">
            <label for="enable_schedule">Enable Schedule Notifications</label>
        </div>
         <div class="form-group checkbox-group">
            <input type="checkbox" id="enable_messages" v-model="currentSettings.enable_messages">
            <label for="enable_messages">Enable Messaging Notifications</label>
        </div>
         <div class="form-group checkbox-group">
            <input type="checkbox" id="enable_forum" v-model="currentSettings.enable_forum">
            <label for="enable_forum">Enable Forum Notifications</label>
        </div>
         <div class="form-group checkbox-group">
            <input type="checkbox" id="enable_system" v-model="currentSettings.enable_system">
            <label for="enable_system">Enable System Notifications</label>
        </div>

        <div v-if="updateError" class="error-message">
            {{ updateError }}
        </div>
        <div v-if="successMessage" class="success-message">
            {{ successMessage }}
        </div>

        <button type="submit" :disabled="notificationsStore.getSettingsLoading">
            {{ notificationsStore.getSettingsLoading ? 'Saving...' : 'Save Settings' }}
        </button>
    </form>
     <div v-else>
         Could not load settings.
     </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useNotificationsStore } from '@/store/notifications.store';
import type { UserNotificationSettingsRequest } from '@/services/generated';

const notificationsStore = useNotificationsStore();
const updateError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Локальная копия настроек для формы
const currentSettings = ref<UserNotificationSettingsRequest | null>(null);

// Загружаем настройки при монтировании
const fetch = () => {
    notificationsStore.fetchSettings();
}
onMounted(fetch);

// Следим за изменениями в сторе и обновляем локальную копию
// Используем watch, так как settings могут быть null изначально
watch(() => notificationsStore.settings, (newSettings) => {
    if (newSettings) {
        // Клонируем объект, чтобы не мутировать стор напрямую через v-model
        currentSettings.value = { ...newSettings };
    } else {
        currentSettings.value = null; // Сбрасываем, если в сторе null
    }
}, { immediate: true }); // immediate: true - чтобы сработало при первой загрузке

const handleUpdateSettings = async () => {
    if (!currentSettings.value) return;

    updateError.value = null;
    successMessage.value = null;

    const success = await notificationsStore.updateSettings(currentSettings.value);

    if (success) {
        successMessage.value = 'Settings updated successfully!';
        // Очищаем сообщение через некоторое время
        setTimeout(() => successMessage.value = null, 3000);
    } else {
        // Ошибка уже должна быть в notificationsStore.errorSettings, но можно и свою
        updateError.value = notificationsStore.errorSettings || 'Failed to update settings.';
    }
};
</script>

<style scoped>
.form-group { margin-bottom: 0.5rem; }
.checkbox-group {
    display: flex;
    align-items: center;
}
.checkbox-group input[type="checkbox"] {
    margin-right: 0.5rem;
    width: auto; /* Отменяем 100% ширину для чекбоксов */
}
.checkbox-group label {
     margin-bottom: 0; /* Убираем отступ снизу у label */
     cursor: pointer;
}
button { margin-top: 1rem; padding: 0.5rem 1rem; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
.error-message { color: red; margin-top: 1rem; }
.success-message { color: green; margin-top: 1rem; }
</style>