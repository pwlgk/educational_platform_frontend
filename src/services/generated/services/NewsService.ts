/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewsArticle } from '../models/NewsArticle';
import type { NewsArticleRequest } from '../models/NewsArticleRequest';
import type { NewsCategory } from '../models/NewsCategory';
import type { NewsCategoryRequest } from '../models/NewsCategoryRequest';
import type { NewsComment } from '../models/NewsComment';
import type { NewsCommentRequest } from '../models/NewsCommentRequest';
import type { PatchedNewsArticleRequest } from '../models/PatchedNewsArticleRequest';
import type { PatchedNewsCategoryRequest } from '../models/PatchedNewsCategoryRequest';
import type { PatchedNewsCommentRequest } from '../models/PatchedNewsCommentRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NewsService {
    /**
     * CRUD для новостей.
     * @param author
     * @param categorySlug
     * @param ordering Which field to use when ordering the results.
     * @param search A search term.
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesList(
        author?: number,
        categorySlug?: string,
        ordering?: string,
        search?: string,
    ): CancelablePromise<Array<NewsArticle>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/news/articles/',
            query: {
                'author': author,
                'category__slug': categorySlug,
                'ordering': ordering,
                'search': search,
            },
        });
    }
    /**
     * CRUD для новостей.
     * @param requestBody
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesCreate(
        requestBody: NewsArticleRequest,
    ): CancelablePromise<NewsArticle> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/news/articles/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для новостей.
     * @param id A unique integer value identifying this новость.
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesRetrieve(
        id: number,
    ): CancelablePromise<NewsArticle> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/news/articles/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для новостей.
     * @param id A unique integer value identifying this новость.
     * @param requestBody
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesUpdate(
        id: number,
        requestBody: NewsArticleRequest,
    ): CancelablePromise<NewsArticle> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/news/articles/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для новостей.
     * @param id A unique integer value identifying this новость.
     * @param requestBody
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesPartialUpdate(
        id: number,
        requestBody?: PatchedNewsArticleRequest,
    ): CancelablePromise<NewsArticle> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/news/articles/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для новостей.
     * @param id A unique integer value identifying this новость.
     * @returns void
     * @throws ApiError
     */
    public static newsArticlesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/news/articles/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Получение комментариев первого уровня для статьи.
     * @param id A unique integer value identifying this новость.
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesCommentsRetrieve(
        id: number,
    ): CancelablePromise<NewsArticle> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/news/articles/{id}/comments/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Добавление комментария к статье.
     * @param id A unique integer value identifying this новость.
     * @param requestBody
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesCommentsAddCreate(
        id: number,
        requestBody: NewsArticleRequest,
    ): CancelablePromise<NewsArticle> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/news/articles/{id}/comments/add/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для новостей.
     * @param id A unique integer value identifying this новость.
     * @param requestBody
     * @returns NewsArticle
     * @throws ApiError
     */
    public static newsArticlesLikeCreate(
        id: number,
        requestBody: NewsArticleRequest,
    ): CancelablePromise<NewsArticle> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/news/articles/{id}/like/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для новостей.
     * @param id A unique integer value identifying this новость.
     * @returns void
     * @throws ApiError
     */
    public static newsArticlesLikeDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/news/articles/{id}/like/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для категорий новостей (только Админы).
     * @returns NewsCategory
     * @throws ApiError
     */
    public static newsCategoriesList(): CancelablePromise<Array<NewsCategory>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/news/categories/',
        });
    }
    /**
     * CRUD для категорий новостей (только Админы).
     * @param requestBody
     * @returns NewsCategory
     * @throws ApiError
     */
    public static newsCategoriesCreate(
        requestBody: NewsCategoryRequest,
    ): CancelablePromise<NewsCategory> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/news/categories/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для категорий новостей (только Админы).
     * @param slug
     * @returns NewsCategory
     * @throws ApiError
     */
    public static newsCategoriesRetrieve(
        slug: string,
    ): CancelablePromise<NewsCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/news/categories/{slug}/',
            path: {
                'slug': slug,
            },
        });
    }
    /**
     * CRUD для категорий новостей (только Админы).
     * @param slug
     * @param requestBody
     * @returns NewsCategory
     * @throws ApiError
     */
    public static newsCategoriesUpdate(
        slug: string,
        requestBody: NewsCategoryRequest,
    ): CancelablePromise<NewsCategory> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/news/categories/{slug}/',
            path: {
                'slug': slug,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для категорий новостей (только Админы).
     * @param slug
     * @param requestBody
     * @returns NewsCategory
     * @throws ApiError
     */
    public static newsCategoriesPartialUpdate(
        slug: string,
        requestBody?: PatchedNewsCategoryRequest,
    ): CancelablePromise<NewsCategory> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/news/categories/{slug}/',
            path: {
                'slug': slug,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для категорий новостей (только Админы).
     * @param slug
     * @returns void
     * @throws ApiError
     */
    public static newsCategoriesDestroy(
        slug: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/news/categories/{slug}/',
            path: {
                'slug': slug,
            },
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @returns NewsComment
     * @throws ApiError
     */
    public static newsCommentsList(): CancelablePromise<Array<NewsComment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/news/comments/',
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @param requestBody
     * @returns NewsComment
     * @throws ApiError
     */
    public static newsCommentsCreate(
        requestBody: NewsCommentRequest,
    ): CancelablePromise<NewsComment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/news/comments/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @param id A unique integer value identifying this комментарий к новости.
     * @returns NewsComment
     * @throws ApiError
     */
    public static newsCommentsRetrieve(
        id: number,
    ): CancelablePromise<NewsComment> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/news/comments/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @param id A unique integer value identifying this комментарий к новости.
     * @param requestBody
     * @returns NewsComment
     * @throws ApiError
     */
    public static newsCommentsUpdate(
        id: number,
        requestBody: NewsCommentRequest,
    ): CancelablePromise<NewsComment> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/news/comments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @param id A unique integer value identifying this комментарий к новости.
     * @param requestBody
     * @returns NewsComment
     * @throws ApiError
     */
    public static newsCommentsPartialUpdate(
        id: number,
        requestBody?: PatchedNewsCommentRequest,
    ): CancelablePromise<NewsComment> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/news/comments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @param id A unique integer value identifying this комментарий к новости.
     * @returns void
     * @throws ApiError
     */
    public static newsCommentsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/news/comments/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @param id A unique integer value identifying this комментарий к новости.
     * @param requestBody
     * @returns NewsComment
     * @throws ApiError
     */
    public static newsCommentsLikeCreate(
        id: number,
        requestBody: NewsCommentRequest,
    ): CancelablePromise<NewsComment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/news/comments/{id}/like/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD для комментариев (редактирование/удаление).
     * @param id A unique integer value identifying this комментарий к новости.
     * @returns void
     * @throws ApiError
     */
    public static newsCommentsLikeDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/news/comments/{id}/like/',
            path: {
                'id': id,
            },
        });
    }
}
