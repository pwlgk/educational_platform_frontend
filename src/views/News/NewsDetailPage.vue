// src/views/News/NewsDetailPage.vue
<template>
  <div class="news-detail-page">
     <div v-if="newsStore.isLoadingArticle" class="loading">Loading article...</div>
     <div v-else-if="newsStore.errorArticle" class="error">
         Error: {{ newsStore.errorArticle }}
         <button @click="fetchArticle">Retry</button>
     </div>
     <article v-else-if="article" class="article-content">
         <h1>{{ article.title }}</h1>
         <div class="article-meta">
             <span>👤 {{ article.author?.first_name }} {{ article.author?.last_name }}</span>
             <span>📅 {{ formatDate(article.created_at) }}</span>
             <span v-if="article.category">🏷️ {{ article.category?.name }}</span>
              <!-- Лайк Статьи -->
              <button @click="toggleArticleLike" :class="{ liked: article.is_liked_by_current_user }" class="like-button">
                  {{ article.is_liked_by_current_user ? '❤️' : '🤍' }} {{ article.likes_count ?? 0 }} Likes
              </button>
         </div>
         <!-- Используем v-html с осторожностью, если content содержит HTML. -->
         <!-- Если content - markdown, нужно использовать парсер. -->
         <!-- Если просто текст - используем <p> или <pre> -->
         <div class="article-body" v-html="article.content"></div>
         <!-- ИЛИ <div class="article-body"><p>{{ article.content }}</p></div> -->

         <hr />

         <!-- Комментарии -->
         <section class="comments-section">
             <h2>Comments ({{ article.comment_count ?? 0 }})</h2>

             <!-- Форма добавления нового комментария -->
             <div class="add-comment-form">
                 <h3>Leave a Comment</h3>
                 <textarea v-model="newCommentContent" placeholder="Write your comment..." rows="3"></textarea>
                 <button @click="submitNewComment" :disabled="isAddingComment || !newCommentContent.trim()">
                     {{ isAddingComment ? 'Posting...' : 'Post Comment' }}
                 </button>
                 <div v-if="addCommentError" class="error-message">{{ addCommentError }}</div>
             </div>


             <div v-if="newsStore.isLoadingComments" class="loading">Loading comments...</div>
             <div v-else-if="newsStore.errorComments && !addCommentError" class="error"> {/* Не показываем ошибку загрузки, если есть ошибка добавления */}
                 Error loading comments: {{ newsStore.errorComments }}
             </div>
             <div v-else-if="comments.length === 0" class="empty">No comments yet.</div>
             <div v-else class="comments-list">
                 <CommentItem
                    v-for="comment in comments"
                    :key="comment.id"
                    :comment="comment"
                    :article-id="article.id"
                 />
             </div>
         </section>

     </article>
     <div v-else class="empty">Article not found.</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useNewsStore } from '@/store/news.store';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import CommentItem from '@/components/news/CommentItem.vue'; // Импорт компонента комментария
import UserAvatar from '@/components/user/UserAvatar.vue'; // Если нужен аватар автора статьи

const newsStore = useNewsStore();
const route = useRoute();

// Получаем реактивные ссылки
const { currentArticle: article, currentArticleComments: comments, errorComments } = storeToRefs(newsStore);

const articleId = computed(() => Number(route.params.id));

const newCommentContent = ref('');
const isAddingComment = ref(false);
const addCommentError = ref<string | null>(null);

// Загрузка статьи и комментариев
const fetchArticle = () => {
    if (articleId.value) {
        newsStore.fetchArticleById(articleId.value);
    }
}

onMounted(fetchArticle);

// Перезагружаем статью, если ID в роуте изменился
watch(articleId, (newId, oldId) => {
    if (newId !== oldId && newId) {
        fetchArticle();
    }
});

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch { return dateString; }
};

// Лайк/дизлайк статьи
const toggleArticleLike = () => {
    if (!article.value?.id) return;
    if (article.value.is_liked_by_current_user) {
        newsStore.unlikeArticle(article.value.id);
    } else {
        newsStore.likeArticle(article.value.id);
    }
};

// Отправка нового комментария
const submitNewComment = async () => {
    const content = newCommentContent.value.trim();
    if (!content || isAddingComment.value || !article.value?.id) return;

    isAddingComment.value = true;
    addCommentError.value = null; // Сброс ошибки

    const addedComment = await newsStore.addComment(article.value.id, content);

    if (addedComment) {
        newCommentContent.value = ''; // Очищаем поле
        // Комментарий уже добавлен в список внутри стора
    } else {
        addCommentError.value = newsStore.errorComments || 'Failed to post comment.';
    }
    isAddingComment.value = false;
};

</script>

<style scoped>
.news-detail-page {
  max-width: 800px;
  margin: 1rem auto;
  padding: 1rem;
}
.loading, .error, .empty { text-align: center; padding: 2rem; color: #6c757d; }
.error button { margin-left: 1rem; }

.article-content h1 {
    margin-top: 0;
    margin-bottom: 0.5rem;
}
.article-meta {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem; /* Пространство между элементами меты */
}
.article-meta span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
}
.article-body {
  line-height: 1.7;
  margin-bottom: 2rem;
  /* Стили для контента из v-html, если нужно */
}
.article-body :deep(p) { /* Пример стилизации P внутри v-html */
    margin-bottom: 1rem;
}
.article-body :deep(h2) { /* Пример */
     margin-top: 1.5rem;
}

hr {
    margin: 2rem 0;
    border: 0;
    border-top: 1px solid #eee;
}

.comments-section h2 {
    margin-bottom: 1.5rem;
}
.add-comment-form {
    margin-bottom: 2rem;
    border: 1px solid #eee;
    padding: 1rem;
    border-radius: 4px;
    background-color: #fdfdfd;
}
.add-comment-form h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}
.add-comment-form textarea {
     width: 100%;
     padding: 0.5rem;
     border: 1px solid #ccc;
     border-radius: 4px;
     margin-bottom: 0.5rem;
     min-height: 70px;
     box-sizing: border-box;
     resize: vertical;
}
.add-comment-form button {
     padding: 0.5rem 1rem;
}
.add-comment-form button:disabled {
     background-color: #ccc;
     cursor: not-allowed;
}
.add-comment-form .error-message {
    color: red;
    font-size: 0.85rem;
    margin-top: 0.5rem;
}

.like-button {
    background: none;
    border: 1px solid #ccc;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: #555;
    transition: all 0.2s;
}
.like-button:hover {
    background-color: #f0f0f0;
    border-color: #bbb;
}
.like-button.liked {
     color: #dc3545;
     border-color: #f5c6cb;
     background-color: #f8d7da;
     font-weight: bold;
}

</style>