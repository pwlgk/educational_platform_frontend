/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Упрощенный сериализатор для списков тем.
 */
export type ForumTopicList = {
    readonly id: number;
    readonly category_name: string;
    readonly title: string;
    readonly author_name: string;
    readonly created_at: string;
    readonly last_post_at: string;
    readonly is_pinned: boolean;
    readonly is_closed: boolean;
    readonly tags: Array<string>;
    readonly post_count: number;
    readonly last_post_author_name: string | null;
};

