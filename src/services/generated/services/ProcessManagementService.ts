/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProcessActionRequest } from '../models/ProcessActionRequest';
import type { ProcessActionResponse } from '../models/ProcessActionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProcessManagementService {
    /**
     * Получить список процессов.
     * @returns any No response body
     * @throws ApiError
     */
    public static monitorProcessesRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/monitor/processes/',
        });
    }
    /**
     * Выполнить действие над процессом (terminate/kill).
     * Требует прав суперпользователя.
     * @param pid
     * @param requestBody
     * @returns ProcessActionResponse
     * @throws ApiError
     */
    public static monitorProcessesCreate(
        pid: number,
        requestBody: ProcessActionRequest,
    ): CancelablePromise<ProcessActionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/monitor/processes/{pid}/',
            path: {
                'pid': pid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
