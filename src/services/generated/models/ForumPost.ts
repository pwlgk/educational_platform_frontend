/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForumAuthor } from './ForumAuthor';
export type ForumPost = {
    readonly id: number;
    readonly author: ForumAuthor;
    content: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly topic_id_read: number;
    readonly replies: string;
    readonly likes_count: number;
    readonly is_liked_by_current_user: boolean;
};

