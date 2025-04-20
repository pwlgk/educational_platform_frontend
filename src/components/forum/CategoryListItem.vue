// src/components/forum/CategoryListItem.vue
<template>
  <li class="category-list-item">
    <router-link :to="{ name: 'ForumTopics', params: { categorySlug: category.slug } }">
      <div class="category-info">
        <h3 class="category-name">{{ category.name }}</h3>
        <p v-if="category.description" class="category-description">{{ category.description }}</p>
      </div>
      <div class="category-stats">
        <!-- TODO: Добавить счетчики тем/постов, если они есть в API -->
        <!-- <span>Topics: {{ category.topic_count ?? 0 }}</span> -->
        <!-- <span>Posts: {{ category.post_count ?? 0 }}</span> -->
      </div>
    </router-link>
  </li>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { type ForumCategory } from '@/services/generated';

const props = defineProps({
  category: {
    type: Object as PropType<ForumCategory>,
    required: true,
  },
});
</script>

<style scoped>
.category-list-item {
  list-style: none;
  margin-bottom: 1rem;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s ease-in-out;
}
.category-list-item:hover {
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}
.category-list-item a {
  display: flex; /* Чтобы выровнять info и stats */
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: inherit; /* Наследуем цвет текста */
  justify-content: space-between; /* Разносим info и stats */
  align-items: center;
}
.category-info {
  flex-grow: 1;
  margin-right: 1rem; /* Отступ от статистики */
}
.category-name {
  margin: 0 0 0.3rem 0;
  font-size: 1.2rem;
  color: #0d6efd;
}
 .category-list-item a:hover .category-name {
     text-decoration: underline;
 }
.category-description {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
}
.category-stats {
  flex-shrink: 0; /* Не сжимать статистику */
  font-size: 0.85rem;
  color: #6c757d;
  text-align: right;
}
 .category-stats span {
     display: block; /* Статистика друг под другом */
 }
</style>