import { createSlice } from '@reduxjs/toolkit';
import type { ILoad } from '../../types';

interface LoadsState {
  loads: ILoad[];
  currentLoad: ILoad | null;
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: LoadsState = {
  loads: [],
  currentLoad: null,
  loading: false,
  error: null,
  total: 0,
};

const loadsSlice = createSlice({
  name: 'loads',
  initialState,
  reducers: {
    setLoads(state, { payload }) {
      state.loads = payload.items || [];
      state.total = payload.total || 0;
      state.loading = false;
      state.error = null;
    },
    setLoad(state, { payload }) {
      state.currentLoad = payload;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, { payload }) {
      state.loading = payload;
      if (payload) {
        state.error = null;
      }
    },
    setError(state, { payload }) {
      state.error = payload;
      state.loading = false;
    },
    clearCurrentLoad(state) {
      state.currentLoad = null;
    },
  },
});

export const { setLoads, setLoad, setLoading, setError, clearCurrentLoad } = loadsSlice.actions;
export default loadsSlice.reducer;

