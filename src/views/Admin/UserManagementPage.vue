// src/views/Admin/UserManagementPage.vue
<template>
  <div class="admin-page">
    <h1>User Management (Admin View)</h1>

    <!-- TODO: Добавить поиск/фильтры для админа -->

    <div v-if="adminStore.getIsLoadingUsers" class="loading">Loading users...</div>
    <div v-else-if="adminStore.errorUsers" class="error">
      Error: {{ adminStore.errorUsers }}
      <button @click="adminStore.fetchAllUsers">Retry</button> {/* Используем геттер */}
    </div>
    <div v-else-if="allUsers.length === 0" class="empty">No users found.</div>
    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Avatar</th>
          <th>Email</th>
          <th>Name</th>
          <th>Role</th>
          <th>Active</th>
          <th>Joined</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <UserListItem v-for="user in allUsers" :key="user.id" :user="user" />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminStore } from '@/store/admin.store'; // Используем adminStore
import { storeToRefs } from 'pinia';
import UserListItem from '@/components/admin/UserListItem.vue'; // Убедитесь, что этот компонент существует

const adminStore = useAdminStore();

// Получаем ПОЛНЫЙ список пользователей из adminStore
// Используем getter getAllUsers для ясности
const { getAllUsers: allUsers } = storeToRefs(adminStore); // Переименовали для ясности

onMounted(() => {
  // Загружаем ВСЕХ пользователей, если список пуст
  if (allUsers.value.length === 0) {
    adminStore.fetchAllUsers(); // Вызываем fetchAllUsers
  }
});
</script>

<style scoped>
/* Общие стили для админ страниц */
.admin-page { padding: 1rem; }
.loading, .error, .empty { text-align: center; padding: 2rem; color: #6c757d; }
.error button { margin-left: 1rem; }

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.admin-table th, .admin-table td {
  border: 1px solid #dee2e6;
  padding: 0.6rem;
  text-align: left;
}
.admin-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>