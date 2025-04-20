/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notification } from '../models/Notification';
import type { NotificationRequest } from '../models/NotificationRequest';
import type { PatchedUserNotificationSettingsRequest } from '../models/PatchedUserNotificationSettingsRequest';
import type { UserNotificationSettings } from '../models/UserNotificationSettings';
import type { UserNotificationSettingsRequest } from '../models/UserNotificationSettingsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Просмотр уведомлений и управление статусом прочтения.
     * @returns Notification
     * @throws ApiError
     */
    public static notificationsListList(): CancelablePromise<Array<Notification>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notifications/list/',
        });
    }
    /**
     * Просмотр уведомлений и управление статусом прочтения.
     * @param id
     * @returns Notification
     * @throws ApiError
     */
    public static notificationsListRetrieve(
        id: string,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notifications/list/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Пометить конкретное уведомление как прочитанное.
     * @param id
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    public static notificationsListMarkReadCreate(
        id: string,
        requestBody?: NotificationRequest,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/notifications/list/{id}/mark-read/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Пометить конкретное уведомление как непрочитанное.
     * @param id
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    public static notificationsListMarkUnreadCreate(
        id: string,
        requestBody?: NotificationRequest,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/notifications/list/{id}/mark-unread/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Пометить все непрочитанные уведомления пользователя как прочитанные.
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    public static notificationsListMarkAllReadCreate(
        requestBody?: NotificationRequest,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/notifications/list/mark-all-read/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Получение и обновление настроек уведомлений пользователя.
     * @returns UserNotificationSettings
     * @throws ApiError
     */
    public static notificationsSettingsRetrieve(): CancelablePromise<UserNotificationSettings> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notifications/settings/',
        });
    }
    /**
     * Получение и обновление настроек уведомлений пользователя.
     * @param requestBody
     * @returns UserNotificationSettings
     * @throws ApiError
     */
    public static notificationsSettingsUpdate(
        requestBody?: UserNotificationSettingsRequest,
    ): CancelablePromise<UserNotificationSettings> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/notifications/settings/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Получение и обновление настроек уведомлений пользователя.
     * @param requestBody
     * @returns UserNotificationSettings
     * @throws ApiError
     */
    public static notificationsSettingsPartialUpdate(
        requestBody?: PatchedUserNotificationSettingsRequest,
    ): CancelablePromise<UserNotificationSettings> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/notifications/settings/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
