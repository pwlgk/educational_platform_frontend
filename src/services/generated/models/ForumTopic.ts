/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForumAuthor } from './ForumAuthor';
import type { ForumCategory } from './ForumCategory';
export type ForumTopic = {
    readonly id: number;
    readonly category: ForumCategory;
    title: string;
    readonly author: ForumAuthor;
    readonly created_at: string;
    readonly last_post_at: string;
    is_pinned?: boolean;
    is_closed?: boolean;
    tags?: Array<string>;
    readonly post_count: number;
    readonly last_post: string;
};

