// src/components/user/UserAvatar.vue
<template>
  <img :src="avatarUrl" :alt="altText" :width="size" :height="size" class="user-avatar">
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  src?: string | null;
  alt?: string;
  size?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'User Avatar',
  size: 40,
});

// TODO: Заменить на реальный placeholder
const defaultAvatar = '/path/to/default-avatar.png';

const avatarUrl = computed(() => props.src || defaultAvatar);
const altText = computed(() => props.alt);
</script>

<style scoped>
.user-avatar {
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee; /* Фон для случая, если изображение не загрузится */
}
</style>