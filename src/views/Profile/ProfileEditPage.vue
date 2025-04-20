// src/views/Profile/ProfileEditPage.vue
<template>
  <div>
    <h1>Edit Profile</h1>
    <div v-if="!isLoaded || !formData?.profile">Loading...</div>
    <form v-else @submit.prevent="handleUpdateProfile">
        <!-- Поля UserRequest (без email, role) -->
        <div class="form-group">
            <label for="firstName">First Name:</label>
            <!-- formData здесь точно не null -->
            <input type="text" id="firstName" v-model="formData.first_name">
        </div>
        <div class="form-group">
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" v-model="formData.last_name">
        </div>
        <div class="form-group">
            <label for="patronymic">Patronymic:</label>
            <input type="text" id="patronymic" v-model="formData.patronymic">
        </div>

        <hr>
        <h2>Profile Details</h2>

        <!-- formData.profile здесь тоже гарантированно существует из-за инициализации -->
        <div class="form-group">
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" v-model="formData.profile.phone_number">
        </div>
        <div class="form-group">
            <label for="dob">Date of Birth:</label>
            <input type="date" id="dob" v-model="formData.profile.date_of_birth">
        </div>
        <div class="form-group">
            <label for="bio">Bio:</label>
            <textarea id="bio" v-model="formData.profile.bio" rows="4"></textarea>
        </div>

        <!-- Сообщения об ошибках и кнопка -->
        <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
        </div>
        <div v-if="successMessage" class="success-message">
            {{ successMessage }}
        </div>

        <!-- Добавляем явное приведение к Boolean для disabled -->
        <button type="submit" :disabled="Boolean(authStore.isLoading)">
            {{ authStore.isLoading ? 'Saving...' : 'Save Changes' }}
        </button>
        <router-link :to="{ name: 'ProfileView' }" class="cancel-link">Cancel</router-link>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
// Импортируем оба типа: UserRequest для формы, ProfileRequest для вложенного профиля
import type { UserRequest, ProfileRequest } from '@/services/generated';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isLoaded = ref(false);
const successMessage = ref<string | null>(null);

// Инициализируем как null, но в onMounted создадим объект
const formData = ref<UserRequest | null>(null);

onMounted(() => {
  const user = authStore.getUser;
  if (user) {
    // --- ИСПРАВЛЕНИЕ ИНИЦИАЛИЗАЦИИ ---
    formData.value = {
       first_name: user.first_name ?? '', // Добавляем ?? '' на всякий случай
       last_name: user.last_name ?? '',
       patronymic: user.patronymic ?? '',
       // Гарантируем, что profile - это объект ProfileRequest
       profile: {
           phone_number: user.profile?.phone_number ?? '', // Используем ?? ''
           // Для даты рождения: v-model с type="date" ожидает строку 'YYYY-MM-DD' или null
           // Преобразуем null/undefined в null, а дату - в строку YYYY-MM-DD
           date_of_birth: user.profile?.date_of_birth
                          ? formatDateForInput(user.profile.date_of_birth)
                          : null,
           bio: user.profile?.bio ?? '',
           // avatar НЕ инициализируем здесь, если это файл
       }
    };
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
    isLoaded.value = true;
  } else {
      router.push({ name: 'ProfileView'});
  }
});

// Вспомогательная функция для форматирования даты для input[type=date]
// Она нужна, так как API может возвращать дату как строку ISO, а input хочет YYYY-MM-DD
function formatDateForInput(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        // Проверка на валидность даты
        if (isNaN(date.getTime())) return null;
        // Форматируем в YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date for input:", e);
        return null; // Возвращаем null в случае ошибки
    }
}


const handleUpdateProfile = async () => {
   // ... (логика отправки как раньше)
   if (!formData.value) return;

   authStore.error = null;
   successMessage.value = null;

   // Создаем объект для отправки, возможно, очищая пустые значения
   const dataToSend: UserRequest = {
       ...formData.value,
       profile: { ...formData.value.profile } // Клонируем профиль
   };

    // Очистка пустых значений перед отправкой (опционально)
   if (!dataToSend.patronymic) dataToSend.patronymic = undefined; // или delete
   if (dataToSend.profile) {
       if (!dataToSend.profile.phone_number) dataToSend.profile.phone_number = undefined;
       if (!dataToSend.profile.bio) dataToSend.profile.bio = undefined;
       // Для даты рождения: если пустая строка или null, отправляем null или удаляем
       if (!dataToSend.profile.date_of_birth) dataToSend.profile.date_of_birth = null;
   }

   const success = await authStore.updateProfile(dataToSend);
   if (success) {
       successMessage.value = 'Profile updated successfully!';
       setTimeout(() => router.push({ name: 'ProfileView' }), 1500);
   }
};
</script>

<style scoped>
/* Стили как в LoginPage + specific */
 hr { margin: 1.5rem 0; border: 0; border-top: 1px solid #eee; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.25rem; }
input, select, textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-family: inherit;}
textarea { resize: vertical; }
button { padding: 0.75rem 1.5rem; background-color: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; margin-right: 1rem; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
button:hover:not(:disabled) { background-color: #36a46f; }
.error-message { color: red; margin-bottom: 1rem; white-space: pre-wrap; }
.success-message { color: green; margin-bottom: 1rem; }
 .cancel-link {
     padding: 0.75rem 1.5rem;
     background-color: #f0f0f0;
     color: #333;
     text-decoration: none;
     border: 1px solid #ccc;
     border-radius: 4px;
 }
 img {
     display: block;
     margin-top: 0.5rem;
     border-radius: 50%;
     object-fit: cover;
 }
</style>