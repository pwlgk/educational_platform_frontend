/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewsCategory } from './NewsCategory';
import type { User } from './User';
export type NewsArticle = {
    readonly id: number;
    title: string;
    content: string;
    readonly category: NewsCategory;
    readonly author: User;
    readonly created_at: string;
    readonly updated_at: string;
    is_published?: boolean;
    readonly comment_count: number;
    readonly likes_count: number;
    readonly is_liked_by_current_user: string;
};

