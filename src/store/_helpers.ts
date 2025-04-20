// Можно поместить в src/store/_helpers.ts и экспортировать:
// export function getErrorMessage(error: any): string { ... }
// Либо определить прямо в файле стора (auth.store.ts, notifications.store.ts и т.д.)

import { ApiError } from '@/services/generated'; // Импортируем тип ошибки из генератора
import axios from 'axios'; // Импортируем axios для проверки isAxiosError

/**
 * Извлекает читаемое сообщение об ошибке из различных типов ошибок.
 * @param error - Объект ошибки (может быть ApiError, AxiosError, Error или другим)
 * @returns Строка с сообщением об ошибке или стандартное сообщение.
 */
export function getErrorMessage(error: any): string {
    console.log("Error object received by getErrorMessage:", error); // Логгируем исходный объект

    // 1. Проверка на ApiError (из openapi-typescript-codegen)
    // ApiError обычно имеет status и body
    if (error instanceof ApiError || (error && typeof error === 'object' && 'body' in error && 'status' in error)) {
        console.log("Error identified as ApiError or similar structure.");
        const body = error.body as any; // Типизация body может быть разной (object, string, etc.)
        const status = error.status; // Статус код из ApiError

        // Пытаемся извлечь 'detail' (стандарт для DRF)
        const detail = body?.detail;
        if (typeof detail === 'string') {
            return detail; // Возвращаем 'detail', если это строка
        }

        // Если 'detail' нет или это не строка, проверяем, является ли body объектом
        // (может содержать ошибки валидации полей)
        if (typeof body === 'object' && body !== null) {
            try {
                // Пытаемся собрать ошибки валидации в одну строку
                const fieldErrors = Object.entries(body)
                    .map(([key, value]) => {
                        // Приводим значение к строке, объединяя массив, если нужно
                        const message = Array.isArray(value) ? value.join(', ') : String(value);
                        return `${key}: ${message}`; // Формат "field: error message"
                    })
                    .join('; '); // Объединяем ошибки полей через "; "

                // Если удалось собрать ошибки полей, возвращаем их
                if (fieldErrors) {
                    return fieldErrors;
                }
            } catch {
                // Если форматирование не удалось, пытаемся вернуть JSON
                 return JSON.stringify(body);
            }
        }

        // Если body не объект или форматирование не удалось,
        // пытаемся вернуть строковое представление body
        if (typeof body === 'string' && body) {
            return body;
        }

        // Если ничего не извлекли из body, используем стандартное сообщение ApiError
        if (error.message) {
            return error.message;
        }

        // Запасной вариант для ApiError
        return `API Error (Status: ${status})`;

    }
    // 2. Проверка на стандартную ошибку Axios
    else if (axios.isAxiosError(error)) {
        console.log("Error identified as AxiosError.");
        // Ошибка пришла от Axios (возможно, при запросе, не обернутом в ApiError)
        if (error.response?.data) {
            // Пытаемся извлечь данные из ответа Axios
            const data = error.response.data as any;
            const detail = data?.detail;

            if (typeof detail === 'string') {
                return detail;
            } else if (typeof data === 'object' && data !== null) {
                 try {
                     const fieldErrors = Object.entries(data)
                        .map(([key, value]) => {
                            const message = Array.isArray(value) ? value.join(', ') : String(value);
                            return `${key}: ${message}`;
                        })
                        .join('; ');
                     if (fieldErrors) return fieldErrors;
                     return JSON.stringify(data); // Запасной вариант для объекта data
                 } catch {
                     return JSON.stringify(data);
                 }
            } else if (typeof data === 'string' && data) {
                 return data; // Если data - это просто строка
            }
            // Если не удалось извлечь из data, возвращаем общее сообщение Axios
             return error.message || `Request failed with status ${error.response?.status}`;
        } else if (error.request) {
            // Запрос был сделан, но ответ не получен (ошибка сети?)
             console.log("AxiosError: No response received.");
            return 'Network Error: Could not reach the server.';
        } else {
            // Ошибка на этапе настройки запроса
            console.log("AxiosError: Error setting up request.");
            return error.message || 'Error setting up the request.';
        }
    }
    // 3. Проверка на стандартную ошибку JavaScript
    else if (error instanceof Error) {
        console.log("Error identified as standard Error.");
        return error.message;
    }
    // 4. Если тип ошибки неизвестен
    else {
        console.log("Error type unknown.");
        try {
            // Пытаемся преобразовать в строку
            return String(error);
        } catch {
            return 'An unknown error occurred';
        }
    }
}