// src/components/messaging/MessageInput.vue
<template>
  <form @submit.prevent="sendMessage" class="message-input-area">
    <!-- TODO: Кнопка для прикрепления файла -->
    <textarea
      ref="textareaRef"
      v-model="messageText"
      placeholder="Type a message..."
      rows="1"
      @keydown.enter.prevent="handleEnterKey"
      @input="adjustTextareaHeight"
      :disabled="disabled || isSending"
    ></textarea>
    <button type="submit" :disabled="disabled || isSending || !messageText.trim()">
      {{ isSending ? '...' : '➤' }} <!-- Иконка отправки -->
    </button>
  </form>
  <div v-if="error" class="error-message">{{ error }}</div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

// Пропсы для управления состоянием извне
const props = defineProps({
    disabled: { type: Boolean, default: false }, // Отключить ввод (например, если чат не выбран)
    isSending: { type: Boolean, default: false }, // Индикатор отправки
    error: { type: String, default: null } // Ошибка отправки
});

// Событие для отправки сообщения родителю
const emit = defineEmits(['send']);

const messageText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const sendMessage = () => {
    const text = messageText.value.trim();
    if (text && !props.isSending) {
        emit('send', text); // Отправляем текст сообщения
        messageText.value = ''; // Очищаем поле
        adjustTextareaHeight(); // Сбрасываем высоту
    }
};

// Отправка по Enter, Shift+Enter для новой строки
const handleEnterKey = (event: KeyboardEvent) => {
    if (!event.shiftKey) {
        sendMessage();
    }
    // Если нажат Shift+Enter, браузер сам добавит новую строку
};

// Динамическая высота textarea
const adjustTextareaHeight = async () => {
    await nextTick(); // Ждем обновления DOM после ввода
    if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'; // Сброс высоты
        // Устанавливаем высоту по содержимому, но не более max-height
        textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
    }
};

</script>

<style scoped>
.message-input-area {
  display: flex;
  align-items: flex-end; /* Выравниваем по нижнему краю */
  padding: 0.5rem 0.8rem;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}
textarea {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 18px; /* Скругление поля ввода */
  padding: 0.5rem 1rem;
  resize: none; /* Запрещаем ручное изменение размера */
  overflow-y: auto; /* Полоса прокрутки, если текст большой */
  min-height: 38px; /* Минимальная высота в одну строку */
  max-height: 120px; /* Максимальная высота */
  box-sizing: border-box;
  line-height: 1.4;
  margin-right: 0.5rem;
  font-family: inherit;
   font-size: 0.95rem;
}
textarea:disabled {
    background-color: #e9ecef;
}
button {
  flex-shrink: 0; /* Не сжимать кнопку */
  width: 38px; /* Квадратная кнопка */
  height: 38px;
  border-radius: 50%; /* Круглая кнопка */
  border: none;
  background-color: #0d6efd;
  color: white;
  font-size: 1.2rem; /* Размер иконки отправки */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}
button:hover:not(:disabled) {
  background-color: #0b5ed7;
}
button:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}
 .error-message {
     color: red;
     font-size: 0.8rem;
     padding: 0.3rem 0.8rem 0 0.8rem; /* Паддинг под формой */
     width: 100%;
     box-sizing: border-box;
     background-color: #f8f9fa; /* Тот же фон, что и у формы */
 }
</style>