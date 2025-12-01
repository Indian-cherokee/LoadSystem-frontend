import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ILoad, IPaginatedLoads } from '../../types';
import { LOADS_MOCK } from '../../api/mock';
import { api } from '../../api';

interface LoadsState {
  loads: ILoad[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: LoadsState = {
  loads: [],
  loading: false,
  error: null,
  total: 0,
};

export const getLoadsList = createAsyncThunk(
  'loads/getLoadsList',
  async (params: { search?: string; category?: string; minNormative?: number; maxNormative?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await api.loads.loadsList({
        search: params.search,
        category: params.category,
      });
      
      const data = response.data;
      return {
        items: Array.isArray(data.items) ? data.items : [],
        total: data.total || 0,
      };
    } catch (error) {
      // Fallback на мок-данные
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

      return { items: filteredMockItems, total: filteredMockItems.length };
    }
  }
);

// Получение одной нагрузки по ID
export const getLoadById = createAsyncThunk(
  'loads/getLoadById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.loads.loadsDetail(parseInt(id));
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch load ${id}, using mock data.`, error);
      const load = LOADS_MOCK.items.find((l) => l.id === parseInt(id));
      return load || null;
    }
  }
);

const loadsSlice = createSlice({
  name: 'loads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLoadsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadsList.fulfilled, (state, action) => {
        state.loading = false;
        state.loads = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(getLoadsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default loadsSlice.reducer;

