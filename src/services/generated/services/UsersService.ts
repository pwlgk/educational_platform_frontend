/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import type { InvitationCode } from '../models/InvitationCode';
import type { InvitationCodeRequest } from '../models/InvitationCodeRequest';
import type { PatchedChangePasswordRequest } from '../models/PatchedChangePasswordRequest';
import type { PatchedInvitationCodeRequest } from '../models/PatchedInvitationCodeRequest';
import type { PatchedUserRequest } from '../models/PatchedUserRequest';
import type { TokenObtainPair } from '../models/TokenObtainPair';
import type { TokenObtainPairRequest } from '../models/TokenObtainPairRequest';
import type { TokenRefresh } from '../models/TokenRefresh';
import type { TokenRefreshRequest } from '../models/TokenRefreshRequest';
import type { User } from '../models/User';
import type { UserRegistration } from '../models/UserRegistration';
import type { UserRegistrationRequest } from '../models/UserRegistrationRequest';
import type { UserRequest } from '../models/UserRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * @returns InvitationCode
     * @throws ApiError
     */
    public static usersAdminInvitationsList(): CancelablePromise<Array<InvitationCode>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/admin/invitations/',
        });
    }
    /**
     * @param requestBody
     * @returns InvitationCode
     * @throws ApiError
     */
    public static usersAdminInvitationsCreate(
        requestBody: InvitationCodeRequest,
    ): CancelablePromise<InvitationCode> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/admin/invitations/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns InvitationCode
     * @throws ApiError
     */
    public static usersAdminInvitationsRetrieve(
        id: string,
    ): CancelablePromise<InvitationCode> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/admin/invitations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns InvitationCode
     * @throws ApiError
     */
    public static usersAdminInvitationsUpdate(
        id: string,
        requestBody: InvitationCodeRequest,
    ): CancelablePromise<InvitationCode> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/admin/invitations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns InvitationCode
     * @throws ApiError
     */
    public static usersAdminInvitationsPartialUpdate(
        id: string,
        requestBody?: PatchedInvitationCodeRequest,
    ): CancelablePromise<InvitationCode> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/users/admin/invitations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static usersAdminInvitationsDestroy(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/admin/invitations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param isActive
     * @param isRoleConfirmed
     * @param ordering Which field to use when ordering the results.
     * @param role * `STUDENT` - Студент
     * * `TEACHER` - Преподаватель
     * * `PARENT` - Родитель
     * * `ADMIN` - Администратор
     * @param search A search term.
     * @returns User
     * @throws ApiError
     */
    public static usersAdminUsersList(
        isActive?: boolean,
        isRoleConfirmed?: boolean,
        ordering?: string,
        role?: 'ADMIN' | 'PARENT' | 'STUDENT' | 'TEACHER',
        search?: string,
    ): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/admin/users/',
            query: {
                'is_active': isActive,
                'is_role_confirmed': isRoleConfirmed,
                'ordering': ordering,
                'role': role,
                'search': search,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this пользователь.
     * @returns User
     * @throws ApiError
     */
    public static usersAdminUsersRetrieve(
        id: number,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/admin/users/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any No response body
     * @throws ApiError
     */
    public static usersChangePasswordUpdate(
        requestBody: ChangePasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/change-password/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any No response body
     * @throws ApiError
     */
    public static usersChangePasswordPartialUpdate(
        requestBody?: PatchedChangePasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/users/change-password/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param token
     * @returns any No response body
     * @throws ApiError
     */
    public static usersConfirmRetrieve(
        token: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/confirm/{token}/',
            path: {
                'token': token,
            },
        });
    }
    /**
     * Takes a set of user credentials and returns an access and refresh JSON web
     * token pair to prove the authentication of those credentials.
     * @param requestBody
     * @returns TokenObtainPair
     * @throws ApiError
     */
    public static usersLoginCreate(
        requestBody: TokenObtainPairRequest,
    ): CancelablePromise<TokenObtainPair> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/login/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Takes a refresh type JSON web token and returns an access type JSON web
     * token if the refresh token is valid.
     * @param requestBody
     * @returns TokenRefresh
     * @throws ApiError
     */
    public static usersLoginRefreshCreate(
        requestBody: TokenRefreshRequest,
    ): CancelablePromise<TokenRefresh> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/login/refresh/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns User
     * @throws ApiError
     */
    public static usersProfileRetrieve(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/profile/',
        });
    }
    /**
     * @param requestBody
     * @returns User
     * @throws ApiError
     */
    public static usersProfileUpdate(
        requestBody?: UserRequest,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/profile/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns User
     * @throws ApiError
     */
    public static usersProfilePartialUpdate(
        requestBody?: PatchedUserRequest,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/users/profile/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns UserRegistration
     * @throws ApiError
     */
    public static usersRegisterCreate(
        requestBody: UserRegistrationRequest,
    ): CancelablePromise<UserRegistration> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/register/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param ordering Which field to use when ordering the results.
     * @param role * `STUDENT` - Студент
     * * `TEACHER` - Преподаватель
     * * `PARENT` - Родитель
     * * `ADMIN` - Администратор
     * @param search A search term.
     * @returns User
     * @throws ApiError
     */
    public static usersUsersList(
        ordering?: string,
        role?: 'ADMIN' | 'PARENT' | 'STUDENT' | 'TEACHER',
        search?: string,
    ): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/users/',
            query: {
                'ordering': ordering,
                'role': role,
                'search': search,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this пользователь.
     * @returns User
     * @throws ApiError
     */
    public static usersUsersRetrieve(
        id: number,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/users/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
