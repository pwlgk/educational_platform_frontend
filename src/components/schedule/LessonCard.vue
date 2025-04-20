// src/components/schedule/LessonCard.vue
<template>
  <div class="lesson-card">
    <div class="time">
      <span>{{ formatTime(lesson.start_time) }}</span>
      <span>-</span>
      <span>{{ formatTime(lesson.end_time) }}</span>
    </div>
    <div class="details">
      <h4 class="subject">{{ lesson.subject_name }}</h4>
      <p class="type-teacher">
        <span class="type-badge" :class="typeClass">{{ lesson.lesson_type }}</span>
        {{ lesson.teacher_name }}
      </p>
      <p class="group-room">
        <span class="group">{{ lesson.group_name }}</span>
        <span v-if="lesson.classroom_name" class="room">📍 {{ lesson.classroom_name }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';
import { type ScheduleList, LessonTypeEnum } from '@/services/generated';

const props = defineProps({
  lesson: {
    type: Object as PropType<ScheduleList>,
    required: true,
  },
});

// Форматирование времени HH:MM
const formatTime = (dateTimeString: string) => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '??:??';
  }
};

// Класс для значка типа занятия
const typeClass = computed(() => {
    if (!props.lesson.lesson_type) return '';
    return `type-${props.lesson.lesson_type.toLowerCase()}`;
});

</script>

<style scoped>
.lesson-card {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden; /* Чтобы граница слева не вылезала */
  border-left: 5px solid #42b983; /* Цветная полоска слева */
}

.time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.8rem;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  font-weight: bold;
  min-width: 60px; /* Минимальная ширина для времени */
  text-align: center;
   font-size: 0.9rem;
}
.time span:nth-child(2) { /* Дефис */
  margin: 0.1rem 0;
  color: #adb5bd;
}

.details {
  padding: 0.8rem 1rem;
  flex-grow: 1;
}
.subject {
  margin: 0 0 0.4rem 0;
  font-size: 1.1rem;
  color: #333;
}
.type-teacher, .group-room {
  margin: 0.2rem 0;
  font-size: 0.9rem;
  color: #555;
  display: flex; /* Для размещения элементов в строку */
  align-items: center;
  flex-wrap: wrap; /* Перенос, если не влезает */
  gap: 0.5rem; /* Пространство между элементами */
}
.type-badge {
   display: inline-block;
   padding: 0.15em 0.5em;
   font-size: 0.8em;
   font-weight: bold;
   border-radius: 0.25rem;
   color: white;
   text-transform: capitalize; /* Делаем первую букву заглавной */
}
 /* Цвета для разных типов занятий (пример) */
.type-lecture { background-color: #0d6efd; }
.type-practice { background-color: #198754; }
.type-seminar { background-color: #6f42c1; }
.type-lab { background-color: #fd7e14; }
.type-exam { background-color: #dc3545; }
.type-consultation { background-color: #0dcaf0; color: #000;}
.type-other { background-color: #6c757d; }

.room {
   margin-left: auto; /* Прижимаем аудиторию к правому краю */
   font-style: italic;
   color: #6c757d;
   white-space: nowrap; /* Предотвращаем перенос названия аудитории */
}
.group {
    font-weight: 500;
}

/* Адаптация цветной полоски слева под тип занятия */
.lesson-card.type-lecture { border-left-color: #0d6efd; }
.lesson-card.type-practice { border-left-color: #198754; }
.lesson-card.type-seminar { border-left-color: #6f42c1; }
.lesson-card.type-lab { border-left-color: #fd7e14; }
.lesson-card.type-exam { border-left-color: #dc3545; }
.lesson-card.type-consultation { border-left-color: #0dcaf0;}
.lesson-card.type-other { border-left-color: #6c757d; }

</style>