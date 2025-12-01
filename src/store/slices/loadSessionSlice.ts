import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logoutUser } from './userSlice';
import type { ILoad } from '../../types';
import { api } from '../../api';

interface LoadInSession {
  load: ILoad;
  count: number;
}

interface LoadSessionState {
  session_id: number | null;
  loads: LoadInSession[];
  count: number;
  loading: boolean;
  error: string | null;
  isDraft: boolean;
  status?: number;
  room_type?: string;
}

const initialState: LoadSessionState = {
  session_id: null,
  loads: [],
  count: 0,
  loading: false,
  error: null,
  isDraft: false,
  status: undefined,
  room_type: undefined,
};

// Получение бейджика корзины
export const fetchCartBadge = createAsyncThunk(
  'loadSession/fetchCartBadge',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching cart badge...');
      const response = await api.loadSessions.cartList();
      console.log('Cart badge response:', response.data);
      // Сохраняем ответ от бэкенда как есть (может быть -1 для пустой корзины)
      return {
        load_session_id: response.data.load_session_id ?? null,
        loads_count: response.data.loads_count ?? 0,
      };
    } catch (error) {
      console.warn('Could not fetch cart data, assuming cart is empty.', error);
      return { load_session_id: null, loads_count: 0 };
    }
  }
);

// Получение заявки по ID
export const fetchLoadSessionById = createAsyncThunk(
  'loadSession/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.loadSessions.loadSessionsDetail(parseInt(id));
      const session = response.data;
      
      // Преобразуем данные в нужный формат
      return {
        id: session.id,
        status: session.status,
        room_type: session.room_type,
        loads: session.loads?.map((load: any) => ({
          load: {
            id: load.load_id,
            load_title: load.load_title,
            load_category: load.load_category,
            load_image: load.load_image,
            normative: load.normative,
            reliability_coefficient: 0, // Если нет в ответе
          },
          count: load.area || 1, // area используется как количество/площадь
        })) || [],
        creation_date: session.created_at,
        forming_date: session.formed_at,
        completion_date: session.completed_at,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при загрузке заявки');
    }
  }
);

// Добавление нагрузки в черновик заявки
export const addLoadToSession = createAsyncThunk(
  'loadSession/addLoad',
  async (loadId: number, { dispatch, rejectWithValue }) => {
    try {
      await api.loadSessions.draftLoadsCreate(loadId);
      
      // Обновляем бейджик после добавления
      dispatch(fetchCartBadge());
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при добавлении нагрузки');
    }
  }
);

// Удаление нагрузки из заявки
export const removeLoadFromSession = createAsyncThunk(
  'loadSession/removeLoad',
  async ({ sessionId, loadId }: { sessionId: number; loadId: number }, { dispatch, rejectWithValue }) => {
    try {
      await api.loadSessions.loadsDelete(sessionId, loadId);

      // Обновляем данные заявки
      dispatch(fetchLoadSessionById(sessionId.toString()));
      return loadId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при удалении нагрузки');
    }
  }
);

// Обновление количества нагрузки в заявке
export const updateLoadCount = createAsyncThunk(
  'loadSession/updateLoadCount',
  async ({ sessionId, loadId, count }: { sessionId: number; loadId: number; count: number }, { rejectWithValue }) => {
    try {
      await api.loadSessions.loadsUpdate(sessionId, loadId, { area: count });
      // НЕ перезагружаем всю заявку, чтобы сохранить порядок услуг
      return { loadId, count };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при обновлении количества');
    }
  }
);

// Сохранение заявки
export const saveLoadSession = createAsyncThunk(
  'loadSession/save',
  async ({ sessionId, data }: { sessionId: number; data: any }, { rejectWithValue }) => {
    try {
      await api.loadSessions.loadSessionsUpdate(sessionId, data);
      return { success: true, data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при сохранении заявки');
    }
  }
);

// Удаление заявки
export const deleteLoadSession = createAsyncThunk(
  'loadSession/delete',
  async (sessionId: number, { rejectWithValue }) => {
    try {
      await api.loadSessions.loadSessionsDelete(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при удалении заявки');
    }
  }
);

// Подтверждение заявки (формирование)
export const submitLoadSession = createAsyncThunk(
  'loadSession/submit',
  async (sessionId: number, { dispatch, rejectWithValue }) => {
    try {
      await api.loadSessions.formUpdate(sessionId);

      dispatch(fetchLoadSessionById(sessionId.toString()));
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при формировании заявки');
    }
  }
);

// Получение списка заявок пользователя
export const fetchUserLoadSessions = createAsyncThunk(
  'loadSession/fetchUserSessions',
  async (params?: { status?: string; from?: string; to?: string }, { rejectWithValue }) => {
    try {
      console.log('API call params:', params);
      const response = await api.loadSessions.loadSessionsList({
        status: params?.status,
        from: params?.from,
        to: params?.to,
      });
      
      console.log('API raw response:', response);
      console.log('API response.data:', response.data);
      console.log('API response.data.items:', response.data?.items);
      
      // Бэкенд уже возвращает данные с правильными именами полей
      // creation_date, forming_date, completion_date уже есть в ответе
      return response.data;
    } catch (error: any) {
      console.error('API error:', error);
      console.error('API error response:', error.response);
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при загрузке заявок');
    }
  }
);

const loadSessionSlice = createSlice({
  name: 'loadSession',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.session_id = null;
      state.loads = [];
      state.count = 0;
      state.isDraft = false;
      state.status = undefined;
      state.room_type = undefined;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // === FETCH CART BADGE ===
      .addCase(fetchCartBadge.fulfilled, (state, action) => {
        // Сохраняем ответ от бэкенда как есть (может быть -1 для пустой корзины)
        state.session_id = action.payload.load_session_id;
        state.count = action.payload.loads_count ?? 0;
      })
      .addCase(fetchCartBadge.rejected, (state) => {
        state.session_id = null;
        state.count = 0;
      })

      // === FETCH BY ID ===
      .addCase(fetchLoadSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoadSessionById.fulfilled, (state, action) => {
        state.loading = false;
        const session = action.payload;
        state.session_id = session.id || null;
        state.loads = session.loads || [];
        state.count = session.loads?.length || 0;
        // Статус 1 обычно означает черновик (draft)
        state.isDraft = session.status === 1;
        state.status = session.status;
        state.room_type = session.room_type;
      })
      .addCase(fetchLoadSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // === REMOVE LOAD ===
      .addCase(removeLoadFromSession.fulfilled, (state, action) => {
        state.loads = state.loads.filter(load => load.load.id !== action.payload);
        state.count = state.loads.length;
      })

      // === UPDATE LOAD COUNT ===
      .addCase(updateLoadCount.fulfilled, (state, action) => {
        const loadItem = state.loads.find(load => load.load.id === action.payload.loadId);
        if (loadItem) {
          loadItem.count = action.payload.count;
        }
      })

      // === DELETE SESSION ===
      .addCase(deleteLoadSession.fulfilled, (state) => {
        state.session_id = null;
        state.loads = [];
        state.count = 0;
        state.isDraft = false;
        state.status = undefined;
        state.room_type = undefined;
      })

      // === SAVE SESSION ===
      .addCase(saveLoadSession.fulfilled, (state, action) => {
        // Обновляем room_type напрямую, если он был изменен
        if (action.payload.data?.room_type !== undefined) {
          state.room_type = action.payload.data.room_type;
        }
      })

      // === LOGOUT ===
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearCurrentSession, setError } = loadSessionSlice.actions;
export default loadSessionSlice.reducer;

