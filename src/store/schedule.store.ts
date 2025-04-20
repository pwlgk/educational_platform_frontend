// src/store/schedule.store.ts
import { defineStore } from 'pinia';
import {
    ScheduleService,
    type ScheduleList, // Тип элемента расписания для отображения
    ApiError
} from '@/services/generated';
import { getErrorMessage } from './_helpers'; // Используем наш хелпер

// Интерфейс для состояния
interface ScheduleState {
  mySchedule: ScheduleList[]; // Массив занятий
  isLoading: boolean;
  error: string | null;
  // Можно добавить фильтры по дате, если нужно будет их хранить
  // filterStartDate: string | null;
  // filterEndDate: string | null;
}

export const useScheduleStore = defineStore('schedule', {
  state: (): ScheduleState => ({
    mySchedule: [],
    isLoading: false,
    error: null,
    // filterStartDate: null,
    // filterEndDate: null,
  }),

  getters: {
    getSchedule: (state): ScheduleList[] => state.mySchedule,
    // Геттер для сгруппированного или отсортированного расписания (пример)
    getGroupedScheduleByDay: (state): Record<string, ScheduleList[]> => {
        const grouped: Record<string, ScheduleList[]> = {};
        // Сортируем по времени начала перед группировкой
        const sortedSchedule = [...state.mySchedule].sort((a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        for (const lesson of sortedSchedule) {
            try {
                // Группируем по дате YYYY-MM-DD
                const day = lesson.start_time.split('T')[0];
                if (!grouped[day]) {
                    grouped[day] = [];
                }
                grouped[day].push(lesson);
            } catch (e) {
                console.error("Error processing lesson date:", lesson, e);
            }
        }
        return grouped;
    },
    isLoadingSchedule: (state): boolean => state.isLoading,
    getError: (state): string | null => state.error,
  },

  actions: {
    async fetchMySchedule(params?: { startDate?: string, endDate?: string }) {
      // Предотвращаем повторную загрузку, если уже идет
      if (this.isLoading) return;

      console.log('[scheduleStore] Fetching my schedule...', params);
      this.isLoading = true;
      this.error = null;
      try {
          // Вызываем метод API. Нужно проверить, как передаются параметры даты,
          // если они есть в API (например, ?start_date=...&end_date=...)
          // Сгенерированный метод может принимать объект с параметрами запроса.
          // Проверьте сигнатуру ScheduleService.scheduleMyScheduleList()!
          const response = await ScheduleService.scheduleMyScheduleList();

          this.mySchedule = response;
          console.log('[scheduleStore] My schedule fetched:', this.mySchedule.length);

      } catch (error: any) {
          console.error('[scheduleStore] Failed to fetch schedule:', getErrorMessage(error), error);
          this.error = getErrorMessage(error) || 'Failed to load schedule';
          this.mySchedule = []; // Очищаем при ошибке
      } finally {
          this.isLoading = false;
      }
    },

    // Опционально: действие для очистки расписания (например, при выходе)
    clearSchedule() {
        this.mySchedule = [];
        this.error = null;
        // this.filterStartDate = null;
        // this.filterEndDate = null;
    }
  },
});