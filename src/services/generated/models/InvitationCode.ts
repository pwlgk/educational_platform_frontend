/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
export type InvitationCode = {
    readonly id: number;
    readonly code: string;
    role: RoleEnum;
    readonly created_by: number;
    readonly created_by_email: string;
    readonly used_by: number | null;
    readonly used_by_email: string | null;
    readonly created_at: string;
    expires_at?: string | null;
    readonly is_valid: string;
};

