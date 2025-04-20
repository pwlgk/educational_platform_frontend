// src/components/news/CommentItem.vue
<template>
  <div class="comment-item" :style="{ marginLeft: `${depth * 20}px` }">
    <div class="comment-header">
      <UserAvatar :src="comment.author?.profile?.avatar" size="25" />
      <span class="author-name">{{ comment.author?.first_name }} {{ comment.author?.last_name }}</span>
      <span class="timestamp">{{ timeAgo(comment.created_at) }}</span>
    </div>
    <div class="comment-content">
      <p>{{ comment.content }}</p>
    </div>
    <div class="comment-actions">
       <button @click="toggleLike" :class="{ liked: comment.is_liked_by_current_user }" :disabled="isLiking">
           {{ comment.is_liked_by_current_user ? '❤️' : '🤍' }} {{ comment.likes_count ?? 0 }}
       </button>
       <button @click="showReplyForm = !showReplyForm" v-if="depth < maxDepth">💬 Reply</button>
       <!-- TODO: Добавить кнопки Edit/Delete, если пользователь автор или админ -->
    </div>

    <!-- Форма ответа (появляется по клику) -->
    <div v-if="showReplyForm" class="reply-form">
        <textarea v-model="replyContent" placeholder="Write a reply..." rows="2"></textarea>
        <button @click="submitReply" :disabled="isReplying || !replyContent.trim()">
            {{ isReplying ? 'Replying...' : 'Post Reply' }}
        </button>
        <button @click="showReplyForm = false" class="cancel-button">Cancel</button>
        <div v-if="replyError" class="error-message">{{ replyError }}</div>
    </div>

    <!-- Рекурсивно отображаем ответы -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
        <CommentItem
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :article-id="articleId"
            :depth="depth + 1"
            :max-depth="maxDepth"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, computed } from 'vue';
import { type NewsComment } from '@/services/generated';
import { useNewsStore } from '@/store/news.store';
import { useAuthStore } from '@/store/auth.store'; // Для проверки прав на edit/delete
import UserAvatar from '@/components/user/UserAvatar.vue';
import { formatDistanceToNowStrict } from 'date-fns';

const props = defineProps({
  comment: {
    type: Object as PropType<NewsComment>,
    required: true,
  },
  articleId: { // ID статьи нужен для добавления ответа
      type: Number,
      required: true,
  },
  depth: { // Уровень вложенности
      type: Number,
      default: 0,
  },
  maxDepth: { // Максимальная глубина для ответа
      type: Number,
      default: 3, // Ограничим ответы 3 уровнями
  }
});

const newsStore = useNewsStore();
const authStore = useAuthStore(); // Для проверки прав

const isLiking = ref(false);
const showReplyForm = ref(false);
const replyContent = ref('');
const isReplying = ref(false);
const replyError = ref<string | null>(null);

const timeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true });
    } catch { return dateString; }
}

const toggleLike = async () => {
    if (!props.comment.id || isLiking.value) return;
    isLiking.value = true;
    if (props.comment.is_liked_by_current_user) {
        await newsStore.unlikeComment(props.comment.id);
    } else {
        await newsStore.likeComment(props.comment.id);
    }
     isLiking.value = false;
}

const submitReply = async () => {
    const content = replyContent.value.trim();
    if (!content || isReplying.value || !props.comment.id) return;

    isReplying.value = true;
    replyError.value = null;

    const newReply = await newsStore.addComment(props.articleId, content, props.comment.id);

    if (newReply) {
        replyContent.value = ''; // Очищаем поле
        showReplyForm.value = false; // Скрываем форму
    } else {
        replyError.value = newsStore.errorComments || 'Failed to post reply.';
    }
    isReplying.value = false;
}

// Пример проверки прав на редактирование/удаление
// const canEditOrDelete = computed(() => {
//     const currentUser = authStore.getUser;
//     if (!currentUser) return false;
//     // Админ может все ИЛИ автор комментария может свое
//     return authStore.isAdmin || currentUser.id === props.comment.author?.id;
// });

</script>

<style scoped>
.comment-item {
  border-top: 1px solid #f0f0f0;
  padding: 1rem 0 0.5rem 0;
}
.comment-item:first-child {
    border-top: none; /* Убираем верхнюю границу у первого коммента в группе */
}
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.author-name {
  font-weight: bold;
  margin-left: 0.5rem;
}
.timestamp {
  font-size: 0.8rem;
  color: #6c757d;
  margin-left: auto; /* Прижимаем к правому краю */
}
.comment-content p {
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
  white-space: pre-wrap; /* Сохраняем переносы строк */
}
.comment-actions button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 0.8rem;
  opacity: 0.8;
}
.comment-actions button:hover {
    opacity: 1;
     color: #0d6efd;
}
 .comment-actions button.liked {
    color: #dc3545; /* Цвет для лайка */
    font-weight: bold;
 }
 .comment-actions button:disabled {
     cursor: not-allowed;
     opacity: 0.5;
 }

 .reply-form {
     margin-top: 0.8rem;
     margin-left: 25px; /* Небольшой отступ для формы ответа */
     padding-left: 1rem;
     border-left: 2px solid #e9ecef;
 }
  .reply-form textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      min-height: 50px;
      box-sizing: border-box;
  }
   .reply-form button {
       padding: 0.3rem 0.8rem;
       font-size: 0.85rem;
       margin-right: 0.5rem;
       border-radius: 4px;
       cursor: pointer;
   }
   .reply-form button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
   }
   .reply-form button.cancel-button {
       background-color: #f8f9fa;
       color: #333;
       border: 1px solid #ccc;
   }
   .reply-form .error-message {
       color: red;
       font-size: 0.8rem;
       margin-top: 0.5rem;
   }

.replies-container {
  /* Стили для контейнера ответов, если нужны */
}
</style>