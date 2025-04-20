// src/views/Forum/CreateTopicPage.vue (Опционально)
<template>
  <div class="forum-page create-topic-page">
      <h1>Create New Topic</h1>
      <div v-if="category" class="category-info">
          Posting in: <strong>{{ category.name }}</strong>
      </div>
       <div v-else class="loading">Loading category info...</div>

       <form @submit.prevent="submitNewTopic" v-if="category">
            <div class="form-group">
                <label for="topicTitle">Topic Title:</label>
                <input type="text" id="topicTitle" v-model="topicTitle" required />
            </div>
             <div class="form-group">
                <label for="firstPost">First Post Content:</label>
                <!-- TODO: Заменить на Rich Text Editor (TipTap, Quill, etc.) -->
                <textarea id="firstPost" v-model="firstPostContent" rows="10" required></textarea>
            </div>
             <div class="form-group">
                <label for="topicTags">Tags (comma-separated, optional):</label>
                <input type="text" id="topicTags" v-model="tagsInput" />
            </div>

            <div v-if="forumStore.errorTopicCreate" class="error-message">
                Error: {{ forumStore.errorTopicCreate }}
            </div>

            <div class="form-actions">
                 <router-link :to="{ name: 'ForumTopics', params: { categorySlug: categorySlug } }" class="cancel-button">
                     Cancel
                 </router-link>
                 <button type="submit" :disabled="forumStore.isCreatingTopic || !isValid">
                     {{ forumStore.isCreatingTopic ? 'Creating...' : 'Create Topic' }}
                 </button>
            </div>
       </form>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useForumStore } from '@/store/forum.store';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { ForumTopicRequest } from '@/services/generated';

const forumStore = useForumStore();
const route = useRoute();
const router = useRouter();

const { currentCategory: category } = storeToRefs(forumStore);

// Данные формы
const topicTitle = ref('');
const firstPostContent = ref('');
const tagsInput = ref('');

const categorySlug = computed(() => route.params.categorySlug as string);

// Загружаем детали категории при монтировании
onMounted(() => {
    if (!category.value || category.value.slug !== categorySlug.value) {
        forumStore.fetchCategoryDetails(categorySlug.value);
    }
});

// Следим за изменением слага в URL (маловероятно, но на всякий случай)
watch(categorySlug, (newSlug) => {
    if (newSlug && (!category.value || category.value.slug !== newSlug)) {
         forumStore.fetchCategoryDetails(newSlug);
    }
});

// Валидация формы
const isValid = computed(() => {
    return topicTitle.value.trim() !== '' && firstPostContent.value.trim() !== '' && category.value?.id;
});

// Отправка формы
const submitNewTopic = async () => {
    if (!isValid.value || !category.value) return;

    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);

    const topicData: ForumTopicRequest = {
        category_id: category.value.id, // ID категории
        title: topicTitle.value.trim(),
        first_post_content: firstPostContent.value.trim(),
        tags: tags,
        // is_pinned, is_closed обычно устанавливаются модераторами
    };

    const createdTopic = await forumStore.createTopic(topicData);

    if (createdTopic?.id) {
        // Переход на страницу созданной темы
        router.push({ name: 'ForumTopic', params: { topicId: createdTopic.id } });
    }
    // Ошибка отобразится через forumStore.errorTopicCreate
};

</script>

<style scoped>
.forum-page { max-width: 800px; margin: 1rem auto; padding: 1rem; }
.loading { text-align: center; padding: 2rem; color: #6c757d; }
.category-info {
    margin-bottom: 1.5rem;
    padding: 0.8rem;
    background-color: #e9ecef;
    border-radius: 4px;
    font-size: 0.95rem;
}
.form-group {
    margin-bottom: 1.5rem;
}
.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}
.form-group input[type="text"], .form-group textarea {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
.form-group textarea {
    min-height: 150px;
    resize: vertical;
}
.error-message {
    color: red;
    margin-bottom: 1rem;
}
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}
.form-actions button, .form-actions a {
     padding: 0.6rem 1.2rem;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    font-weight: 500;
     text-decoration: none;
}
.form-actions button[type="submit"] {
    background-color: #198754; /* Зеленый для создания */
    color: white;
    border-color: #198754;
}
.form-actions button[type="submit"]:disabled {
    background-color: #6c757d;
     border-color: #6c757d;
     cursor: not-allowed;
}
.form-actions a.cancel-button {
    background-color: #f8f9fa;
    color: #333;
    border-color: #ccc;
}
</style>