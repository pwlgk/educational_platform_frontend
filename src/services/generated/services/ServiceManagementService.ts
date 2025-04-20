/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ServiceActionResponse } from '../models/ServiceActionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceManagementService {
    /**
     * Получить список служб (systemd).
     * @returns any No response body
     * @throws ApiError
     */
    public static monitorServicesRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/monitor/services/',
        });
    }
    /**
     * Выполнить действие (start, stop, restart, status) над службой.
     * Требует прав суперпользователя и настроенного sudo/polkit.
     * @param action Действие над службой
     * @param serviceName Имя службы
     * @returns ServiceActionResponse
     * @throws ApiError
     */
    public static monitorServicesCreate(
        action: 'restart' | 'start' | 'status' | 'stop',
        serviceName: string,
    ): CancelablePromise<ServiceActionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/monitor/services/{service_name}/{action}/',
            path: {
                'action': action,
                'service_name': serviceName,
            },
        });
    }
}
