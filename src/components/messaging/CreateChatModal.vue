// src/components/messaging/CreateChatModal.vue
<template>
    <div class="modal-backdrop" @click.self="closeModal">
        <div class="modal-content">
            <h2>Create New Chat</h2>

            <form @submit.prevent="submitCreateChat">
                <!-- Выбор типа чата -->
                <div class="form-group">
                    <label>Chat Type:</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" value="PRIVATE" v-model="chatType" @change="resetSelections"/> Private
                        </label>
                        <label>
                            <input type="radio" value="GROUP" v-model="chatType" @change="resetSelections"/> Group
                        </label>
                    </div>
                </div>

                <!-- Поиск и выбор для приватного чата -->
                <div v-if="chatType === 'PRIVATE'" class="form-group">
                    <label for="privateUserSearch">Find User:</label>
                    <input
                        type="text"
                        id="privateUserSearch"
                        v-model="privateSearchTerm"
                        @input="debouncedSearchUsers"
                        placeholder="Enter email, first or last name..."
                        autocomplete="off"
                        :disabled="!!selectedPrivateUser"
                    />
                    <!-- Результаты поиска -->
                    <ul v-if="privateSearchTerm && searchResults.length > 0 && !selectedPrivateUser" class="search-results">
                         <li v-for="user in searchResults" :key="user.id" @click="selectPrivateUser(user)">
                             {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                         </li>
                    </ul>
                    <!-- Выбранный пользователь -->
                     <div v-if="selectedPrivateUser" class="selected-user private-selected">
                        Selected: {{ selectedPrivateUser.first_name }} {{ selectedPrivateUser.last_name }}
                        <button type="button" @click="deselectPrivateUser" class="remove-user-btn">×</button>
                     </div>
                     <!-- Статус поиска -->
                    <div v-if="userStore.getIsLoadingSearch" class="loading-search">Searching...</div>
                    <div v-if="userStore.getSearchError" class="error-search">{{ userStore.getSearchError }}</div>
                    <div v-if="privateSearchTerm && !userStore.getIsLoadingSearch && searchResults.length === 0" class="loading-search">No users found.</div>
                </div>

                <!-- Поля для группового чата -->
                <div v-if="chatType === 'GROUP'">
                    <div class="form-group">
                        <label for="groupName">Group Name:</label>
                        <input type="text" id="groupName" v-model="groupName" required />
                    </div>
                    <div class="form-group">
                        <label for="groupUserSearch">Find Participants:</label>
                         <input
                            type="text"
                            id="groupUserSearch"
                            v-model="groupSearchTerm"
                            @input="debouncedSearchUsers"
                            placeholder="Search users to add..."
                            autocomplete="off"
                        />
                         <!-- Результаты поиска -->
                        <ul v-if="groupSearchTerm && availableUsersForGroup.length > 0" class="search-results">
                            <li v-for="user in availableUsersForGroup" :key="user.id" @click="addGroupParticipant(user)">
                                 {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                            </li>
                        </ul>
                         <!-- Статус поиска -->
                         <div v-if="userStore.getIsLoadingSearch" class="loading-search">Searching...</div>
                         <div v-if="userStore.getSearchError" class="error-search">{{ userStore.getSearchError }}</div>
                         <div v-if="groupSearchTerm && !userStore.getIsLoadingSearch && searchResults.length === 0" class="loading-search">No users found.</div>
                         <div v-if="groupSearchTerm && !userStore.getIsLoadingSearch && availableUsersForGroup.length === 0 && searchResults.length > 0" class="loading-search">All found users already selected.</div>


                        <!-- Выбранные участники -->
                         <label v-if="selectedGroupParticipants.length > 0" class="selected-label">Selected Participants:</label>
                         <ul class="selected-participants">
                            <li v-for="user in selectedGroupParticipants" :key="user.id">
                                {{ user.first_name }} {{ user.last_name }}
                                <button type="button" @click="removeGroupParticipant(user)" class="remove-user-btn">×</button>
                            </li>
                         </ul>
                    </div>
                </div>

                <!-- Ошибки и кнопка -->
                 <div v-if="createError" class="error-message">{{ createError }}</div>
                 <div class="modal-actions">
                     <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
                     <button type="submit" :disabled="isSubmitting || !isValidSelection">
                         {{ isSubmitting ? 'Creating...' : 'Create Chat' }}
                     </button>
                 </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMessagingStore } from '@/store/messaging.store';
import { useUserStore } from '@/store/user.store'; // Используем userStore
import type { ChatRequest, User, Chat } from '@/services/generated'; // Импортируем Chat
import { storeToRefs } from 'pinia';
import debounce from 'lodash/debounce';

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'chat-created', chat: Chat): void; // Типизируем событие
}>();

const messagingStore = useMessagingStore();
const userStore = useUserStore();

// Состояния формы
const chatType = ref<'PRIVATE' | 'GROUP'>('PRIVATE');
const groupName = ref('');
const isSubmitting = ref(false);
const createError = ref<string | null>(null);

// Состояния поиска
const privateSearchTerm = ref('');
const groupSearchTerm = ref('');

// Получаем результаты поиска из userStore
const { searchResults } = storeToRefs(userStore);
// const { getIsLoadingSearch, getSearchError } = storeToRefs(userStore); // Можно и так, если нужно в шаблоне

// Состояния выбора
const selectedPrivateUser = ref<User | null>(null);
const selectedGroupParticipants = ref<User[]>([]);


// Отложенный вызов поиска пользователей в userStore
const debouncedSearchUsers = debounce((event: Event) => {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;
    if (term.trim().length >= 2) {
        userStore.searchUsers(term.trim());
    } else if (term.trim().length === 0) {
        userStore.clearUserSearch(); // Очищаем, если стерли все
    }
    // Не очищаем при < 2 символов, чтобы не сбрасывать результаты сразу
}, 300); // Уменьшил задержку

// Сброс выбора при смене типа чата
const resetSelections = () => {
    privateSearchTerm.value = '';
    groupSearchTerm.value = '';
    selectedPrivateUser.value = null;
    selectedGroupParticipants.value = [];
    userStore.clearUserSearch();
    createError.value = null;
};

// Выбор/отмена для приватного чата
const selectPrivateUser = (user: User) => {
    selectedPrivateUser.value = user;
    privateSearchTerm.value = '';
    userStore.clearUserSearch();
};
const deselectPrivateUser = () => {
    selectedPrivateUser.value = null;
     privateSearchTerm.value = ''; // Очищаем и поле поиска
     userStore.clearUserSearch();
};

// Добавление/удаление для группы
const addGroupParticipant = (user: User) => {
    if (!selectedGroupParticipants.value.some(p => p.id === user.id)) {
        selectedGroupParticipants.value.push(user);
    }
    groupSearchTerm.value = '';
    userStore.clearUserSearch();
};
const removeGroupParticipant = (userToRemove: User) => {
    selectedGroupParticipants.value = selectedGroupParticipants.value.filter(
        user => user.id !== userToRemove.id
    );
};

// Фильтруем доступных для добавления в группу
const availableUsersForGroup = computed(() => {
    return searchResults.value.filter(
        user => !selectedGroupParticipants.value.some(p => p.id === user.id)
    );
});

// Проверка валидности
const isValidSelection = computed(() => {
    if (chatType.value === 'PRIVATE') {
        return !!selectedPrivateUser.value;
    } else { // GROUP
        return groupName.value.trim() !== '' && selectedGroupParticipants.value.length > 0;
    }
});

// Закрытие модалки
const closeModal = () => {
    resetSelections(); // Сбрасываем состояние
    emit('close');
};

// Отправка формы
const submitCreateChat = async () => {
    if (!isValidSelection.value) return;

    isSubmitting.value = true;
    createError.value = null;

    let requestData: ChatRequest = {};

    if (chatType.value === 'PRIVATE' && selectedPrivateUser.value) {
        // В ChatRequest поле other_user_id может быть необязательным
        requestData = { other_user_id: selectedPrivateUser.value.id };
    } else if (chatType.value === 'GROUP') {
         // В ChatRequest поле name может быть необязательным, participant_ids тоже
        requestData = {
            name: groupName.value,
            participant_ids: selectedGroupParticipants.value.map(user => user.id)
        };
    } else {
         createError.value = "Invalid chat type or selection.";
         isSubmitting.value = false;
         return;
    }

    try {
        // Вызываем action из messagingStore
        const newChat = await messagingStore.createChat(requestData);
        if (newChat) {
             emit('chat-created', newChat); // Передаем созданный чат
             closeModal();
        } else {
            // Ошибка из messagingStore.errorCreatingChat
            createError.value = messagingStore.errorCreatingChat || 'Failed to create chat.';
        }
    } catch (err) {
         console.error("Error submitting create chat:", err);
         createError.value = 'An unexpected error occurred.';
    } finally {
        isSubmitting.value = false;
    }
};

// Очищаем результаты поиска userStore при размонтировании компонента
// import { onUnmounted } from 'vue'; // Добавить в импорты
// onUnmounted(() => {
//     userStore.clearUserSearch();
// });

</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative; /* Для позиционирования search-results */
}

.modal-content h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
}

.form-group {
    margin-bottom: 1.2rem;
    position: relative; /* Для позиционирования search-results */
}
.form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 500;
}
.form-group input[type="text"],
.form-group input[type="number"] {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
.form-group small {
    display: block;
    margin-top: 0.3rem;
    font-size: 0.8rem;
    color: #6c757d;
}

.radio-group label {
    margin-right: 1.5rem;
    font-weight: normal;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
}
.radio-group input[type="radio"] {
    margin-right: 0.4rem;
    width: auto;
}

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
    box-sizing: border-box;
}
.search-results li {
    padding: 0.5rem 0.8rem;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}
.search-results li:last-child {
    border-bottom: none;
}
.search-results li:hover {
    background-color: #f0f0f0;
}

.loading-search, .error-search {
    font-size: 0.85rem;
    padding: 0.3rem 0.8rem; /* Паддинг внутри поля */
    color: #6c757d;
    border: 1px solid transparent; /* Для сохранения высоты */
    min-height: 1.5em; /* Примерная высота строки */
}
.error-search { color: red; }


.selected-label {
    display: block;
    margin-top: 1rem;
     margin-bottom: 0.3rem;
    font-weight: 500;
}
.selected-participants {
    list-style: none;
    padding: 0;
    margin: 0 0 0.5rem 0; /* Отступ снизу */
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem; /* Пространство между участниками */
}

.selected-user, .selected-participants li {
    background-color: #e0eafc; /* Цвет фона для выбранных */
    padding: 0.3rem 0.6rem;
    border-radius: 15px;
    display: inline-flex;
    align-items: center;
    font-size: 0.9rem;
    border: 1px solid #b8cff8; /* Граница */
}

.remove-user-btn {
    background: none;
    border: none;
    color: #6c757d;
    margin-left: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    font-size: 1.1rem;
    line-height: 1;
    padding: 0 0.2rem;
}
.remove-user-btn:hover {
    color: #333;
}

.error-message {
    color: red;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    gap: 1rem;
}
.modal-actions button {
    padding: 0.6rem 1.2rem;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    font-weight: 500;
}
.modal-actions button[type="submit"] {
    background-color: #0d6efd;
    color: white;
    border-color: #0d6efd;
}
.modal-actions button[type="submit"]:disabled {
    background-color: #6c757d;
     border-color: #6c757d;
     cursor: not-allowed;
}
.modal-actions button.cancel-button {
    background-color: #f8f9fa;
    color: #333;
    border-color: #ccc;
}
.modal-actions button.cancel-button:hover {
    background-color: #e2e6ea;
}

</style>