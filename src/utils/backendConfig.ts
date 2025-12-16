// Хардкод IP адреса бэкенда
const BACKEND_IP = 'http://192.168.0.123:8080';

/**
 * Получить IP адрес бэкенда (хардкод)
 */
export const getBackendIP = (): string => {
  return BACKEND_IP;
};

