// src/services/initApi.ts
import { OpenAPI } from '@/services/generated';
import { API_BASE_URL } from './config';

export function initializeApiConfiguration(): void {
  OpenAPI.BASE = API_BASE_URL;
  // Здесь можно добавить и другие глобальные настройки, если генератор их поддерживает,
  // например, передачу токена через OpenAPI.TOKEN, но интерцепторы Axios надежнее.
  console.log(`OpenAPI Base URL set to: ${OpenAPI.BASE}`);
}