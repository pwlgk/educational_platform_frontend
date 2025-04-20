// src/views/Forum/ForumCategoriesPage.vue
<template>
  <div class="forum-page">
    <h1>Forum Categories</h1>
    <div v-if="forumStore.getIsLoadingCategories" class="loading">Loading categories...</div>
    <div v-else-if="forumStore.errorCategories" class="error">
      Error: {{ forumStore.errorCategories }}
      <button @click="forumStore.fetchCategories">Retry</button>
    </div>
     <div v-else-if="categories.length === 0" class="empty">No categories found.</div>
    <ul v-else class="categories-list">
      <CategoryListItem
        v-for="category in categories"
        :key="category.id"
        :category="category"
      />
    </ul>
    <!-- TODO: Кнопка создания категории для админов -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useForumStore } from '@/store/forum.store';
import { storeToRefs } from 'pinia';
import CategoryListItem from '@/components/forum/CategoryListItem.vue';

const forumStore = useForumStore();
const { categories } = storeToRefs(forumStore);

onMounted(() => {
  if (categories.value.length === 0) {
    forumStore.fetchCategories();
  }
});
</script>

<style scoped>
.forum-page { max-width: 1000px; margin: 1rem auto; padding: 1rem; }
.loading, .error, .empty { text-align: center; padding: 2rem; color: #6c757d; }
.error button { margin-left: 1rem; }
.categories-list { list-style: none; padding: 0; margin: 0; }
</style>