// src/components/messaging/ChatInfoPanel.vue
<template>
    <!-- Используем transition для плавного появления/скрытия -->
    <transition name="slide-fade">
        <div class="chat-info-panel-backdrop" @click.self="closePanel">
            <div class="chat-info-panel">
                <div class="panel-header">
                    <h3>Chat Information</h3>
                    <button @click="closePanel" class="close-button">×</button>
                </div>

                <div class="panel-content" v-if="chat">
                    <!-- Редактирование Названия (для групп) -->
                    <div class="info-section">
                        <label for="chatName">Chat Name:</label>
                        <div v-if="isEditingName" class="edit-name">
                            <input type="text" v-model="editableName" ref="nameInputRef"/>
                            <button @click="saveName" :disabled="isUpdating || !editableName.trim()">Save</button>
                            <button @click="cancelEditName" class="cancel-button">Cancel</button>
                        </div>
                        <div v-else class="display-name">
                            <span>{{ chat.name || chatDisplayName }}</span>
                            <button
                                v-if="canEditChat"
                                @click="startEditName"
                                class="edit-button"
                                title="Edit Name">✏️</button>
                        </div>
                         <div v-if="actionError" class="error-message small-error">{{ actionError }}</div>
                    </div>

                     <hr>

                     <!-- Список Участников -->
                    <div class="info-section">
                        <label>Participants ({{ participants.length }}):</label>
                        <ul class="participant-list">
                            <li v-for="user in participants" :key="user.id">
                                <UserAvatar :src="user.profile?.avatar" :alt="user.email" size="25"/>
                                <span class="participant-name">
                                    {{ user.first_name }} {{ user.last_name }}
                                    <span v-if="user.id === authStore.user?.id">(You)</span>
                                    <!-- TODO: Отображать роль/статус админа чата? -->
                                </span>
                                <!-- Кнопка удаления участника (если есть права и это не вы) -->
                                <button
                                    v-if="canManageParticipants && user.id !== authStore.user?.id"
                                    @click="removeUser(user)"
                                    class="remove-button"
                                    :disabled="isUpdating"
                                    title="Remove Participant"
                                >
                                    ×
                                </button>
                            </li>
                        </ul>
                    </div>

                    <!-- TODO: Добавление Участников (если есть права) -->
                    <div class="info-section" v-if="canManageParticipants">
                         <hr>
                        <label>Add Participants:</label>
                        <!-- Используем похожую логику поиска, как в CreateChatModal -->
                        <div class="form-group">
                             <input
                                type="text"
                                v-model="userSearchTerm"
                                @input="debouncedSearchUsers"
                                placeholder="Search users to add..."
                                autocomplete="off"
                            />
                            <ul v-if="userSearchTerm && availableUsersToAdd.length > 0" class="search-results">
                                <li v-for="user in availableUsersToAdd" :key="user.id" @click="addUser(user)">
                                    {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                                </li>
                            </ul>
                            <div v-if="userStore.getIsLoadingSearch" class="loading-search">Searching...</div>
                            <div v-if="userStore.getSearchError" class="error-search">{{ userStore.getSearchError }}</div>
                             <div v-if="userSearchTerm && !userStore.getIsLoadingSearch && searchResults.length === 0" class="loading-search">No users found.</div>
                             <div v-if="userSearchTerm && !userStore.getIsLoadingSearch && availableUsersToAdd.length === 0 && searchResults.length > 0" class="loading-search">All found users are already in chat.</div>
                        </div>
                    </div>

                    <!-- Опционально: Кнопка "Покинуть чат" -->
                    <!-- <button class="leave-button">Leave Chat</button> -->

                </div>
                 <div v-else class="loading">Loading chat details...</div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useMessagingStore } from '@/store/messaging.store';
import { useUserStore } from '@/store/user.store'; // Для поиска пользователей
import { useAuthStore } from '@/store/auth.store'; // Для ID текущего пользователя и прав
import { storeToRefs } from 'pinia';
import type { User, Chat } from '@/services/generated';
import UserAvatar from '@/components/user/UserAvatar.vue';
import debounce from 'lodash/debounce';

const props = defineProps({
  chatId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(['close']);

const messagingStore = useMessagingStore();
const userStore = useUserStore();
const authStore = useAuthStore();

// Получаем реактивные ссылки на нужные части состояния
const { getActiveChat: chat, getActiveChatParticipants: participants, getIsUpdatingChat: isUpdating, getChatActionError: actionError } = storeToRefs(messagingStore);
const { searchResults } = storeToRefs(userStore); // Результаты поиска

// Состояния для редактирования названия
const isEditingName = ref(false);
const editableName = ref('');
const nameInputRef = ref<HTMLInputElement | null>(null); // Ref для фокуса

// Состояния для поиска и добавления участников
const userSearchTerm = ref('');

// Вычисляемые свойства для прав доступа (упрощенные примеры)
const canEditChat = computed(() => {
    // Только групповые чаты + возможно проверка роли создателя/админа
    return chat.value?.chat_type === 'GROUP'; // && (authStore.isAdmin || chat.value.creator_id === authStore.user?.id);
});
const canManageParticipants = computed(() => {
     // Только групповые чаты + права админа/создателя
     return chat.value?.chat_type === 'GROUP'; // && (authStore.isAdmin || chat.value.creator_id === authStore.user?.id);
});

// Отображаемое имя (на случай, если имя группы пустое)
const chatDisplayName = computed(() => chat.value?.display_name || chat.value?.name || `Chat ${props.chatId}`);

// Фильтруем пользователей, которых можно добавить (не являются участниками)
const availableUsersToAdd = computed(() => {
    const currentParticipantIds = new Set(participants.value.map(p => p.id));
    return searchResults.value.filter(user => !currentParticipantIds.has(user.id));
});

// Отложенный поиск
const debouncedSearchUsers = debounce((event: Event) => {
    const term = (event.target as HTMLInputElement).value;
    if (term.trim().length >= 2) {
        userStore.searchUsers(term.trim());
    } else if (term.trim().length === 0) {
         userStore.clearUserSearch();
    }
}, 300);

// Функции редактирования названия
const startEditName = () => {
    if (!chat.value) return;
    editableName.value = chat.value.name || ''; // Берем текущее имя
    isEditingName.value = true;
    // Фокусируемся на поле ввода после рендера
    nextTick(() => {
        nameInputRef.value?.focus();
    });
};
const cancelEditName = () => {
    isEditingName.value = false;
     messagingStore.errorChatAction = null; // Сбрасываем ошибку
};
const saveName = async () => {
    const newName = editableName.value.trim();
    if (!chat.value || !newName || newName === chat.value.name) {
        cancelEditName();
        return;
    }
    const success = await messagingStore.updateChatName(props.chatId, newName);
    if (success) {
        isEditingName.value = false;
    }
    // Ошибка отобразится через actionError
};

// Функции управления участниками
const addUser = async (user: User) => {
    if (!chat.value) return;
    userSearchTerm.value = ''; // Очищаем поиск
    userStore.clearUserSearch();
    await messagingStore.addParticipant(props.chatId, user.id);
    // Ошибка отобразится через actionError
};
const removeUser = async (user: User) => {
     if (!chat.value) return;
     if (!confirm(`Are you sure you want to remove ${user.first_name} ${user.last_name} from the chat?`)) {
         return;
     }
    await messagingStore.removeParticipant(props.chatId, user.id);
     // Ошибка отобразится через actionError
};


const closePanel = () => {
    userStore.clearUserSearch(); // Очищаем поиск при закрытии
    emit('close');
};

// Очищаем поиск при размонтировании
import { onUnmounted } from 'vue';
onUnmounted(() => {
    userStore.clearUserSearch();
});

</script>

<style scoped>
/* Стили для полупрозрачного фона */
.chat-info-panel-backdrop {
    position: fixed; /* Или absolute, если внутри родителя с position: relative */
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3); /* Полупрозрачный фон */
    z-index: 900; /* Ниже модалок, но выше остального */
    display: flex;
    justify-content: flex-end; /* Панель справа */
}

/* Стили для самой панели */
.chat-info-panel {
    width: 100%;
    max-width: 350px; /* Ширина панели */
    height: 100%;
    background-color: #fff;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* Прокрутка, если контент не влезает */
}

/* Анимация появления/скрытия */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slide-fade-enter-to, .slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}


.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f8f9fa;
    flex-shrink: 0;
}
.panel-header h3 {
    margin: 0;
    font-size: 1.1rem;
}
.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    color: #6c757d;
}

.panel-content {
    padding: 1rem 1.5rem;
    flex-grow: 1;
}
.loading { text-align: center; padding: 2rem; color: #6c757d; }

.info-section {
    margin-bottom: 1.5rem;
}
.info-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
}
hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 1.5rem 0;
}

/* Редактирование названия */
.display-name {
    display: flex;
    align-items: center;
    font-size: 1rem;
}
.display-name span {
    flex-grow: 1;
    margin-right: 0.5rem;
}
.edit-button, .remove-button {
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    padding: 0.2rem;
}
.edit-button:hover, .remove-button:hover {
    opacity: 1;
}
.edit-name {
    display: flex;
    gap: 0.5rem;
}
.edit-name input {
    flex-grow: 1;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.edit-name button {
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #ccc;
}
.edit-name button:disabled { cursor: not-allowed; opacity: 0.6; }
.edit-name button.cancel-button { background-color: #f8f9fa; }

/* Список участников */
.participant-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.participant-list li {
    display: flex;
    align-items: center;
    padding: 0.4rem 0;
    border-bottom: 1px solid #f0f0f0;
}
.participant-list li:last-child { border-bottom: none; }
.participant-name {
    margin-left: 0.6rem;
    flex-grow: 1;
    font-size: 0.95rem;
}
.participant-name span { /* (You) */
    font-size: 0.8rem;
    color: #6c757d;
    margin-left: 0.3rem;
}
.remove-button { color: #dc3545; margin-left: auto; }

/* Поиск участников для добавления */
.form-group { position: relative; margin-bottom: 0.5rem; } /* Уменьшаем отступ */
.search-results {
    list-style: none;
    padding: 0;
    margin: 0.2rem 0 0 0; /* Сразу под инпутом */
    border: 1px solid #ccc;
    border-top: none; /* Убираем верхнюю границу */
    border-radius: 0 0 4px 4px; /* Скругляем только низ */
    max-height: 150px;
    overflow-y: auto;
    position: absolute;
    background-color: white;
    width: 100%; /* На всю ширину инпута */
    left: 0;
    z-index: 1001;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    box-sizing: border-box;    position: absolute; /* Позиционирование под инпутом */
    width: 100%;
    left: 0;
    top: 100%; /* Сразу под инпутом */
    margin-top: 1px; /* Небольшой отступ */
    max-height: 180px;
     z-index: 10; /* Выше остального в панели */
}
.loading-search, .error-search { font-size: 0.8rem; padding: 0.3rem 0; }

.error-message.small-error {
    font-size: 0.85rem;
    color: red;
    margin-top: 0.5rem;
}
</style>