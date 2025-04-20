/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Classroom } from './Classroom';
import type { LessonTypeEnum } from './LessonTypeEnum';
import type { StudentGroup } from './StudentGroup';
import type { Subject } from './Subject';
import type { User } from './User';
export type Lesson = {
    readonly id: number;
    readonly subject: Subject;
    readonly teacher: User;
    readonly group: StudentGroup;
    readonly classroom: Classroom | null;
    lesson_type?: LessonTypeEnum;
    start_time: string;
    end_time: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly created_by: number | null;
};

