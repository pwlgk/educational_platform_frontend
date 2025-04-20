/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from './Profile';
import type { RoleEnum } from './RoleEnum';
export type User = {
    readonly id: number;
    readonly email: string;
    first_name?: string;
    last_name?: string;
    patronymic?: string;
    readonly role: RoleEnum;
    profile?: Profile;
    /**
     * Отметьте, если пользователь должен считаться активным. Уберите эту отметку вместо удаления учётной записи.
     */
    readonly is_active: boolean;
    readonly is_role_confirmed: boolean;
    readonly date_joined: string;
};

