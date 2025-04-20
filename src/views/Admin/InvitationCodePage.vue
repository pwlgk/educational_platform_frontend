// src/views/Admin/InvitationCodePage.vue
<template>
  <div class="admin-page">
    <h1>Invitation Code Management</h1>

    <!-- Форма создания нового приглашения -->
    <div class="create-invitation-form">
        <h3>Create New Invitation</h3>
        <form @submit.prevent="handleCreateInvitation">
             <div class="form-group">
                 <label for="newRole">Role:</label>
                 <select id="newRole" v-model="newInvitationData.role" required>
                     <option :value="RoleEnum.STUDENT">Student</option>
                     <option :value="RoleEnum.TEACHER">Teacher</option>
                     <option :value="RoleEnum.PARENT">Parent</option>
                     <option :value="RoleEnum.ADMIN">Admin</option> <!-- Админ может создавать админов? -->
                 </select>
             </div>
             <div class="form-group">
                 <label for="newExpiresAt">Expires At (Optional):</label>
                 <input type="datetime-local" id="newExpiresAt" v-model="newInvitationData.expires_at">
                 <small>Leave empty for no expiration.</small>
             </div>
             <div v-if="createError" class="error-message">{{ createError }}</div>
              <div v-if="createSuccess" class="success-message">Invitation created successfully!</div>
             <button type="submit" :disabled="adminStore.isLoadingInvitations">
                 {{ adminStore.isLoadingInvitations ? 'Creating...' : 'Create Code' }}
             </button>
        </form>
    </div>
    <hr>

    <!-- Список существующих приглашений -->
    <h2>Existing Invitations</h2>
    <div v-if="adminStore.isLoadingInvitations && invitations.length === 0" class="loading">Loading invitations...</div>
    <div v-else-if="adminStore.errorInvitations" class="error">
      Error: {{ adminStore.errorInvitations }}
      <button @click="adminStore.fetchInvitations">Retry</button>
    </div>
     <div v-else-if="invitations.length === 0" class="empty">No invitation codes found.</div>
    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Role</th>
          <th>Valid</th>
          <th>Used By</th>
          <th>Created At</th>
          <th>Created By</th>
          <th>Expires At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <InvitationCodeListItem
            v-for="invitation in invitations"
            :key="invitation.id"
            :invitation="invitation"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref } from 'vue';
import { useAdminStore } from '@/store/admin.store';
import { storeToRefs } from 'pinia';
import InvitationCodeListItem from '@/components/admin/InvitationCodeListItem.vue';
import { RoleEnum, type InvitationCodeRequest } from '@/services/generated';

const adminStore = useAdminStore();
const { invitations } = storeToRefs(adminStore); // Получаем реактивный список

const createError = ref<string | null>(null);
const createSuccess = ref(false);

// Данные для формы создания
const newInvitationData = reactive<InvitationCodeRequest>({
    role: RoleEnum.STUDENT, // Роль по умолчанию
    expires_at: null, // Используем null для отсутствия даты
});

// Загружаем приглашения при монтировании
onMounted(() => {
  if (invitations.value.length === 0) {
    adminStore.fetchInvitations();
  }
});

// Обработчик создания
const handleCreateInvitation = async () => {
    createError.value = null;
    createSuccess.value = false;

     // Форматируем дату перед отправкой, если она есть
     const dataToSend: InvitationCodeRequest = {
         role: newInvitationData.role,
         // API ожидает строку ISO или null. input[datetime-local] возвращает строку вида "YYYY-MM-DDTHH:mm"
         expires_at: newInvitationData.expires_at ? new Date(newInvitationData.expires_at).toISOString() : null,
     };

    const created = await adminStore.createInvitation(dataToSend);
    if (created) {
         createSuccess.value = true;
         // Очищаем форму
         newInvitationData.role = RoleEnum.STUDENT;
         newInvitationData.expires_at = null;
         setTimeout(() => createSuccess.value = false, 3000); // Скрываем сообщение через 3 сек
    } else {
        createError.value = adminStore.errorInvitations || 'Failed to create invitation.';
    }
}

</script>

<style scoped>
/* Общие стили + специфичные */
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

.create-invitation-form {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 5px;
    margin-bottom: 2rem;
    border: 1px solid #dee2e6;
}
.create-invitation-form h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
}
.form-group {
    margin-bottom: 1rem;
}
.form-group label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: 500;
}
.form-group select, .form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    box-sizing: border-box;
}
.form-group small {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: #6c757d;
}
.create-invitation-form button {
    padding: 0.6rem 1.2rem;
}
.error-message { color: red; margin-top: 0.5rem; margin-bottom: 1rem; }
.success-message { color: green; margin-bottom: 1rem; }
hr { margin: 2rem 0; }
</style>