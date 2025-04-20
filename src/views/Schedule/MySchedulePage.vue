// src/views/Schedule/MySchedulePage.vue
<template>
  <div class="my-schedule-page">
    <h1>My Schedule</h1>

    <!-- TODO: Добавить фильтры по дате, если нужно -->
    <!-- <div class="filters"> ... </div> -->

    <div v-if="scheduleStore.isLoadingSchedule" class="loading">
      Loading schedule...
    </div>
    <div v-else-if="scheduleStore.getError" class="error">
      Error loading schedule: {{ scheduleStore.getError }}
      <button @click="fetchSchedule">Retry</button>
    </div>
    <div v-else-if="Object.keys(groupedSchedule).length === 0" class="empty">
      Your schedule is empty for the selected period.
    </div>
    <!-- Отображение сгруппированного расписания -->
    <div v-else>
      <div v-for="(lessonsOnDay, day) in groupedSchedule" :key="day" class="day-group">
        <h3 class="day-header">{{ formatDateHeader(day) }}</h3>
        <div class="lessons-list">
          <LessonCard v-for="lesson in lessonsOnDay" :key="lesson.id" :lesson="lesson" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useScheduleStore } from '@/store/schedule.store';
import LessonCard from '@/components/schedule/LessonCard.vue';
import { storeToRefs } from 'pinia';

const scheduleStore = useScheduleStore();

// Получаем сгруппированное расписание через геттер
const groupedSchedule = computed(() => scheduleStore.getGroupedScheduleByDay);

// Функция для загрузки расписания
const fetchSchedule = () => {
  // TODO: Передавать параметры фильтрации, если они есть
  scheduleStore.fetchMySchedule(/* { startDate: '...', endDate: '...' } */);
};

// Загружаем расписание при монтировании компонента
onMounted(fetchSchedule);

// Форматирование заголовка дня (Например: Monday, April 8, 2025)
const formatDateHeader = (dateString: string) => {
    try {
        const date = new Date(dateString + 'T00:00:00'); // Добавляем время, чтобы избежать проблем с часовым поясом
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return dateString;
    }
}

</script>

<style scoped>
.my-schedule-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}
.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
.error button {
    margin-left: 1rem;
}
.day-group {
    margin-bottom: 2rem;
}
.day-header {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #0d6efd; /* Пример разделителя дня */
    color: #0d6efd;
    font-weight: 600;
}
.lessons-list {
    /* Стили для списка занятий в дне, если нужны */
}
</style>