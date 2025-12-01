# Где используется Axios в коде

## Цепочка вызовов:

```
api.loadSessions.cartList()
  ↓
this.request() (в классе Api)
  ↓
this.instance.request() (строка 276 в Api.ts)
  ↓
this.instance = axios.create() (строка 177 в Api.ts)
  ↓
axios - библиотека для HTTP запросов
```

## Конкретные места в коде:

### 1. Импорт axios (Api.ts, строка 122):
```typescript
import axios from "axios";
```

### 2. Создание Axios instance (Api.ts, строки 164-184):
```typescript
export class HttpClient {
  public instance: AxiosInstance;  // ← это axios instance
  
  constructor({ ...axiosConfig }: ApiConfig = {}) {
    this.instance = axios.create({  // ← создаем axios instance
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
  }
}
```

### 3. Использование axios для запросов (Api.ts, строка 276):
```typescript
public request = async ({ ... }: FullRequestParams) => {
  // ... подготовка параметров ...
  
  return this.instance.request({  // ← это axios.request()
    ...requestParams,
    headers: { ... },
    params: query,
    data: body,
    url: path,
  });
};
```

### 4. Метод cartList использует request (Api.ts, строки 387-394):
```typescript
cartList: (params: RequestParams = {}) =>
  this.request<DsCartBadgeDTO, Record<string, string>>({  // ← вызывает this.request()
    path: `/load-sessions/cart`,
    method: "GET",
    secure: true,
    format: "json",
    ...params,
  }),
```

### 5. Настройка interceptors (index.ts, строки 8-22):
```typescript
// api.instance - это AxiosInstance (axios)
api.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Итого:

Когда вы пишете:
```typescript
const response = await api.loadSessions.cartList();
```

Под капотом происходит:
1. `api.loadSessions.cartList()` вызывает `this.request()`
2. `this.request()` вызывает `this.instance.request()` 
3. `this.instance` - это `axios.create()` (экземпляр axios)
4. Axios делает реальный HTTP запрос к серверу
5. Interceptor автоматически добавляет токен в заголовок

**Axios используется внутри сгенерированного класса Api!**

