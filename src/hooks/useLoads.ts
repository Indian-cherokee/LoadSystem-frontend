import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { setLoads, setLoad, setLoading, setError } from '../store/slices/loadsSlice';
import { updateCartBadge, fetchCartBadge } from '../store/slices/loadSessionSlice';
import { api } from '../api';
import { LOADS_MOCK } from '../api/mock';

export function useLoadsList(params: { search?: string; category?: string; minNormative?: number; maxNormative?: number } = {}) {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    async function fetchData() {
      dispatch(setLoading(true));
      try {
        const response = await api.loads.loadsList({
          search: params.search,
          category: params.category,
        });
        
        const data = response.data;
        dispatch(setLoads({
          items: Array.isArray(data.items) ? data.items : [],
          total: data.total || 0,
        }));
      } catch (error) {
        console.warn('Failed to fetch from backend, using mock data.', error);
        let filteredMockItems = LOADS_MOCK.items;

        if (params.search) {
          filteredMockItems = filteredMockItems.filter((load) =>
            load.load_title.toLowerCase().includes(params.search!.toLowerCase())
          );
        }

        if (params.category) {
          filteredMockItems = filteredMockItems.filter(
            (load) => load.load_category === params.category
          );
        }

        if (params.minNormative !== undefined || params.maxNormative !== undefined) {
          filteredMockItems = filteredMockItems.filter((load) => {
            if (params.minNormative !== undefined && load.normative < params.minNormative) {
              return false;
            }
            if (params.maxNormative !== undefined && load.normative > params.maxNormative) {
              return false;
            }
            return true;
          });
        }

        dispatch(setLoads({
          items: filteredMockItems,
          total: filteredMockItems.length,
        }));
      }
    }
    fetchData();
  }, [dispatch, params.search, params.category, params.minNormative, params.maxNormative]);
}

export function GetLoadsList(params: { search?: string; category?: string; minNormative?: number; maxNormative?: number } = {}) {
  useLoadsList(params);
}

export function useLoadById(id: string) {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      dispatch(setLoading(true));
      try {
        const response = await api.loads.loadsDetail(parseInt(id));
        dispatch(setLoad(response.data));
      } catch (error) {
        console.warn(`Failed to fetch load ${id}, using mock data.`, error);
        const load = LOADS_MOCK.items.find((l) => l.id === parseInt(id));
        if (load) {
          dispatch(setLoad(load));
        } else {
          dispatch(setError('Нагрузка не найдена'));
        }
      }
    }
    fetchData();
  }, [dispatch, id]);
}

export function GetLoadById(id: string) {
  useLoadById(id);
}

export async function AddLoadToCart(loadId: number, dispatch: AppDispatch): Promise<void> {
  try {
    await api.loadSessions.draftLoadsCreate(loadId);
    
    const badgeResponse = await api.loadSessions.cartList();
    dispatch(updateCartBadge({
      load_session_id: badgeResponse.data.load_session_id ?? null,
      loads_count: badgeResponse.data.loads_count ?? 0,
    }));
    
    dispatch(fetchCartBadge());
  } catch (error: any) {
    const errorMessage = error.response?.data?.description || error.message || 'Ошибка при добавлении нагрузки';
    console.error('Error adding load to cart:', errorMessage);
    throw error;
  }
}

