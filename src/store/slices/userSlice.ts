import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

// Тип состояния пользователя
interface UserState {
  user: {
    id?: number;
    username?: string;
    full_name?: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  registerSuccess: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  registerSuccess: false,
  loading: false,
  error: null,
};

// НЕ восстанавливаем состояние из localStorage при перезагрузке
// Пользователь должен заново авторизоваться после перезагрузки страницы

// --- 1. ВХОД (Login) ---
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.auth.loginCreate(credentials);
      const data = response.data;

      if (data.token) localStorage.setItem('authToken', data.token);
      if (data.user) localStorage.setItem('userInfo', JSON.stringify(data.user));

      return data;
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Ошибка авторизации';
      
      if (err.response) {
        // Сервер ответил с ошибкой
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 403) {
          errorMessage = 'Доступ запрещен. Проверьте правильность данных.';
        } else if (status === 401) {
          errorMessage = 'Неверный логин или пароль';
        } else if (data?.description) {
          errorMessage = data.description;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (err.request) {
        // Запрос был отправлен, но ответа не получено
        errorMessage = 'Сервер не отвечает. Проверьте, запущен ли бэкенд.';
      } else {
        errorMessage = err.message || 'Ошибка авторизации';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// --- 2. РЕГИСТРАЦИЯ (Register) ---
export const registerUser = createAsyncThunk(
  'user/register',
  async (credentials: { full_name: string; username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.users.usersCreate(credentials);
      return response.data;
    } catch (err: any) {
      console.error('Register error:', err);
      let errorMessage = 'Ошибка регистрации';
      
      if (err.response) {
        // Сервер ответил с ошибкой
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 403) {
          errorMessage = 'Доступ запрещен. Возможно, пользователь с таким логином уже существует.';
        } else if (status === 400) {
          errorMessage = 'Некорректные данные. Проверьте правильность заполнения полей.';
        } else if (data?.description) {
          errorMessage = data.description;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data && typeof data === 'object') {
          // Если есть несколько ошибок валидации
          const errors = Object.values(data).flat();
          errorMessage = errors.length > 0 ? errors.join(', ') : 'Ошибка регистрации';
        }
      } else if (err.request) {
        // Запрос был отправлен, но ответа не получено
        errorMessage = 'Сервер не отвечает. Проверьте, запущен ли бэкенд.';
      } else {
        errorMessage = err.message || 'Ошибка регистрации';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// --- 3. ВЫХОД (Logout) ---
export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    try {
      await api.auth.logoutCreate();
    } catch (err) {
      console.warn('Logout failed on backend, clearing local anyway');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    }
  }
);

// --- 4. ПОЛУЧЕНИЕ ПРОФИЛЯ ---
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.users.usersDetail(id);
      const data = response.data;
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.description || err.message || 'Не удалось загрузить профиль');
    }
  }
);

// --- 5. ОБНОВЛЕНИЕ ПРОФИЛЯ ---
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ id, data }: { id: number; data: { full_name?: string; username?: string; password?: string } }, { rejectWithValue }) => {
    try {
      await api.users.usersUpdate(id, data);
      return { id, ...data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.description || err.message || 'Ошибка обновления');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRegisterSuccess: (state) => {
      state.registerSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // === LOGIN ===
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // === REGISTER ===
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // === LOGOUT ===
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // === FETCH PROFILE ===
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // === UPDATE PROFILE ===
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          if (action.payload.full_name) state.user.full_name = action.payload.full_name;
          if (action.payload.username) state.user.username = action.payload.username;
        }
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      });
  },
});

export const { clearError, resetRegisterSuccess } = userSlice.actions;
export default userSlice.reducer;

