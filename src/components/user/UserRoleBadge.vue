// src/components/user/UserRoleBadge.vue
<template>
  <span :class="['role-badge', roleClass]">{{ formattedRole }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RoleEnum } from '@/services/generated'; // Импортируем enum ролей

interface Props {
  role: RoleEnum | null | undefined;
}

const props = defineProps<Props>();

const roleClass = computed(() => {
  if (!props.role) return 'role-unknown';
  return `role-${props.role.toLowerCase()}`;
});

 const formattedRole = computed(() => {
    if (!props.role) return 'Unknown';
     // Можно добавить маппинг для красивого отображения
     const roleMap: Record<RoleEnum, string> = {
         'ADMIN': 'Admin',
         'TEACHER': 'Teacher',
         'STUDENT': 'Student',
         'PARENT': 'Parent'
     };
    return roleMap[props.role] || props.role;
 });
</script>

<style scoped>
.role-badge {
  padding: 0.2em 0.6em;
  border-radius: 0.25rem;
  font-size: 0.85em;
  font-weight: bold;
  color: white;
  white-space: nowrap;
}
.role-admin { background-color: #dc3545; }
.role-teacher { background-color: #007bff; }
.role-student { background-color: #28a745; }
.role-parent { background-color: #ffc107; color: #333 }
.role-unknown { background-color: #6c757d; }
</style>