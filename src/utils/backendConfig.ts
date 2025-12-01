const BACKEND_IP_KEY = 'backend_ip';
const DEFAULT_BACKEND_IP = 'http://192.168.0.123:8080';

/**
 * Получить IP адрес бэкенда из localStorage или вернуть значение по умолчанию
 */
export const getBackendIP = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_BACKEND_IP;
  }
  
  const savedIP = localStorage.getItem(BACKEND_IP_KEY);
  return savedIP || DEFAULT_BACKEND_IP;
};

/**
 * Сохранить IP адрес бэкенда в localStorage
 */
export const setBackendIP = (ip: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Валидация формата IP адреса
  try {
    const url = new URL(ip);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Протокол должен быть http или https');
    }
    localStorage.setItem(BACKEND_IP_KEY, ip);
  } catch (error) {
    throw new Error('Неверный формат IP адреса. Используйте формат: http://192.168.0.123:8080');
  }
};

/**
 * Проверить, установлен ли IP адрес (отличается от значения по умолчанию)
 */
export const isBackendIPConfigured = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const savedIP = localStorage.getItem(BACKEND_IP_KEY);
  return !!savedIP && savedIP !== DEFAULT_BACKEND_IP;
};

