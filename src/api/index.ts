import { Api } from './Api';

export const api = new Api({
  baseURL: '/api',
});

// Настройка interceptors для автоматической подстановки токена
api.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Убеждаемся, что Content-Type установлен для POST/PUT запросов
  if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
    if (!config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  
  return config;
});

// Обработка ошибок ответа
api.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Логируем ошибку для отладки
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

