/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatTypeEnum } from './ChatTypeEnum';
import type { Message } from './Message';
import type { User } from './User';
export type Chat = {
    readonly id: number;
    readonly chat_type: ChatTypeEnum;
    /**
     * Обязательно для групповых чатов
     */
    name?: string | null;
    readonly created_at: string;
    readonly participants: Array<User>;
    readonly last_message_details: Message | null;
    /**
     * Подсчет непрочитанных сообщений для текущего пользователя.
     */
    readonly unread_count: number;
    /**
     * Формирует имя для отображения в списке чатов.
     */
    readonly display_name: string;
};

