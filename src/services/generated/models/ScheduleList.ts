/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LessonTypeEnum } from './LessonTypeEnum';
/**
 * Упрощенный сериализатор для отображения списков расписания.
 */
export type ScheduleList = {
    readonly id: number;
    readonly subject_name: string;
    readonly teacher_name: string;
    readonly group_name: string;
    readonly classroom_name: string | null;
    readonly lesson_type: LessonTypeEnum;
    readonly start_time: string;
    readonly end_time: string;
};

