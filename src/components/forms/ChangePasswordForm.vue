// src/components/forms/ChangePasswordForm.vue
<template>
  <form @submit.prevent="handleChangePassword">
    <div class="form-group">
      <label for="oldPassword">Current Password:</label>
      <input
        type="password"
        id="oldPassword"
        v-model="passwordData.old_password"
        required
      />
    </div>
    <div class="form-group">
      <label for="newPassword">New Password:</label>
      <input
        type="password"
        id="newPassword"
        v-model="passwordData.new_password"
        required
      />
    </div>
    <div class="form-group">
      <label for="newPassword2">Confirm New Password:</label>
      <input
        type="password"
        id="newPassword2"
        v-model="passwordData.new_password2"
        required
      />
    </div>

    <div
      v-if="authStore.error && formScope === currentScope"
      class="error-message"
    >
      {{ authStore.error }}
    </div>
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    <div v-if="passwordsMismatch" class="error-message">
      New passwords do not match.
    </div>

    <button
      type="submit"
      :disabled="Boolean(authStore.isLoading || passwordsMismatch)"
    >
      {{ authStore.isLoading ? 'Changing...' : 'Change Password' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import type { ChangePasswordRequest } from '@/services/generated';

const authStore = useAuthStore();

const passwordData = reactive<ChangePasswordRequest>({
  old_password: '',
  new_password: '',
  new_password2: '',
});

const successMessage = ref<string | null>(null);
// Используем scope, чтобы ошибка отображалась только для этой формы
const formScope = 'changePassword';
const currentScope = ref<string | null>(null);

const passwordsMismatch = computed(() => {
  return (
    passwordData.new_password &&
    passwordData.new_password2 &&
    passwordData.new_password !== passwordData.new_password2
  );
});

const handleChangePassword = async () => {
  if (passwordsMismatch.value) return;

  authStore.error = null; // Сброс общей ошибки стора
  successMessage.value = null;
  currentScope.value = formScope; // Устанавливаем текущий scope

  const success = await authStore.changePassword(passwordData);

  if (success) {
    successMessage.value = 'Password changed successfully!';
    // Очищаем поля формы
    passwordData.old_password = '';
    passwordData.new_password = '';
    passwordData.new_password2 = '';
  }
  // Оставляем currentScope, чтобы ошибка отобразилась, если она есть
  // Можно добавить сброс currentScope через setTimeout, если нужно, чтобы ошибка исчезала
};
</script>

<style scoped>
/* Стили как в LoginPage */
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #36a46f;
}
.error-message {
  color: red;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  white-space: pre-wrap;
}
.success-message {
  color: green;
  margin-bottom: 1rem;
}
</style>
