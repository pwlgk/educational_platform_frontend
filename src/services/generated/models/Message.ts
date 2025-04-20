/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type Message = {
    readonly id: number;
    readonly chat_id: number;
    readonly sender: User;
    content?: string | null;
    readonly file_url: string;
    readonly timestamp: string;
};

