// src/components/forum/PostItem.vue
<template>
  <div class="post-item" :id="`post-${post.id}`">
    <div class="post-author-info">
       <UserAvatar :src="post.author?.profile?.avatar" size="45" />
       <div class="author-details">
            <span class="author-name">
                {{ post.author?.first_name }} {{ post.author?.last_name }}
            </span>
            <span class="author-role">
                <UserRoleBadge :role="post.author?.role" />
            </span>
            <!-- Доп. инфо: дата регистрации, кол-во сообщений и т.п. -->
       </div>
    </div>
    <div class="post-content-container">
        <div class="post-meta">
            Posted: {{ formatDateTime(post.created_at) }}
             <span v-if="post.updated_at && post.updated_at !== post.created_at">
                (Edited: {{ formatDateTime(post.updated_at) }})
             </span>
             <!-- Ссылка на конкретный пост -->
             <a :href="`#post-${post.id}`" class="post-link">#{{ post.id }}</a>
        </div>
        <div class="post-content">
            <!-- v-html если нужно рендерить HTML, иначе использовать <p> или markdown-парсер -->
            <div v-html="post.content"></div>
        </div>
        <div class="post-actions">
             <button @click="toggleLike" :class="{ liked: post.is_liked_by_current_user }" :disabled="isLiking">
                {{ post.is_liked_by_current_user ? '❤️' : '🤍' }} {{ post.likes_count ?? 0 }}
            </button>
            <button @click="showReplyForm = !showReplyForm">💬 Reply</button>
             <!-- TODO: Edit/Delete buttons -->
        </div>
         <!-- Форма ответа -->
        <div v-if="showReplyForm" class="reply-form">
            <textarea v-model="replyContent" placeholder="Write a reply..." rows="3"></textarea>
            <button @click="submitReply" :disabled="isReplying || !replyContent.trim()">
                {{ isReplying ? 'Posting...' : 'Post Reply' }}
            </button>
            <button @click="showReplyForm = false" class="cancel-button">Cancel</button>
            <div v-if="replyError" class="error-message">{{ replyError }}</div>
        </div>
    </div>
    <!-- TODO: Обработка вложенных ответов (replies), если они есть в ForumPost -->
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref } from 'vue';
import { type ForumPost, type ForumPostRequest } from '@/services/generated';
import { useForumStore } from '@/store/forum.store';
import UserAvatar from '@/components/user/UserAvatar.vue';
import UserRoleBadge from '@/components/user/UserRoleBadge.vue';
import { format } from 'date-fns'; // Используем format для даты и времени

const props = defineProps({
  post: {
    type: Object as PropType<ForumPost>,
    required: true,
  },
  // topicId: { type: Number, required: true } // Если нужен для ответа
});

const forumStore = useForumStore();
const isLiking = ref(false); // Локальный флаг лайка для этого поста

// Состояния для ответа
const showReplyForm = ref(false);
const replyContent = ref('');
const isReplying = ref(false); // Используем isCreatingPost из стора?
const replyError = ref<string | null>(null);

const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    try { return format(new Date(dateString), 'PP pp'); } // Формат: Apr 9, 2025 12:34 PM
    catch { return dateString; }
};

const toggleLike = async () => {
    if (!props.post.id || isLiking.value) return;
    isLiking.value = true; // Устанавливаем локальный флаг
    // Используем флаг из стора для реального запроса
    if (props.post.is_liked_by_current_user) {
        await forumStore.unlikePost(props.post.id);
    } else {
        await forumStore.likePost(props.post.id);
    }
    isLiking.value = false; // Сбрасываем локальный флаг
};

const submitReply = async () => {
    const content = replyContent.value.trim();
    // Нужен ID темы, получаем из стора (currentTopic)
    const topicId = forumStore.currentTopic?.id;
    if (!content || forumStore.isCreatingPost || !props.post.id || !topicId) return;

    isReplying.value = true; // Можно использовать локальный флаг
    replyError.value = null;

    const postData: ForumPostRequest = {
        topic: topicId,
        content: content,
        parent: props.post.id // Указываем ID родительского поста
    };

    const newReply = await forumStore.createPost(postData);

    if (newReply) {
        replyContent.value = '';
        showReplyForm.value = false;
    } else {
        replyError.value = forumStore.errorPostCreate || 'Failed to post reply.';
    }
    isReplying.value = false;
};

</script>

<style scoped>
.post-item {
  display: flex;
  border: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  background-color: #fff;
}
.post-author-info {
  flex: 0 0 150px; /* Фиксированная ширина для информации об авторе */
  padding: 1rem;
  border-right: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.author-details {
    margin-top: 0.5rem;
}
.author-name {
    display: block;
    font-weight: bold;
    margin-bottom: 0.2rem;
    font-size: 0.95rem;
}
 .author-role {
     display: block; /* Значок роли под именем */
     margin-top: 0.3rem;
 }

.post-content-container {
  flex-grow: 1;
  padding: 1rem 1.5rem;
}
.post-meta {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px dashed #eee;
  display: flex;
   flex-wrap: wrap; /* Перенос для маленьких экранов */
}
.post-meta span { margin-left: 1rem;}
.post-link {
    margin-left: auto; /* Прижимаем ссылку к правому краю */
    color: #6c757d;
    text-decoration: none;
}
 .post-link:hover { text-decoration: underline; }

.post-content {
  line-height: 1.6;
  margin-bottom: 1rem;
  /* Стили для контента из v-html */
}
 .post-content :deep(p) { margin-bottom: 0.8em; }
 .post-content :deep(blockquote) {
     border-left: 3px solid #ccc;
     padding-left: 1em;
     margin-left: 0.5em;
     color: #555;
     font-style: italic;
 }

.post-actions {
    margin-top: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid #eee;
}
 .post-actions button {
    background: none;
    border: 1px solid transparent;
    color: #6c757d;
    cursor: pointer;
    font-size: 0.85rem;
    margin-right: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    transition: all 0.2s;
}
.post-actions button:hover:not(:disabled) {
    background-color: #e9ecef;
    border-color: #dee2e6;
    color: #333;
}
.post-actions button.liked {
     color: #dc3545;
     font-weight: bold;
}
.post-actions button.liked:hover {
     background-color: #f8d7da;
     border-color: #f5c6cb;
}
 .post-actions button:disabled {
     cursor: not-allowed;
     opacity: 0.6;
 }

/* Стили для формы ответа (похожи на CommentItem) */
.reply-form {
     margin-top: 1rem;
     padding-top: 1rem;
     border-top: 1px dashed #eee;
}
.reply-form textarea { width: 100%; /* ... */ }
.reply-form button { /* ... */ }
.reply-form .error-message { /* ... */ }

</style>