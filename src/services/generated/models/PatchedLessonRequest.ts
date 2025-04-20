/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LessonTypeEnum } from './LessonTypeEnum';
export type PatchedLessonRequest = {
    lesson_type?: LessonTypeEnum;
    start_time?: string;
    end_time?: string;
    subject_id?: number;
    teacher_id?: number;
    group_id?: number;
    classroom_id?: number | null;
};

