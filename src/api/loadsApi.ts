import type { IPaginatedLoads, ILoad, ICartBadge } from '../types';
import { LOADS_MOCK } from './mock';
import { getBackendIP } from '../utils/backendConfig';

// Более надежное определение Tauri
const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;

// Получаем IP адрес бэкенда из localStorage или используем значение по умолчанию
const getAPI_PREFIX = () => {
  if (isTauri) {
    const backendIP = getBackendIP();
    return `${backendIP}/api`;
  }
  return '/api';
};

// Функция для получения текущего API префикса
const getCurrentAPIPrefix = () => {
  const prefix = getAPI_PREFIX();
  console.log('API Configuration:', { isTauri, API_PREFIX: prefix, backendIP: isTauri ? getBackendIP() : 'proxy' });
  return prefix;
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
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (minNormative !== undefined) {
    params.append('min_normative', minNormative.toString());
  }
  if (maxNormative !== undefined) {
    params.append('max_normative', maxNormative.toString());
  }

  const API_PREFIX = getCurrentAPIPrefix();
  const url = params.toString()
    ? `${API_PREFIX}/loads?${params.toString()}`
    : `${API_PREFIX}/loads`;

  console.log('Fetching from URL:', url);

  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Backend response not OK:', response.status, response.statusText);
      throw new Error(`Backend is not available: ${response.status}`);
    }
    const data = await response.json();
    console.log('Backend response data:', data);

    let items: ILoad[] = [];
    let total: number = 0;

    // Обработка различных форматов ответа
    if (Array.isArray(data)) {
      items = data;
      total = data.length;
    } else if (data && Array.isArray(data.items)) {
      items = data.items;
      total = data.total || data.items.length;
    } else if (data && Array.isArray(data.data)) { // Если ответ в формате { data: [...] }
      items = data.data;
      total = data.total || data.data.length;
    } else {
      console.warn('Unexpected backend response format, assuming empty array:', data);
      items = [];
      total = 0;
    }

    console.log('Processed items:', items);
    return { items, total };
  } catch (error) {
    console.warn('Failed to fetch from backend, using mock data.', error);
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
  const API_PREFIX = getCurrentAPIPrefix();
  const url = `${API_PREFIX}/loads/${id}`;
  console.log('Fetching single load from URL:', url);
  try {
    const response = await fetch(url);
    console.log('Single load response status:', response.status);
    if (!response.ok) {
      throw new Error('Backend is not available');
    }
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch load ${id}, using mock data.`, error);
    const load = LOADS_MOCK.items.find((l) => l.id === parseInt(id));
    return load || null;
  }
};

// Получение корзины (всегда обращается к бэкенду)
export const getCartBadge = async (): Promise<ICartBadge> => {
  const API_PREFIX = getCurrentAPIPrefix();
  const url = `${API_PREFIX}/load-sessions/cart`;
  console.log('Fetching cart from URL:', url);
  try {
    const token = localStorage.getItem('authToken');

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      credentials: 'include',
    });
    console.log('Cart response status:', response.status);

    if (!response.ok) {
      throw new Error('Failed to fetch cart data');
    }
    return await response.json();
  } catch (error) {
    console.warn('Could not fetch cart data, assuming cart is empty.', error);
    return { load_session_id: null, loads_count: 0 };
  }
};

