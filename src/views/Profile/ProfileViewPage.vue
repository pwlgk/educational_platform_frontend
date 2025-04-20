// src/views/Profile/ProfileViewPage.vue
<template>
  <div>
    <h1>My Profile</h1>
    <div v-if="authStore.isLoading">Loading profile...</div>
    <div v-else-if="authStore.error">Error loading profile: {{ authStore.error }}</div>
    <div v-else-if="user">
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>First Name:</strong> {{ user.first_name }}</p>
      <p><strong>Last Name:</strong> {{ user.last_name }}</p>
      <p><strong>Patronymic:</strong> {{ user.patronymic || '-' }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <p><strong>Joined:</strong> {{ formatDate(user.date_joined) }}</p>
      <hr>
      <h2>Profile Details</h2>
      <p><strong>Phone:</strong> {{ user.profile?.phone_number || '-' }}</p>
      <p><strong>Date of Birth:</strong> {{ user.profile?.date_of_birth || '-' }}</p>
      <p><strong>Bio:</strong> {{ user.profile?.bio || '-' }}</p>
      <div v-if="user.profile?.avatar">
         <p><strong>Avatar:</strong></p>
         <img :src="user.profile.avatar" alt="User Avatar" width="100">
      </div>
      <router-link :to="{ name: 'ProfileEdit' }" class="button-link">Edit Profile</router-link>
      <router-link :to="{ name: 'Settings' }" class="button-link">Settings (Change Password)</router-link>
    </div>
     <button @click="authStore.logout()" class="logout-button">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth.store';
// import { onMounted } from 'vue'; // Не нужно, т.к. initializeAuth уже вызван

const authStore = useAuthStore();
const user = computed(() => authStore.getUser);

// Простая функция форматирования даты
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return dateString; // Возвращаем как есть, если формат некорректен
    }
};

// Загрузка профиля происходит при инициализации стора
// onMounted(() => {
//   if (!authStore.user) {
//     authStore.fetchUserProfile();
//   }
// });
</script>

<style scoped>
 hr { margin: 1.5rem 0; border: 0; border-top: 1px solid #eee; }
.button-link {
    display: inline-block;
    margin-top: 1rem;
    margin-right: 1rem;
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s;
}
.button-link:hover {
    background-color: #36a46f;
}
 .logout-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #e53e3e;
     color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
 }
 img {
     display: block;
     margin-top: 0.5rem;
     border-radius: 50%;
     object-fit: cover;
 }
</style>