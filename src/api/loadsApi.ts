import type { IPaginatedLoads, ILoad, ICartBadge } from '../types';
import { LOADS_MOCK } from './mock';

// ============================================
// НАСТРОЙКА URL БЭКЕНДА
// ============================================
// Для подключения к бэкенду на вашем компьютере:
// 1. Используйте ngrok или другой туннель для получения публичного URL
// 2. Укажите URL здесь или через переменную окружения VITE_API_URL
// 
// Пример с ngrok:
// 1. Установите ngrok: https://ngrok.com/
// 2. Запустите: ngrok http 8080
// 3. Скопируйте HTTPS URL (например: https://abc123.ngrok.io)
// 4. Укажите его ниже в BACKEND_URL или в .env.production как VITE_API_URL

// УКАЖИТЕ ЗДЕСЬ URL ВАШЕГО БЭКЕНДА
// ВАЖНО: localhost работает ТОЛЬКО для локальной разработки!
// Для GitHub Pages нужен публичный URL (ngrok или другой туннель)
const BACKEND_URL = 'http://localhost:8080'; // Для локальной разработки
// Для GitHub Pages используйте: 'https://ваш-ngrok-url.ngrok.io'

// ============================================

// Определяем URL бэкенда
// В dev режиме (localhost) используем прокси Vite (/api)
// В production используем BACKEND_URL или переменную окружения VITE_API_URL
const getApiPrefix = (): string => {
  // Если указан BACKEND_URL в коде, используем его
  if (BACKEND_URL && BACKEND_URL.trim()) {
    const baseUrl = BACKEND_URL.trim();
    // Убираем trailing slash если есть
    return baseUrl.endsWith('/') ? `${baseUrl.slice(0, -1)}/api` : `${baseUrl}/api`;
  }
  
  // Если задана переменная окружения, используем её
  if (import.meta.env.VITE_API_URL) {
    const baseUrl = import.meta.env.VITE_API_URL.trim();
    // Убираем trailing slash если есть
    return baseUrl.endsWith('/') ? `${baseUrl.slice(0, -1)}/api` : `${baseUrl}/api`;
  }
  
  // В dev режиме используем прокси
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // В production без URL - используем относительный путь (не сработает на GitHub Pages)
  return '/api';
};

const API_PREFIX = getApiPrefix();

// Состояние доступности бэкенда
let isBackendAvailable: boolean | null = null;

// Проверяем, находимся ли мы в production на GitHub Pages
const isProductionOnGitHubPages = (): boolean => {
  // Проверяем, что мы не в dev режиме и нет ни BACKEND_URL, ни VITE_API_URL
  return !import.meta.env.DEV && !BACKEND_URL && !import.meta.env.VITE_API_URL;
};

// Получаем базовый URL для health check
const getHealthUrl = (): string | null => {
  // Если указан BACKEND_URL в коде, используем его
  if (BACKEND_URL && BACKEND_URL.trim()) {
    const baseUrl = BACKEND_URL.trim();
    return baseUrl.endsWith('/') ? `${baseUrl.slice(0, -1)}/health` : `${baseUrl}/health`;
  }
  
  // Если задана переменная окружения, используем её
  if (import.meta.env.VITE_API_URL) {
    const baseUrl = import.meta.env.VITE_API_URL.trim();
    // Убираем trailing slash если есть
    return baseUrl.endsWith('/') ? `${baseUrl.slice(0, -1)}/health` : `${baseUrl}/health`;
  }
  
  // В dev режиме используем прокси
  if (import.meta.env.DEV) {
    return '/health';
  }
  
  // В production без URL - не проверяем бэкенд
  return null;
};

// Вспомогательные функции
const checkBackendAvailability = async (): Promise<boolean> => {
  if (isBackendAvailable !== null) return isBackendAvailable;
  
  // Если мы в production на GitHub Pages без VITE_API_URL, сразу используем моки
  if (isProductionOnGitHubPages()) {
    console.log('Production на GitHub Pages без VITE_API_URL, используем моковые данные');
    isBackendAvailable = false;
    return false;
  }
  
  const healthUrl = getHealthUrl();
  
  // Если нет URL для проверки, используем моки
  if (healthUrl === null) {
    console.log('VITE_API_URL не задана, используем моковые данные');
    isBackendAvailable = false;
    return false;
  }
  
  try {
    // Используем GET вместо HEAD (более надёжно)
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    isBackendAvailable = response.ok;
    console.log(`Бэкенд ${isBackendAvailable ? 'доступен' : 'недоступен'}`);
  } catch (error) {
    // Не логируем ошибку как warning, если это ожидаемое поведение
    if (!isProductionOnGitHubPages()) {
      console.warn('Бэкенд недоступен, используем моковые данные', error);
    }
    isBackendAvailable = false;
  }
  
  return isBackendAvailable;
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Проверка авторизации пользователя
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// Получение списка нагрузок с фильтрацией
export const getLoads = async (
  search?: string,
  category?: string,
  minNormative?: number,
  maxNormative?: number
): Promise<IPaginatedLoads> => {
  const backendAvailable = await checkBackendAvailability();
  
  if (!backendAvailable) {
    console.log('Используем моковые данные для getLoads');
    let filteredMockItems = LOADS_MOCK.items;

    if (search) {
      filteredMockItems = filteredMockItems.filter((load) =>
        load.load_title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredMockItems = filteredMockItems.filter(
        (load) => load.load_category === category
      );
    }

    if (minNormative !== undefined || maxNormative !== undefined) {
      filteredMockItems = filteredMockItems.filter((load) => {
        if (minNormative !== undefined && load.normative < minNormative) {
          return false;
        }
        if (maxNormative !== undefined && load.normative > maxNormative) {
          return false;
        }
        return true;
      });
    }

    return { items: filteredMockItems, total: filteredMockItems.length };
  }

  // Дополнительная проверка: если мы в production на GitHub Pages без VITE_API_URL,
  // не делаем запросы (должны были вернуться раньше, но на всякий случай)
  if (isProductionOnGitHubPages()) {
    console.log('Дополнительная проверка: используем моковые данные');
    let filteredMockItems = LOADS_MOCK.items;
    if (search) {
      filteredMockItems = filteredMockItems.filter((load) =>
        load.load_title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      filteredMockItems = filteredMockItems.filter(
        (load) => load.load_category === category
      );
    }
    if (minNormative !== undefined || maxNormative !== undefined) {
      filteredMockItems = filteredMockItems.filter((load) => {
        if (minNormative !== undefined && load.normative < minNormative) return false;
        if (maxNormative !== undefined && load.normative > maxNormative) return false;
        return true;
      });
    }
    return { items: filteredMockItems, total: filteredMockItems.length };
  }

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (minNormative !== undefined) {
    params.append('min_normative', minNormative.toString());
  }
  if (maxNormative !== undefined) {
    params.append('max_normative', maxNormative.toString());
  }

  const url = params.toString()
    ? `${API_PREFIX}/loads?${params.toString()}`
    : `${API_PREFIX}/loads`;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error('Ошибка загрузки нагрузок');
    }
    const data = await response.json();
    console.log('Backend response:', data);
    return {
      items: data.items || [],
      total: data.items ? data.items.length : 0,
    };
  } catch (error) {
    console.warn('Ошибка при запросе нагрузок, используем моки', error);
    isBackendAvailable = false;
    
    let filteredMockItems = LOADS_MOCK.items;

    if (search) {
      filteredMockItems = filteredMockItems.filter((load) =>
        load.load_title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredMockItems = filteredMockItems.filter(
        (load) => load.load_category === category
      );
    }

    if (minNormative !== undefined || maxNormative !== undefined) {
      filteredMockItems = filteredMockItems.filter((load) => {
        if (minNormative !== undefined && load.normative < minNormative) {
          return false;
        }
        if (maxNormative !== undefined && load.normative > maxNormative) {
          return false;
        }
        return true;
      });
    }

    return { items: filteredMockItems, total: filteredMockItems.length };
  }
};

// Получение одной нагрузки по ID
export const getLoadById = async (id: string): Promise<ILoad | null> => {
  const backendAvailable = await checkBackendAvailability();
  
  if (!backendAvailable) {
    console.log('Используем моковые данные для getLoadById');
    const load = LOADS_MOCK.items.find((l) => l.id === parseInt(id));
    if (load) return load;
    return null;
  }
  
  // Дополнительная проверка: если мы в production на GitHub Pages без VITE_API_URL
  if (isProductionOnGitHubPages()) {
    console.log('Дополнительная проверка: используем моковые данные для getLoadById');
    const load = LOADS_MOCK.items.find((l) => l.id === parseInt(id));
    if (load) return load;
    return null;
  }
  
  try {
    const response = await fetchWithTimeout(`${API_PREFIX}/loads/${id}`);
    if (!response.ok) {
      throw new Error('Load not found');
    }
    return await response.json();
  } catch (error) {
    console.warn('Ошибка при запросе нагрузки по ID, используем моки', error);
    isBackendAvailable = false;
    
    const load = LOADS_MOCK.items.find((l) => l.id === parseInt(id));
    if (load) return load;
    return null;
  }
};

// Получение корзины (всегда обращается к бэкенду)
export const getCartBadge = async (): Promise<ICartBadge> => {
  const backendAvailable = await checkBackendAvailability();
  
  if (!backendAvailable) {
    console.log('Бэкенд недоступен, возвращаем пустую корзину');
    return { load_session_id: null, loads_count: 0 };
  }
  
  // Дополнительная проверка: если мы в production на GitHub Pages без VITE_API_URL
  if (isProductionOnGitHubPages()) {
    console.log('Дополнительная проверка: возвращаем пустую корзину');
    return { load_session_id: null, loads_count: 0 };
  }
  
  try {
    const token = localStorage.getItem('authToken');
    
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetchWithTimeout(`${API_PREFIX}/load-sessions/cart`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart data');
    }
    return await response.json();
  } catch (error) {
    console.warn('Could not fetch cart data, assuming cart is empty.', error);
    isBackendAvailable = false;
    return { load_session_id: null, loads_count: 0 };
  }
};

// Дополнительные функции для управления режимом
export const forceMockMode = (): void => {
  isBackendAvailable = false;
  console.log('Принудительно включен режим моковых данных');
};

export const forceBackendMode = (): void => {
  isBackendAvailable = true;
  console.log('Принудительно включен режим бэкенда');
};

export const resetBackendCheck = (): void => {
  isBackendAvailable = null;
  console.log('Сброшена проверка доступности бэкенда');
};

export const isUsingMockData = (): boolean => {
  return isBackendAvailable === false;
};

export const getBackendStatus = (): 'checking' | 'available' | 'unavailable' => {
  if (isBackendAvailable === null) return 'checking';
  if (isBackendAvailable === true) return 'available';
  return 'unavailable';
};

