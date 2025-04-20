// src/views/Forum/ForumTopicPage.vue
<template>
    <div class="forum-page topic-page">
        <!-- Название темы и кнопки управления -->
        <div v-if="topic" class="topic-header">
            <h1>{{ topic.title }}</h1>
            <div class="topic-actions">
                 <!-- TODO: Кнопки Закрыть/Открыть, Закрепить/Открепить (для модераторов/админов) -->
                 <button @click="showReplyForm = true">Reply to Topic</button>
            </div>
        </div>
        <h1 v-else-if="!forumStore.isLoadingTopic">Topic Not Found</h1>

         <!-- Форма ответа на саму тему (верхнего уровня) -->
         <div v-if="showReplyForm" class="reply-form topic-reply-form">
             <h3>Post a Reply</h3>
            <textarea v-model="newPostContent" placeholder="Write your reply..." rows="5"></textarea>
            <button @click="submitNewPost" :disabled="forumStore.isCreatingPost || !newPostContent.trim()">
                {{ forumStore.isCreatingPost ? 'Posting...' : 'Post Reply' }}
            </button>
            <button @click="showReplyForm = false" class="cancel-button">Cancel</button>
            <div v-if="forumStore.errorPostCreate" class="error-message">{{ forumStore.errorPostCreate }}</div>
        </div>


        <div v-if="forumStore.isLoadingTopic || forumStore.isLoadingPosts" class="loading">Loading topic and posts...</div>
        <div v-else-if="forumStore.errorTopic || forumStore.errorPosts" class="error">
            <span v-if="forumStore.errorTopic">Error loading topic: {{ forumStore.errorTopic }}</span>
            <span v-if="forumStore.errorPosts">Error loading posts: {{ forumStore.errorPosts }}</span>
            <button @click="fetchData">Retry</button>
        </div>
         <div v-else-if="!topic" class="empty">Topic data could not be loaded.</div>
         <div v-else-if="posts.length === 0" class="empty">No posts in this topic yet.</div>
        <!-- Список постов -->
        <div v-else class="posts-list">
            <PostItem v-for="post in posts" :key="post.id" :post="post" />
        </div>
         <!-- TODO: Пагинация для постов -->
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useForumStore } from '@/store/forum.store';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import PostItem from '@/components/forum/PostItem.vue';
import type { ForumPostRequest } from '@/services/generated';

const forumStore = useForumStore();
const route = useRoute();

// Получаем реактивные ссылки на текущую тему и ее посты
const { currentTopic: topic, currentTopicPosts: posts } = storeToRefs(forumStore);

const topicId = computed(() => Number(route.params.topicId));

// Состояния для формы ответа на тему
const showReplyForm = ref(false);
const newPostContent = ref('');

// Функция загрузки данных
const fetchData = () => {
    if (topicId.value) {
        forumStore.fetchTopicAndPosts(topicId.value);
    }
};

onMounted(fetchData);

// Перезагружаем, если ID темы изменился
watch(topicId, (newId, oldId) => {
     if (newId && newId !== oldId) {
        fetchData();
    }
});

// Отправка нового поста (ответ на тему)
const submitNewPost = async () => {
     const content = newPostContent.value.trim();
     if (!content || forumStore.isCreatingPost || !topic.value) return;

     const postData: ForumPostRequest = {
         topic: topic.value.id, // ID текущей темы
         content: content,
         parent: undefined // Ответ на тему, не на пост
     };

     const success = await forumStore.createPost(postData);
     if (success) {
         newPostContent.value = '';
         showReplyForm.value = false;
         // Пост уже добавлен в список в сторе
     }
     // Ошибка отобразится через forumStore.errorPostCreate
};


// Очищаем состояние при уходе со страницы
import { onUnmounted } from 'vue';
onUnmounted(() => {
    forumStore.clearCurrentTopicAndPosts();
});

</script>

<style scoped>
.forum-page { max-width: 950px; margin: 1rem auto; padding: 1rem; }
.loading, .error, .empty { text-align: center; padding: 2rem; color: #6c757d; }
.error button { margin-left: 1rem; }

.topic-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Выравнивание по верху */
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
}
.topic-header h1 {
    margin: 0;
    font-size: 1.6rem;
    flex-grow: 1;
    margin-right: 1rem;
}
.topic-actions button {
    margin-left: 0.5rem;
     /* Стили для кнопок */
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
     background-color: #6c757d;
     color: white;
     border: 1px solid #6c757d;
}
 .topic-actions button:hover {
     background-color: #5a6268;
 }

.topic-reply-form {
     margin-bottom: 2rem;
     padding: 1.5rem;
     background-color: #f8f9fa;
     border: 1px solid #dee2e6;
     border-radius: 5px;
}
 .topic-reply-form h3 { margin-top: 0; }
 .topic-reply-form textarea { width: 100%; min-height: 100px; /* ... */ }
 .topic-reply-form button { margin-top: 0.5rem; margin-right: 0.5rem; /* ... */ }
 .topic-reply-form .error-message { /* ... */ }

.posts-list {
    /* Стили для контейнера постов */
}

</style>