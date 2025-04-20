// src/views/News/NewsListPage.vue
<template>
  <div class="news-list-page">
    <h1>News</h1>
    <!-- TODO: Добавить фильтры по категориям, поиск -->
    <!-- <div class="filters"> ... </div> -->

    <div v-if="newsStore.isLoadingList" class="loading">Loading articles...</div>
    <div v-else-if="newsStore.errorList" class="error">
      Error: {{ newsStore.errorList }}
      <button @click="newsStore.fetchArticles()">Retry</button>
    </div>
    <div v-else-if="articles.length === 0" class="empty">No news articles found.</div>
    <div v-else class="articles-grid">
       <NewsCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <!-- TODO: Пагинация -->
    <!-- <div class="pagination"> ... </div> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNewsStore } from '@/store/news.store';
import { storeToRefs } from 'pinia';
import NewsCard from '@/components/news/NewsCard.vue';

const newsStore = useNewsStore();
const { articles } = storeToRefs(newsStore); // Получаем реактивный список

onMounted(() => {
    // Загружаем статьи, если список пуст
    if (articles.value.length === 0) {
        newsStore.fetchArticles(/* Передать параметры страницы/фильтра */);
    }
});
</script>

<style scoped>
.news-list-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}
.loading, .error, .empty { text-align: center; padding: 2rem; color: #6c757d; }
.error button { margin-left: 1rem; }
.articles-grid {
    /* Можно использовать grid или flex для отображения карточек */
}
</style>