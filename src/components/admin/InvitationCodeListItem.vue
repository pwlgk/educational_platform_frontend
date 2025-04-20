// src/components/admin/InvitationCodeListItem.vue
<template>
    <!-- Используем computed свойство для класса -->
    <tr :class="['invitation-item', { 'is-invalid': !isValid }]">
        <td><code>{{ invitation.code }}</code></td>
        <td><UserRoleBadge :role="invitation.role" /></td>
         <!-- Используем computed свойство -->
        <td>{{ isValid ? 'Yes' : 'No' }}</td>
        <td>{{ invitation.used_by_email || '-' }}</td>
        <td>{{ formatDate(invitation.created_at) }}</td>
        <td>{{ invitation.created_by_email }}</td>
        <td>{{ invitation.expires_at ? formatDate(invitation.expires_at) : 'Never' }}</td>
        <td>
            <button
                @click="deleteInvitationCode"
                class="delete-button"
                :disabled="isDeleting"
                title="Delete Invitation"
            >
                 <!-- Отображаем спиннер во время удаления -->
                {{ isDeleting ? '...' : '🗑️' }}
            </button>
            <!-- <button @click="editInvitationCode">✏️</button> -->
        </td>
    </tr>
</template>

<script setup lang="ts">
import { type PropType, ref, computed } from 'vue';
// Убедитесь, что RoleEnum импортируется, если UserRoleBadge его использует
import { type InvitationCode, RoleEnum } from '@/services/generated';
import { useAdminStore } from '@/store/admin.store';
import UserRoleBadge from '@/components/user/UserRoleBadge.vue';

const props = defineProps({
  invitation: {
    type: Object as PropType<InvitationCode>,
    required: true,
  },
});

const adminStore = useAdminStore();

// Используем геттер из стора для отслеживания статуса удаления
const isDeleting = computed(() => adminStore.getIsDeletingInvitation(props.invitation.id));

// Вычисляем валидность на основе данных приглашения
const isValid = computed(() => {
    // Тип is_valid может быть boolean или string 'true'/'false'
    // Приводим к boolean для надежности
    const validByStatus = String(props.invitation.is_valid).toLowerCase() === 'true'; // Проверка на строку 'true' или boolean true
    // Проверяем срок годности, если он есть
    const notExpired = !props.invitation.expires_at || new Date(props.invitation.expires_at) > new Date();
    return validByStatus && notExpired; // Валиден = не использован И не истек
});


const deleteInvitationCode = async () => {
    if (!confirm(`Are you sure you want to delete invitation code ${props.invitation.code}?`)) {
        return;
    }
    // Action сам установит флаг isDeleting, не нужно локальное ref
    await adminStore.deleteInvitation(props.invitation.id);
    // Опционально: показать уведомление об успехе/ошибке
    if (adminStore.errorInvitations) {
         alert(`Error deleting invitation: ${adminStore.errorInvitations}`);
         // Сбрасываем ошибку в сторе после показа
         adminStore.errorInvitations = null;
    }
};

const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    try {
         return new Date(dateString).toLocaleString();
    } catch { return dateString; }
};

</script>

<style scoped>
.invitation-item td {
    padding: 0.5rem 0.8rem;
    vertical-align: middle;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
}
 .invitation-item:hover {
    background-color: #f8f9fa;
}
.invitation-item.is-invalid {
    opacity: 0.6;
    background-color: #fcfcfc;
    /* text-decoration: line-through; */ /* Убираем зачеркивание, используем opacity */
}
/* Стилизуем невалидные коды немного иначе */
.invitation-item.is-invalid code {
    text-decoration: line-through;
}
.invitation-item code {
    font-family: monospace;
    background-color: #e9ecef;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
}
td:last-child {
    text-align: right;
}
td button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem;
    margin-left: 0.4rem;
    opacity: 0.7;
    transition: opacity 0.2s;
}
td button:hover {
    opacity: 1;
}
.delete-button:hover {
    color: red;
}
td button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}
</style>