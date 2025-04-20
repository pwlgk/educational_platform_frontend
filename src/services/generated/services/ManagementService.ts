/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommandRequestRequest } from '../models/CommandRequestRequest';
import type { CommandResponse } from '../models/CommandResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ManagementService {
    /**
     * Выполнить разрешенную команду на сервере.
     * Требует прав суперпользователя.
     * @param requestBody
     * @returns CommandResponse
     * @throws ApiError
     */
    public static monitorCommandCreate(
        requestBody: CommandRequestRequest,
    ): CancelablePromise<CommandResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/monitor/command/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
