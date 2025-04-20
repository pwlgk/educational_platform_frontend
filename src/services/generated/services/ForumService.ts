/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForumCategory } from '../models/ForumCategory';
import type { ForumPost } from '../models/ForumPost';
import type { ForumPostRequest } from '../models/ForumPostRequest';
import type { ForumTopic } from '../models/ForumTopic';
import type { ForumTopicList } from '../models/ForumTopicList';
import type { ForumTopicRequest } from '../models/ForumTopicRequest';
import type { PatchedForumPostRequest } from '../models/PatchedForumPostRequest';
import type { PatchedForumTopicRequest } from '../models/PatchedForumTopicRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ForumService {
    /**
     * Просмотр категорий форума.
     * @returns ForumCategory
     * @throws ApiError
     */
    public static forumCategoriesList(): CancelablePromise<Array<ForumCategory>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/forum/categories/',
        });
    }
    /**
     * Просмотр категорий форума.
     * @param slug
     * @returns ForumCategory
     * @throws ApiError
     */
    public static forumCategoriesRetrieve(
        slug: string,
    ): CancelablePromise<ForumCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/forum/categories/{slug}/',
            path: {
                'slug': slug,
            },
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @returns ForumPost
     * @throws ApiError
     */
    public static forumPostsList(): CancelablePromise<Array<ForumPost>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/forum/posts/',
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @param requestBody
     * @returns ForumPost
     * @throws ApiError
     */
    public static forumPostsCreate(
        requestBody: ForumPostRequest,
    ): CancelablePromise<ForumPost> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/forum/posts/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @param id A unique integer value identifying this пост форума.
     * @returns ForumPost
     * @throws ApiError
     */
    public static forumPostsRetrieve(
        id: number,
    ): CancelablePromise<ForumPost> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/forum/posts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @param id A unique integer value identifying this пост форума.
     * @param requestBody
     * @returns ForumPost
     * @throws ApiError
     */
    public static forumPostsUpdate(
        id: number,
        requestBody: ForumPostRequest,
    ): CancelablePromise<ForumPost> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/forum/posts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @param id A unique integer value identifying this пост форума.
     * @param requestBody
     * @returns ForumPost
     * @throws ApiError
     */
    public static forumPostsPartialUpdate(
        id: number,
        requestBody?: PatchedForumPostRequest,
    ): CancelablePromise<ForumPost> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/forum/posts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @param id A unique integer value identifying this пост форума.
     * @returns void
     * @throws ApiError
     */
    public static forumPostsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/forum/posts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @param id A unique integer value identifying this пост форума.
     * @param requestBody
     * @returns ForumPost
     * @throws ApiError
     */
    public static forumPostsLikeCreate(
        id: number,
        requestBody: ForumPostRequest,
    ): CancelablePromise<ForumPost> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/forum/posts/{id}/like/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для постов форума (просмотр, создание, редактирование, удаление, лайки).
     * @param id A unique integer value identifying this пост форума.
     * @returns void
     * @throws ApiError
     */
    public static forumPostsLikeDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/forum/posts/{id}/like/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для тем форума.
     * @param author
     * @param categorySlug
     * @param ordering Which field to use when ordering the results.
     * @param search A search term.
     * @param tagsName
     * @returns ForumTopicList
     * @throws ApiError
     */
    public static forumTopicsList(
        author?: number,
        categorySlug?: string,
        ordering?: string,
        search?: string,
        tagsName?: string,
    ): CancelablePromise<Array<ForumTopicList>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/forum/topics/',
            query: {
                'author': author,
                'category__slug': categorySlug,
                'ordering': ordering,
                'search': search,
                'tags__name': tagsName,
            },
        });
    }
    /**
     * CRUD для тем форума.
     * @param requestBody
     * @returns ForumTopic
     * @throws ApiError
     */
    public static forumTopicsCreate(
        requestBody: ForumTopicRequest,
    ): CancelablePromise<ForumTopic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/forum/topics/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для тем форума.
     * @param id A unique integer value identifying this тема форума.
     * @returns ForumTopic
     * @throws ApiError
     */
    public static forumTopicsRetrieve(
        id: number,
    ): CancelablePromise<ForumTopic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/forum/topics/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для тем форума.
     * @param id A unique integer value identifying this тема форума.
     * @param requestBody
     * @returns ForumTopic
     * @throws ApiError
     */
    public static forumTopicsUpdate(
        id: number,
        requestBody: ForumTopicRequest,
    ): CancelablePromise<ForumTopic> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/forum/topics/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для тем форума.
     * @param id A unique integer value identifying this тема форума.
     * @param requestBody
     * @returns ForumTopic
     * @throws ApiError
     */
    public static forumTopicsPartialUpdate(
        id: number,
        requestBody?: PatchedForumTopicRequest,
    ): CancelablePromise<ForumTopic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/forum/topics/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для тем форума.
     * @param id A unique integer value identifying this тема форума.
     * @returns void
     * @throws ApiError
     */
    public static forumTopicsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/forum/topics/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Закрыть/открыть тему.
     * @param id A unique integer value identifying this тема форума.
     * @param requestBody
     * @returns ForumTopic
     * @throws ApiError
     */
    public static forumTopicsCloseCreate(
        id: number,
        requestBody: ForumTopicRequest,
    ): CancelablePromise<ForumTopic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/forum/topics/{id}/close/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Закрепить/открепить тему.
     * @param id A unique integer value identifying this тема форума.
     * @param requestBody
     * @returns ForumTopic
     * @throws ApiError
     */
    public static forumTopicsPinCreate(
        id: number,
        requestBody: ForumTopicRequest,
    ): CancelablePromise<ForumTopic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/forum/topics/{id}/pin/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
