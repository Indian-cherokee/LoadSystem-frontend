import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { FilterState } from '../../types';

const initialState: FilterState = {
  searchTerm: '',
  minNormative: undefined,
  maxNormative: undefined,
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setMinNormative: (state, action: PayloadAction<number | undefined>) => {
      state.minNormative = action.payload;
    },
    setMaxNormative: (state, action: PayloadAction<number | undefined>) => {
      state.maxNormative = action.payload;
    },
  },
});

export const { setSearchTerm, setMinNormative, setMaxNormative } = filterSlice.actions;

export const selectSearchTerm = (state: RootState) => state.filter.searchTerm;
export const selectMinNormative = (state: RootState) => state.filter.minNormative;
export const selectMaxNormative = (state: RootState) => state.filter.maxNormative;

export default filterSlice.reducer;

