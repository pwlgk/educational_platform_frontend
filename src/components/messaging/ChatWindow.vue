// src/components/messaging/ChatWindow.vue
<template>
    <div class="chat-window">
        <!-- Опционально: Шапка с именем чата и действиями -->
        <div class="chat-header">
            <h3>{{ chatDisplayName }}</h3>
            <button @click="showChatInfoPanel = true" class="info-button" title="Chat Info">
                ℹ️
            </button>
            <!-- TODO: Добавить кнопки (инфо о чате, участники, настройки...) -->
        </div>

        <!-- Контейнер для сообщений -->
        <div class="messages-container" ref="messagesContainerRef">
             <div v-if="messagingStore.getIsLoadingMessages" class="loading">Loading messages...</div>
             <div v-else-if="messagingStore.errorMessages" class="error">
                 Error: {{ messagingStore.errorMessages }}
                 <button @click="loadMessages">Retry</button>
            </div>
            <!-- ИЗМЕНЕНИЕ: Используем activeChatMessages -->
            <div v-else-if="activeChatMessages.length === 0" class="empty">No messages yet. Start the conversation!</div>
             <!-- Отображение сообщений -->
             <MessageBubble
                v-else
                v-for="message in activeChatMessages"
                :key="message.id"
                :message="message"
                :show-sender-name="isGroupChat"
             />
        </div>

        <!-- Компонент ввода сообщения -->
        <MessageInput
    :disabled="!chatId || messagingStore.getIsLoadingMessages"
    :is-sending="messagingStore.isSendingMessage"
    :error="errorSending?.value"  
    @send="handleSendMessage"
/>
<ChatInfoPanel
            v-if="showChatInfoPanel"
            :chat-id="chatId"
            @close="showChatInfoPanel = false"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useMessagingStore } from '@/store/messaging.store';
import { storeToRefs } from 'pinia';
import MessageBubble from './MessageBubble.vue'; // Компонент для одного сообщения
import ChatInfoPanel from './ChatInfoPanel.vue'; // <--- Импорт панели информации
import MessageInput from './MessageInput.vue'; // Компонент для поля ввода
import { format } from 'date-fns'; // Для форматирования времени (если используется в MessageBubble или здесь)

// Получаем ID чата как пропс
const props = defineProps({
    chatId: {
        type: [String, Number],
        required: true // Обязательный, так как рендерится только при активном чате
    }
});

const messagingStore = useMessagingStore();
// Получаем реактивные ссылки на state и getters
// Используем activeChatMessages напрямую в шаблоне
const { activeChatMessages, errorMessages, errorSending } = storeToRefs(messagingStore);

// Локальная ссылка на контейнер сообщений для скролла
const messagesContainerRef = ref<HTMLElement | null>(null);
const showChatInfoPanel = ref(false);

// Функция для загрузки/перезагрузки сообщений
const loadMessages = () => {
    // setActiveChat сам вызовет fetchMessages
    messagingStore.setActiveChat(props.chatId);
};

// Загружаем при монтировании (если setActiveChat не был вызван ранее)
// Если компонент всегда перемонтируется через :key в ChatLayout, это может быть не нужно
// onMounted(loadMessages);

// Если компонент НЕ перемонтируется через :key в ChatLayout, нужно следить за chatId
// watch(() => props.chatId, (newChatId) => {
//     if (newChatId) {
//         loadMessages();
//     }
// }, { immediate: true }); // immediate: true - чтобы загрузить при первой отрисовке

// Геттер для получения данных активного чата
const activeChat = computed(() => messagingStore.getActiveChat);

// Определяем, групповой ли это чат (для отображения имен отправителей)
const isGroupChat = computed(() => activeChat.value?.chat_type === 'GROUP'); // Убедитесь, что chat_type есть в типе Chat

// Отображаемое имя чата
const chatDisplayName = computed(() => activeChat.value?.display_name || `Chat ${props.chatId}`);

// Обработчик отправки сообщения (вызывается из MessageInput)
const handleSendMessage = async (messageContent: string) => {
    await messagingStore.sendMessage(props.chatId, messageContent);
    // Прокрутка вниз после успешной отправки (если не было ошибки)
    if (!messagingStore.errorSending) {
         scrollToBottom();
    }
};

// Прокрутка к последнему сообщению
const scrollToBottom = async (behavior: ScrollBehavior = 'smooth') => {
    // Ждем рендера нового сообщения
    await nextTick();
    if (messagesContainerRef.value) {
        messagesContainerRef.value.scrollTo({
            top: messagesContainerRef.value.scrollHeight,
            behavior: behavior
        });
    }
};

// Прокрутка при первой загрузке сообщений и при добавлении новых
// Следим за ИЗМЕНЕНИЕМ МАССИВА activeChatMessages
watch(activeChatMessages, (newMessages, oldMessages) => {
    // Прокручиваем, если сообщений стало больше или если это первая загрузка
    if (newMessages.length > (oldMessages?.length ?? 0)) {
        scrollToBottom('smooth'); // Плавно для новых
    } else if (newMessages.length > 0 && (oldMessages?.length ?? 0) === 0) {
        // Мгновенно при первой загрузке непустого списка
        scrollToBottom('auto');
    }
}, { deep: true }); // deep: true - отслеживать изменения внутри объектов массива (не всегда нужно)

// Прокрутка при смене чата (после загрузки сообщений)
// Этот watch нужен, если ChatWindow НЕ перемонтируется через :key
watch(() => props.chatId, async (newChatId, oldChatId) => {
     if (newChatId !== oldChatId) {
         console.log(`ChatWindow: Chat ID changed to ${newChatId}. Waiting for messages to load...`);
         // Ждем завершения загрузки сообщений для нового чата
         await nextTick(); // Первый тик для смены ID
         // Используем цикл ожидания, пока стор грузит сообщения
         while (messagingStore.getIsLoadingMessages) {
             await new Promise(res => setTimeout(res, 50));
         }
         console.log(`ChatWindow: Messages for chat ${newChatId} loaded. Scrolling to bottom.`);
         await nextTick(); // Еще тик для рендера сообщений
         scrollToBottom('auto'); // Мгновенная прокрутка для нового чата
     }
});

// Возможно, нужно прокрутить при самом первом монтировании, если сообщения уже есть в сторе
onMounted(async () => {
    if (activeChatMessages.value.length > 0) {
        await nextTick(); // Ждем рендера
        scrollToBottom('auto');
    }
});


</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%; /* Занимает всю высоту родителя (active-chat-panel) */
  overflow: hidden; /* Предотвращаем выход контента */
   background-color: #fff;
}
.chat-header {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #ccc;
    background-color: #f8f9fa;
    flex-shrink: 0; /* Не сжимать шапку */
    display: flex; /* Добавляем flex для кнопки */
    justify-content: space-between;
    align-items: center;
}
.chat-header h3 {
    margin: 0;
    font-size: 1.1rem;
}
.info-button {
    background: none;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    color: #6c757d;
    padding: 0 0.5rem;
}
.info-button:hover {
    color: #333;
}

.messages-container {
  flex-grow: 1; /* Занимает основное место */
  overflow-y: auto; /* Прокрутка сообщений */
  padding: 1rem;
}

.loading, .error, .empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-size: 1.1rem; /* Крупнее для заметности */
  text-align: center;
}
.error button {
    margin-left: 1rem;
    font-size: 0.9rem; /* Уменьшим кнопку retry */
    padding: 0.3rem 0.8rem;
}

/* Компонент MessageInput будет иметь свои стили */

</style>