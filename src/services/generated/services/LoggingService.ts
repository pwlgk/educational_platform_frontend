/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LogResponse } from '../models/LogResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoggingService {
    /**
     * Получить последние N строк лог-файла по его псевдониму.
     * @param logAlias Псевдоним лог-файла (из настроек MONITOR_LOG_FILES)
     * @param lines Количество последних строк для отображения
     * @returns LogResponse
     * @throws ApiError
     */
    public static monitorLogsRetrieve(
        logAlias: string,
        lines: number = 50,
    ): CancelablePromise<LogResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/monitor/logs/',
            query: {
                'lines': lines,
                'log_alias': logAlias,
            },
        });
    }
}
