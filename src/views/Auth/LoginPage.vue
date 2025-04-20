// src/views/Auth/LoginPage.vue
<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="credentials.email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="credentials.password" required>
      </div>
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
      <button type="submit" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <p>
      <router-link :to="{ name: 'Register' }">Don't have an account? Register</router-link>
    </p>
     <!-- <p><router-link :to="{ name: 'ForgotPassword' }">Forgot Password?</router-link></p> -->
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import type { TokenObtainPairRequest } from '@/services/generated';

const authStore = useAuthStore();

const credentials = reactive<TokenObtainPairRequest>({
  email: '',
  password: '',
});

const handleLogin = async () => {
  // Сбрасываем ошибку перед новой попыткой
  authStore.error = null;
  await authStore.login(credentials);
  // Перенаправление произойдет в action стора при успехе
};
</script>

<style scoped>
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
  margin-bottom: 1rem;
  white-space: pre-wrap; /* Для отображения ошибок валидации */
}
p {
    margin-top: 1rem;
}
</style>