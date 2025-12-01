import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';
import loadsReducer from './slices/loadsSlice';
import loadSessionReducer from './slices/loadSessionSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    loads: loadsReducer,
    loadSession: loadSessionReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

