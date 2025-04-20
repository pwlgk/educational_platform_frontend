/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Chat } from '../models/Chat';
import type { ChatRequest } from '../models/ChatRequest';
import type { Message } from '../models/Message';
import type { MessageRequest } from '../models/MessageRequest';
import type { PatchedChatRequest } from '../models/PatchedChatRequest';
import type { PatchedMessageRequest } from '../models/PatchedMessageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MessagingService {
    /**
     * Управление чатами (список, создание, детали).
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsList(): CancelablePromise<Array<Chat>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/messaging/chats/',
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param requestBody
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsCreate(
        requestBody?: ChatRequest,
    ): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/messaging/chats/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Просмотр и отправка сообщений в конкретном чате.
     * @param chatPk
     * @returns Message
     * @throws ApiError
     */
    public static messagingChatsMessagesList(
        chatPk: number,
    ): CancelablePromise<Array<Message>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/messaging/chats/{chat_pk}/messages/',
            path: {
                'chat_pk': chatPk,
            },
        });
    }
    /**
     * Просмотр и отправка сообщений в конкретном чате.
     * @param chatPk
     * @param requestBody
     * @returns Message
     * @throws ApiError
     */
    public static messagingChatsMessagesCreate(
        chatPk: number,
        requestBody: MessageRequest,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/messaging/chats/{chat_pk}/messages/',
            path: {
                'chat_pk': chatPk,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Просмотр и отправка сообщений в конкретном чате.
     * @param chatPk
     * @param id A unique integer value identifying this сообщение.
     * @returns Message
     * @throws ApiError
     */
    public static messagingChatsMessagesRetrieve(
        chatPk: number,
        id: number,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/messaging/chats/{chat_pk}/messages/{id}/',
            path: {
                'chat_pk': chatPk,
                'id': id,
            },
        });
    }
    /**
     * Просмотр и отправка сообщений в конкретном чате.
     * @param chatPk
     * @param id A unique integer value identifying this сообщение.
     * @param requestBody
     * @returns Message
     * @throws ApiError
     */
    public static messagingChatsMessagesUpdate(
        chatPk: number,
        id: number,
        requestBody: MessageRequest,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/messaging/chats/{chat_pk}/messages/{id}/',
            path: {
                'chat_pk': chatPk,
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Просмотр и отправка сообщений в конкретном чате.
     * @param chatPk
     * @param id A unique integer value identifying this сообщение.
     * @param requestBody
     * @returns Message
     * @throws ApiError
     */
    public static messagingChatsMessagesPartialUpdate(
        chatPk: number,
        id: number,
        requestBody?: PatchedMessageRequest,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/messaging/chats/{chat_pk}/messages/{id}/',
            path: {
                'chat_pk': chatPk,
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Просмотр и отправка сообщений в конкретном чате.
     * @param chatPk
     * @param id A unique integer value identifying this сообщение.
     * @returns void
     * @throws ApiError
     */
    public static messagingChatsMessagesDestroy(
        chatPk: number,
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/messaging/chats/{chat_pk}/messages/{id}/',
            path: {
                'chat_pk': chatPk,
                'id': id,
            },
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param id
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsRetrieve(
        id: string,
    ): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/messaging/chats/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param id
     * @param requestBody
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsUpdate(
        id: string,
        requestBody?: ChatRequest,
    ): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/messaging/chats/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param id
     * @param requestBody
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsPartialUpdate(
        id: string,
        requestBody?: PatchedChatRequest,
    ): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/messaging/chats/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static messagingChatsDestroy(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/messaging/chats/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param id
     * @param requestBody
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsAddParticipantCreate(
        id: string,
        requestBody?: ChatRequest,
    ): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/messaging/chats/{id}/add_participant/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param id
     * @param requestBody
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsMarkReadCreate(
        id: string,
        requestBody?: ChatRequest,
    ): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/messaging/chats/{id}/mark-read/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Управление чатами (список, создание, детали).
     * @param id
     * @param requestBody
     * @returns Chat
     * @throws ApiError
     */
    public static messagingChatsRemoveParticipantCreate(
        id: string,
        requestBody?: ChatRequest,
    ): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/messaging/chats/{id}/remove_participant/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
