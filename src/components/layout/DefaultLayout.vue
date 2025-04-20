// src/components/layout/DefaultLayout.vue
<template>
  <div class="default-layout">
    <header>
      Основной Лэйаут
      <nav>
        <router-link to="/">Dashboard</router-link>
      | <router-link :to="{ name: 'NewsList' }">News</router-link>
      | <router-link :to="{ name: 'ForumCategories' }">Forum</router-link>

        <span v-if="authStore.isAuthenticated">
           | <router-link :to="{ name: 'ProfileView' }">Profile</router-link>
           | <router-link :to="{ name: 'Settings' }">Settings</router-link>
           | <router-link :to="{ name: 'Messaging' }">Messaging</router-link> 
           | <router-link :to="{ name: 'MySchedule' }">My Schedule</router-link>
       | <router-link :to="{ name: 'Settings' }">Settings</router-link>
           | <NotificationsBadge />
           
           <span v-if="authStore.isAdmin">
           | <router-link :to="{ name: 'AdminUserManagement' }">Users</router-link>
           | <router-link :to="{ name: 'AdminInvitationCodes' }">Invites</router-link>
       </span>
           | <button @click="handleLogout" class="logout-nav-button">Logout ({{ authStore.user?.email }})</button>
        </span>
        <span v-else>
           | <router-link :to="{ name: 'Login' }">Login</router-link>
           | <router-link :to="{ name: 'Register' }">Register</router-link>
        </span>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      Футер
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'vue-router'; // Импорт нужен если используем router
import NotificationsBadge from '@/components/notifications/NotificationsBadge.vue';

const authStore = useAuthStore();
const router = useRouter(); // Используем router для программной навигации при логауте

const handleLogout = () => {
    // Можно было бы добавить подтверждение перед выходом
    authStore.logout();
    // Редирект уже происходит внутри authStore.logout()
};
</script>

<style scoped>
/* Стили для этого лэйаута */
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
header, footer {
  background-color: #f0f0f0;
  padding: 1rem;
}
main {
  flex-grow: 1;
  padding: 1rem;
}

nav {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #ccc;
    display: flex; /* Добавляем flex для выравнивания */
    align-items: center;
}
nav > span a, nav > a {
    margin: 0 0.5rem;
}
.logout-nav-button {
    background: none;
    border: none;
    color: #dc3545; /* Цвет ссылки или кнопки */
    cursor: pointer;
    padding: 0;
    font: inherit;
    text-decoration: underline;
}
.logout-nav-button:hover {
    color: #a71d2a;
}
</style>