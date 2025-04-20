/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationTypeEnum } from './NotificationTypeEnum';
export type Notification = {
    readonly id: number;
    readonly recipient: number;
    readonly message: string;
    readonly notification_type: NotificationTypeEnum;
    readonly created_at: string;
    is_read?: boolean;
    readonly content_type: number | null;
    readonly object_id: number | null;
};

