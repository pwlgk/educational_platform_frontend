// src/components/news/NewsCard.vue
<template>
  <article class="news-card">
    <!-- Опционально: Картинка новости, если она есть в API -->
    <!-- <img v-if="article.thumbnail_url" :src="article.thumbnail_url" alt="" class="card-thumbnail"> -->
    <div class="card-content">
        <h3 class="card-title">
            <router-link :to="{ name: 'NewsDetail', params: { id: article.id } }">
                {{ article.title }}
            </router-link>
        </h3>
        <p class="card-excerpt">{{ excerpt(article.content, 150) }}</p> <!-- Показываем краткое содержание -->
        <div class="card-meta">
            <span class="author">👤 {{ article.author?.first_name }} {{ article.author?.last_name }}</span>
            <span class="date">📅 {{ formatDate(article.created_at) }}</span>
            <span class="category" v-if="article.category">🏷️ {{ article.category?.name }}</span>
        </div>
        <div class="card-stats">
             <span>💬 {{ article.comment_count ?? 0 }}</span>
             <span>❤️ {{ article.likes_count ?? 0 }}</span>
             <!-- Можно добавить кнопку лайка прямо сюда -->
             <!-- <button @click.stop.prevent="toggleLike" :class="{ liked: article.is_liked_by_current_user }">
                {{ article.is_liked_by_current_user ? '❤️ Liked' : '🤍 Like' }}
             </button> -->
        </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { type NewsArticle } from '@/services/generated';
import { useRouter } from 'vue-router';
// import { useNewsStore } from '@/store/news.store'; // Если лайк прямо здесь

const props = defineProps({
  article: {
    type: Object as PropType<NewsArticle>,
    required: true,
  },
});

const router = useRouter();
// const newsStore = useNewsStore();

// Форматирование даты
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch { return dateString; }
};

// Обрезка текста для краткого содержания
const excerpt = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Логика для лайка (если кнопка здесь)
// const toggleLike = () => {
//     if (!props.article.id) return;
//     if (props.article.is_liked_by_current_user) {
//         newsStore.unlikeArticle(props.article.id);
//     } else {
//         newsStore.likeArticle(props.article.id);
//     }
// }
</script>

<style scoped>
.news-card {
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s ease-in-out;
  display: flex; /* Для картинки слева (если будет) */
  overflow: hidden;
}
.news-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}
/* Стиль для картинки (если будет)
.card-thumbnail {
    width: 150px;
    height: auto;
    object-fit: cover;
} */
.card-content {
    padding: 1rem 1.5rem;
    flex-grow: 1; /* Занимать оставшееся место */
}
.card-title {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}
.card-title a {
  text-decoration: none;
  color: #333;
  transition: color 0.2s;
}
.card-title a:hover {
  color: #0d6efd;
}
.card-excerpt {
  margin-bottom: 1rem;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
}
.card-meta, .card-stats {
  font-size: 0.85rem;
  color: #777;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem; /* Пространство между элементами */
  margin-bottom: 0.5rem;
}
 .card-stats {
     border-top: 1px solid #eee;
     padding-top: 0.8rem;
     margin-top: 0.8rem;
     margin-bottom: 0;
 }
  .card-stats span {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
  }
/* Стили для кнопки лайка (если здесь)
 .card-stats button { ... }
 .card-stats button.liked { ... }
*/
</style>