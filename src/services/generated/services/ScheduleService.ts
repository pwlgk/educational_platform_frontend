/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Classroom } from '../models/Classroom';
import type { ClassroomRequest } from '../models/ClassroomRequest';
import type { Lesson } from '../models/Lesson';
import type { LessonRequest } from '../models/LessonRequest';
import type { PatchedClassroomRequest } from '../models/PatchedClassroomRequest';
import type { PatchedLessonRequest } from '../models/PatchedLessonRequest';
import type { PatchedStudentGroupRequest } from '../models/PatchedStudentGroupRequest';
import type { PatchedSubjectRequest } from '../models/PatchedSubjectRequest';
import type { ScheduleList } from '../models/ScheduleList';
import type { StudentGroup } from '../models/StudentGroup';
import type { StudentGroupRequest } from '../models/StudentGroupRequest';
import type { Subject } from '../models/Subject';
import type { SubjectRequest } from '../models/SubjectRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScheduleService {
    /**
     * CRUD для аудиторий (Админы).
     * @param search A search term.
     * @param type * `LECTURE` - Лекционная
     * * `PRACTICE` - Практическая
     * * `LAB` - Лаборатория
     * * `COMPUTER` - Компьютерный класс
     * * `OTHER` - Другое
     * @returns Classroom
     * @throws ApiError
     */
    public static scheduleClassroomsList(
        search?: string,
        type?: 'COMPUTER' | 'LAB' | 'LECTURE' | 'OTHER' | 'PRACTICE',
    ): CancelablePromise<Array<Classroom>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/classrooms/',
            query: {
                'search': search,
                'type': type,
            },
        });
    }
    /**
     * CRUD для аудиторий (Админы).
     * @param requestBody
     * @returns Classroom
     * @throws ApiError
     */
    public static scheduleClassroomsCreate(
        requestBody: ClassroomRequest,
    ): CancelablePromise<Classroom> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/schedule/classrooms/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для аудиторий (Админы).
     * @param id A unique integer value identifying this аудитория.
     * @returns Classroom
     * @throws ApiError
     */
    public static scheduleClassroomsRetrieve(
        id: number,
    ): CancelablePromise<Classroom> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/classrooms/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для аудиторий (Админы).
     * @param id A unique integer value identifying this аудитория.
     * @param requestBody
     * @returns Classroom
     * @throws ApiError
     */
    public static scheduleClassroomsUpdate(
        id: number,
        requestBody: ClassroomRequest,
    ): CancelablePromise<Classroom> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/schedule/classrooms/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для аудиторий (Админы).
     * @param id A unique integer value identifying this аудитория.
     * @param requestBody
     * @returns Classroom
     * @throws ApiError
     */
    public static scheduleClassroomsPartialUpdate(
        id: number,
        requestBody?: PatchedClassroomRequest,
    ): CancelablePromise<Classroom> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/schedule/classrooms/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для аудиторий (Админы).
     * @param id A unique integer value identifying this аудитория.
     * @returns void
     * @throws ApiError
     */
    public static scheduleClassroomsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/schedule/classrooms/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для учебных групп (Админы).
     * @param search A search term.
     * @returns StudentGroup
     * @throws ApiError
     */
    public static scheduleGroupsList(
        search?: string,
    ): CancelablePromise<Array<StudentGroup>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/groups/',
            query: {
                'search': search,
            },
        });
    }
    /**
     * CRUD для учебных групп (Админы).
     * @param requestBody
     * @returns StudentGroup
     * @throws ApiError
     */
    public static scheduleGroupsCreate(
        requestBody: StudentGroupRequest,
    ): CancelablePromise<StudentGroup> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/schedule/groups/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для учебных групп (Админы).
     * @param id A unique integer value identifying this учебная группа.
     * @returns StudentGroup
     * @throws ApiError
     */
    public static scheduleGroupsRetrieve(
        id: number,
    ): CancelablePromise<StudentGroup> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/groups/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для учебных групп (Админы).
     * @param id A unique integer value identifying this учебная группа.
     * @param requestBody
     * @returns StudentGroup
     * @throws ApiError
     */
    public static scheduleGroupsUpdate(
        id: number,
        requestBody: StudentGroupRequest,
    ): CancelablePromise<StudentGroup> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/schedule/groups/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для учебных групп (Админы).
     * @param id A unique integer value identifying this учебная группа.
     * @param requestBody
     * @returns StudentGroup
     * @throws ApiError
     */
    public static scheduleGroupsPartialUpdate(
        id: number,
        requestBody?: PatchedStudentGroupRequest,
    ): CancelablePromise<StudentGroup> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/schedule/groups/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для учебных групп (Админы).
     * @param id A unique integer value identifying this учебная группа.
     * @returns void
     * @throws ApiError
     */
    public static scheduleGroupsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/schedule/groups/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для занятий (Админы/Преподаватели).
     * @param classroom
     * @param endTime
     * @param endTimeDate
     * @param endTimeGte
     * @param endTimeLte
     * @param group
     * @param lessonType * `LECTURE` - Лекция
     * * `PRACTICE` - Практика
     * * `SEMINAR` - Семинар
     * * `LAB` - Лабораторная работа
     * * `EXAM` - Экзамен/Зачет
     * * `CONSULTATION` - Консультация
     * * `OTHER` - Другое
     * @param lessonTypeIn Несколько значений могут быть разделены запятыми.
     * @param ordering Which field to use when ordering the results.
     * @param search A search term.
     * @param startTime
     * @param startTimeDate
     * @param startTimeGte
     * @param startTimeLte
     * @param subject
     * @param teacher
     * @returns Lesson
     * @throws ApiError
     */
    public static scheduleLessonsList(
        classroom?: number,
        endTime?: string,
        endTimeDate?: string,
        endTimeGte?: string,
        endTimeLte?: string,
        group?: number,
        lessonType?: 'CONSULTATION' | 'EXAM' | 'LAB' | 'LECTURE' | 'OTHER' | 'PRACTICE' | 'SEMINAR',
        lessonTypeIn?: Array<string>,
        ordering?: string,
        search?: string,
        startTime?: string,
        startTimeDate?: string,
        startTimeGte?: string,
        startTimeLte?: string,
        subject?: number,
        teacher?: number,
    ): CancelablePromise<Array<Lesson>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/lessons/',
            query: {
                'classroom': classroom,
                'end_time': endTime,
                'end_time__date': endTimeDate,
                'end_time__gte': endTimeGte,
                'end_time__lte': endTimeLte,
                'group': group,
                'lesson_type': lessonType,
                'lesson_type__in': lessonTypeIn,
                'ordering': ordering,
                'search': search,
                'start_time': startTime,
                'start_time__date': startTimeDate,
                'start_time__gte': startTimeGte,
                'start_time__lte': startTimeLte,
                'subject': subject,
                'teacher': teacher,
            },
        });
    }
    /**
     * CRUD для занятий (Админы/Преподаватели).
     * @param requestBody
     * @returns Lesson
     * @throws ApiError
     */
    public static scheduleLessonsCreate(
        requestBody: LessonRequest,
    ): CancelablePromise<Lesson> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/schedule/lessons/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для занятий (Админы/Преподаватели).
     * @param id A unique integer value identifying this занятие.
     * @returns Lesson
     * @throws ApiError
     */
    public static scheduleLessonsRetrieve(
        id: number,
    ): CancelablePromise<Lesson> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/lessons/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для занятий (Админы/Преподаватели).
     * @param id A unique integer value identifying this занятие.
     * @param requestBody
     * @returns Lesson
     * @throws ApiError
     */
    public static scheduleLessonsUpdate(
        id: number,
        requestBody: LessonRequest,
    ): CancelablePromise<Lesson> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/schedule/lessons/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для занятий (Админы/Преподаватели).
     * @param id A unique integer value identifying this занятие.
     * @param requestBody
     * @returns Lesson
     * @throws ApiError
     */
    public static scheduleLessonsPartialUpdate(
        id: number,
        requestBody?: PatchedLessonRequest,
    ): CancelablePromise<Lesson> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/schedule/lessons/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для занятий (Админы/Преподаватели).
     * @param id A unique integer value identifying this занятие.
     * @returns void
     * @throws ApiError
     */
    public static scheduleLessonsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/schedule/lessons/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Получение расписания для текущего пользователя (Студент, Преподаватель, Родитель).
     * Поддерживает фильтрацию по дате (?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD).
     * @returns ScheduleList
     * @throws ApiError
     */
    public static scheduleMyScheduleList(): CancelablePromise<Array<ScheduleList>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/my-schedule/',
        });
    }
    /**
     * CRUD для учебных предметов (только Админы).
     * @returns Subject
     * @throws ApiError
     */
    public static scheduleSubjectsList(): CancelablePromise<Array<Subject>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/subjects/',
        });
    }
    /**
     * CRUD для учебных предметов (только Админы).
     * @param requestBody
     * @returns Subject
     * @throws ApiError
     */
    public static scheduleSubjectsCreate(
        requestBody: SubjectRequest,
    ): CancelablePromise<Subject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/schedule/subjects/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для учебных предметов (только Админы).
     * @param id A unique integer value identifying this предмет.
     * @returns Subject
     * @throws ApiError
     */
    public static scheduleSubjectsRetrieve(
        id: number,
    ): CancelablePromise<Subject> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schedule/subjects/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для учебных предметов (только Админы).
     * @param id A unique integer value identifying this предмет.
     * @param requestBody
     * @returns Subject
     * @throws ApiError
     */
    public static scheduleSubjectsUpdate(
        id: number,
        requestBody: SubjectRequest,
    ): CancelablePromise<Subject> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/schedule/subjects/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для учебных предметов (только Админы).
     * @param id A unique integer value identifying this предмет.
     * @param requestBody
     * @returns Subject
     * @throws ApiError
     */
    public static scheduleSubjectsPartialUpdate(
        id: number,
        requestBody?: PatchedSubjectRequest,
    ): CancelablePromise<Subject> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/schedule/subjects/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для учебных предметов (только Админы).
     * @param id A unique integer value identifying this предмет.
     * @returns void
     * @throws ApiError
     */
    public static scheduleSubjectsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/schedule/subjects/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
