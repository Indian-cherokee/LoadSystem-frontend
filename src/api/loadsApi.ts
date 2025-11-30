import type { IPaginatedLoads, ILoad, ICartBadge } from '../types';
import { LOADS_MOCK } from './mock';

const API_PREFIX = '/api';

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

  const url = params.toString()
    ? `${API_PREFIX}/loads?${params.toString()}`
    : `${API_PREFIX}/loads`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Backend response not OK:', response.status, response.statusText);
      throw new Error(`Backend is not available: ${response.status}`);
    }
    const data = await response.json();
    console.log('Backend response:', data);
    return {
      items: data.items || [],
      total: data.items ? data.items.length : 0,
    };
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
  try {
    const response = await fetch(`${API_PREFIX}/loads/${id}`);
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
  try {
    const token = localStorage.getItem('authToken');
    
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_PREFIX}/load-sessions/cart`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart data');
    }
    return await response.json();
  } catch (error) {
    console.warn('Could not fetch cart data, assuming cart is empty.', error);
    return { load_session_id: null, loads_count: 0 };
  }
};

