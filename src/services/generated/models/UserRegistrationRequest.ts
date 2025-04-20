/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
export type UserRegistrationRequest = {
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    patronymic?: string;
    role: RoleEnum;
    invite_code?: string | null;
};

