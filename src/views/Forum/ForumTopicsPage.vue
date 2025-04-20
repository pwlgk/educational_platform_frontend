// src/views/Forum/ForumTopicsPage.vue
<template>
  <div class="forum-page">
    <!-- Отображаем инфо о категории, если загружено -->
    <h1 v-if="category">{{ category.name }}</h1>
    <p v-if="category?.description">{{ category.description }}</p>
    <h1 v-else>Topics</h1>

     <!-- Кнопка создания темы -->
     <div class="page-actions">
         <router-link :to="{ name: 'ForumCreateTopic', params: { categorySlug: categorySlug } }" class="btn btn-primary">
             Create New Topic
         </router-link>
     </div>


    <div v-if="forumStore.isLoadingTopics" class="loading">Loading topics...</div>
    <div v-else-if="forumStore.errorTopics" class="error">
      Error: {{ forumStore.errorTopics }}
      <button @click="fetchTopics">Retry</button>
    </div>
    <div v-else-if="topics.length === 0" class="empty">No topics found in this category.</div>
    <table v-else class="topics-table">
      <thead>
        <tr>
          <th>Topic</th>
          <th>Stats</th>
          <th>Last Post</th>
        </tr>
      </thead>
      <tbody>
        <TopicListItem v-for="topic in topics" :key="topic.id" :topic="topic" />
      </tbody>
    </table>
     <!-- TODO: Пагинация для тем -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import { useForumStore } from '@/store/forum.store';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import TopicListItem from '@/components/forum/TopicListItem.vue';

const forumStore = useForumStore();
const route = useRoute();
const { topics, currentCategory: category } = storeToRefs(forumStore); // Берем и текущую категорию

// Получаем слаг категории из роута
const categorySlug = computed(() => route.params.categorySlug as string);

const fetchTopics = () => {
    if (categorySlug.value) {
        // TODO: Передать параметры пагинации/сортировки
        forumStore.fetchTopics(categorySlug.value);
    }
}

onMounted(fetchTopics);

// Перезагружаем темы, если слаг изменился
watch(categorySlug, (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
        fetchTopics();
    }
});

// Очищаем состояние при уходе со страницы
import { onUnmounted } from 'vue';
onUnmounted(() => {
    forumStore.clearCurrentCategoryAndTopics();
});

</script>

<style scoped>
.forum-page { max-width: 1100px; margin: 1rem auto; padding: 1rem; }
.loading, .error, .empty { text-align: center; padding: 2rem; color: #6c757d; }
.error button { margin-left: 1rem; }
.page-actions { margin-bottom: 1.5rem; text-align: right; }
.btn { /* Стили для кнопки */
    display: inline-block;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 4px;
    cursor: pointer;
}
.btn-primary { background-color: #0d6efd; color: white; border: 1px solid #0d6efd; }
.btn-primary:hover { background-color: #0b5ed7; }

.topics-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    background-color: #fff;
     border: 1px solid #e0e0e0;
     border-radius: 4px;
     overflow: hidden; /* Для скругления */
}
.topics-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  padding: 0.8rem 1rem;
  text-align: left;
   border-bottom: 2px solid #dee2e6;
   color: #495057;
}
.topics-table th:nth-child(2) { text-align: center; } /* Stats */
.topics-table th:nth-child(3) { text-align: right; } /* Last Post */
</style>