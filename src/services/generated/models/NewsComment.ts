/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type NewsComment = {
    readonly id: number;
    readonly author: User;
    content: string;
    readonly created_at: string;
    readonly replies: string;
    readonly likes_count: number;
    readonly is_liked_by_current_user: string;
};

