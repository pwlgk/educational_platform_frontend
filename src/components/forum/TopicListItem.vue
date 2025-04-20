// src/components/forum/TopicListItem.vue
<template>
  <tr :class="['topic-list-item', { pinned: topic.is_pinned, closed: topic.is_closed }]">
    <td class="topic-main">
       <router-link :to="{ name: 'ForumTopic', params: { topicId: topic.id } }" class="topic-title">
           <span v-if="topic.is_pinned" title="Pinned">📌</span>
           <span v-if="topic.is_closed" title="Closed">🔒</span>
            {{ topic.title }}
        </router-link>
       <div class="topic-meta">
            Started by <span class="author">{{ topic.author_name || 'Unknown' }}</span>
            on {{ formatDate(topic.created_at) }}
            <span v-if="topic.tags && topic.tags.length > 0" class="tags">
                 | Tags: {{ topic.tags.join(', ') }}
            </span>
       </div>
    </td>
    <td class="topic-stats">
        <div>Posts: {{ topic.post_count ?? 0 }}</div>
        <!-- <div>Views: {{ topic.view_count ?? 0 }}</div> -->
    </td>
    <td class="topic-last-post">
        <div v-if="topic.last_post">
             <!-- TODO: Ссылка на последний пост или профиль автора -->
             <div>{{ topic.last_post_author_name || 'Unknown' }}</div>
             <div class="timestamp">{{ timeAgo(topic.last_post_at) }}</div>
        </div>
        <div v-else>No posts yet</div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
// Используем ForumTopicList, если он есть, иначе ForumTopic
import { type ForumTopicList, type ForumTopic } from '@/services/generated';
import { formatDistanceToNowStrict } from 'date-fns';

// Принимаем любой из типов
type TopicType = ForumTopicList | ForumTopic;

const props = defineProps({
  topic: {
    type: Object as PropType<TopicType>,
    required: true,
  },
});

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString(); } catch { return dateString; }
};

 const timeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try { return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true }); } catch { return dateString; }
};
</script>

<style scoped>
.topic-list-item td {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
}
 .topic-list-item:hover {
     background-color: #fdfdfd;
 }
.topic-list-item.pinned {
    background-color: #fffbe6; /* Фон для закрепленных */
    font-weight: bold;
}
 .topic-list-item.closed .topic-title {
     /* text-decoration: line-through; */ /* Можно добавить зачеркивание */
     color: #6c757d;
     opacity: 0.8;
 }

.topic-main {
    /* Основная информация о теме */
}
.topic-title {
    font-size: 1.1rem;
    color: #0d6efd;
    text-decoration: none;
    margin-bottom: 0.2rem;
    display: inline-block; /* Чтобы иконки были рядом */
    font-weight: 500;
}
.topic-title:hover {
    text-decoration: underline;
}
 .topic-title span { /* Иконки */
     margin-right: 0.3rem;
     font-size: 0.9em;
 }
.topic-meta {
    font-size: 0.85rem;
    color: #6c757d;
}
.author {
    font-weight: 500;
    color: #495057;
}
.tags {
    font-style: italic;
    font-size: 0.9em;
}

.topic-stats {
    text-align: center;
    font-size: 0.9rem;
    color: #555;
    width: 100px; /* Фиксированная ширина */
}
.topic-stats div {
    white-space: nowrap;
}

.topic-last-post {
    font-size: 0.85rem;
    color: #555;
    width: 180px; /* Фиксированная ширина */
    text-align: right;
}
.topic-last-post .timestamp {
    color: #6c757d;
     font-size: 0.9em;
}
</style>