// src/views/Auth/RegisterPage.vue
<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <!-- Поля из UserRegistrationRequest -->
       <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="registrationData.email" required>
      </div>
       <div class="form-group">
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="registrationData.first_name" required>
      </div>
      <div class="form-group">
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="registrationData.last_name" required>
      </div>
       <div class="form-group">
        <label for="patronymic">Patronymic (Optional):</label>
        <input type="text" id="patronymic" v-model="registrationData.patronymic">
      </div>
       <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="registrationData.password" required>
      </div>
      <div class="form-group">
        <label for="password2">Confirm Password:</label>
        <input type="password" id="password2" v-model="registrationData.password2" required>
      </div>
       <div class="form-group">
         <label for="role">Role:</label>
         <select id="role" v-model="registrationData.role" required>
           <option value="STUDENT">Student</option>
           <option value="TEACHER">Teacher</option>
           <option value="PARENT">Parent</option>
           <!-- ADMIN роль обычно не выбирается при регистрации -->
         </select>
       </div>
       <div class="form-group">
        <label for="inviteCode">Invite Code (Optional):</label>
        <input type="text" id="inviteCode" v-model="registrationData.invite_code">
      </div>

      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
       <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button type="submit" :disabled="Boolean(authStore.isLoading || passwordsMismatch)">
        {{ authStore.isLoading ? 'Registering...' : 'Register' }}
      </button>
       <div v-if="passwordsMismatch" class="error-message">
          Passwords do not match.
       </div>
    </form>
     <p>
        <router-link :to="{ name: 'Login' }">Already have an account? Login</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import type { UserRegistrationRequest } from '@/services/generated';
import { RoleEnum } from '@/services/generated';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const registrationData = reactive<UserRegistrationRequest>({
  email: '',
  password: '',
  password2: '',
  first_name: '',
  last_name: '',
  patronymic: '',
  role: RoleEnum.STUDENT,
  invite_code: '',
});

const successMessage = ref<string | null>(null);

const passwordsMismatch = computed(() => {
    return registrationData.password && registrationData.password2 && registrationData.password !== registrationData.password2;
});

const handleRegister = async () => {
   if (passwordsMismatch.value) return; // Не отправлять, если пароли не совпадают

  // Сбрасываем сообщения
  authStore.error = null;
  successMessage.value = null;

  const success = await authStore.register(registrationData);
  if (success) {
     // Показываем сообщение и, возможно, перенаправляем
     successMessage.value = 'Registration successful! Please check your email to confirm your account (if required).';
     // Очищаем форму или перенаправляем
     // registrationData.email = ''; // ... reset all fields
     // setTimeout(() => router.push({ name: 'Login' }), 3000); // Пример редиректа
  }
  // Если неудача, ошибка отобразится из authStore.error
};
</script>

<style scoped>
/* Стили как в LoginPage */
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.25rem; }
input, select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
button { padding: 0.75rem 1.5rem; background-color: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
button:hover:not(:disabled) { background-color: #36a46f; }
.error-message { color: red; margin-top: 0.5rem; margin-bottom: 1rem; white-space: pre-wrap; }
.success-message { color: green; margin-bottom: 1rem; }
p { margin-top: 1rem; }
</style>