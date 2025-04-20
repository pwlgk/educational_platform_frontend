// src/components/admin/UserListItem.vue
<template>
  <tr class="user-list-item">
    <td>{{ user.id }}</td>
    <td>
        <UserAvatar :src="user.profile?.avatar" :alt="user.email" size="30" />
    </td>
    <td>{{ user.email }}</td>
    <td>{{ user.first_name }} {{ user.last_name }}</td>
    <td><UserRoleBadge :role="user.role" /></td>
    <td>
        <span :class="user.is_active ? 'status-active' : 'status-inactive'">
             {{ user.is_active ? 'Yes' : 'No' }}
        </span>
    </td>
    <td>{{ formatDate(user.date_joined) }}</td>
    <td>
      <!-- TODO: Реализовать кнопки/ссылки на просмотр/редактирование админом -->
      <!-- <router-link :to="{ name: 'AdminUserDetail', params: { id: user.id } }">View</router-link> -->
      <!-- <button @click="editUser">Edit</button> -->
    </td>
  </tr>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { type User, type RoleEnum } from '@/services/generated'; // Импортируем RoleEnum
import UserAvatar from '@/components/user/UserAvatar.vue';
import UserRoleBadge from '@/components/user/UserRoleBadge.vue';

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
  },
});

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleString();
    } catch { return dateString; }
};

// const editUser = () => { /* ... */ }
</script>

<style scoped>
.user-list-item td {
  padding: 0.5rem 0.8rem;
  vertical-align: middle;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem; /* Немного уменьшим шрифт */
}
.user-list-item:hover {
    background-color: #f8f9fa;
}
td:first-child { width: 50px; text-align: right; color: #6c757d;}
td:nth-child(2) { width: 40px; padding-top: 0.3rem; padding-bottom: 0.3rem; } /* Аватар */
td:last-child { width: 80px; text-align: center; } /* Кнопки действий */

.status-active {
    color: #198754; /* Зеленый */
    font-weight: bold;
}
.status-inactive {
    color: #dc3545; /* Красный */
}
</style>