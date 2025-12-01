/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsCartBadgeDTO {
  load_session_id?: number;
  loads_count?: number;
}

export interface DsLoadCreateRequest {
  load_category: string;
  load_description: string;
  load_title: string;
  normative: number;
  reliability_coefficient: number;
}

export interface DsLoadDTO {
  id?: number;
  load_category?: string;
  load_description?: string;
  load_image?: string;
  load_title?: string;
  normative?: number;
  reliability_coefficient?: number;
  status?: boolean;
}

export interface DsLoadInSessionDTO {
  area?: number;
  load_category?: string;
  load_id?: number;
  load_image?: string;
  load_title?: string;
  normative?: number;
}

export interface DsLoadSessionDTO {
  created_at?: string;
  creator_id?: number;
  id?: number;
  loads?: DsLoadInSessionDTO[];
  moderator_id?: number;
  room_type?: string;
  status?: number;
  total_load?: number;
}

export interface DsLoadSessionResolveRequest {
  action: string;
}

export interface DsLoadSessionUpdateRequest {
  room_type?: string;
}

export interface DsLoadToCalculationUpdateRequest {
  area?: number;
}

export interface DsLoadUpdateRequest {
  load_category?: string;
  load_description?: string;
  load_title?: string;
  normative?: number;
  reliability_coefficient?: number;
}

export interface DsLoginResponse {
  token?: string;
  user?: DsUserDTO;
}

export interface DsPaginatedResponse {
  items?: any;
  total?: number;
}

export interface DsSuccessResponse {
  message?: string;
}

export interface DsUserDTO {
  full_name?: string;
  id?: number;
  moderator?: boolean;
  username?: string;
}

export interface DsUserLoginRequest {
  password: string;
  username: string;
}

export interface DsUserRegisterRequest {
  full_name: string;
  password: string;
  username: string;
}

export interface DsUserUpdateRequest {
  full_name?: string;
  password?: string;
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API для системы расчета нагрузок
 * @version 1.0
 * @contact API Support <support@example.com>
 *
 * API-сервер для управления нагрузками и сессиями расчета в системе.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Получение JWT токена по логину и паролю для доступа к защищенным эндпоинтам.
     *
     * @tags auth
     * @name LoginCreate
     * @summary Аутентификация пользователя (все)
     * @request POST:/auth/login
     * @response `200` `DsLoginResponse` OK
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Неверные учетные данные
     */
    loginCreate: (
      credentials: DsUserLoginRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsLoginResponse, Record<string, string>>({
        path: `/auth/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет текущий JWT токен в черный список, делая его недействительным. Требует авторизации.
     *
     * @tags auth
     * @name LogoutCreate
     * @summary Выход из системы (авторизованный пользователь)
     * @request POST:/auth/logout
     * @secure
     * @response `200` `Record<string,string>` Сообщение об успехе
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/auth/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  loadSessions = {
    /**
     * @description Возвращает отфильтрованный список всех сформированных сессий (кроме черновиков и удаленных). Пользователи видят только свои сессии, модераторы - все.
     *
     * @tags load-sessions
     * @name LoadSessionsList
     * @summary Получить список сессий загрузок (авторизованный пользователь)
     * @request GET:/load-sessions
     * @secure
     * @response `200` `DsPaginatedResponse` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    loadSessionsList: (
      query?: {
        /** Фильтр по статусу (draft, formed, completed, rejected) */
        status?: string;
        /** Фильтр по дате 'от' (формат YYYY-MM-DD) */
        from?: string;
        /** Фильтр по дате 'до' (формат YYYY-MM-DD) */
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsPaginatedResponse, Record<string, string>>({
        path: `/load-sessions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает ID черновика текущего пользователя и количество нагрузок в нем.
     *
     * @tags load-sessions
     * @name CartList
     * @summary Получить информацию для иконки корзины (авторизованный пользователь)
     * @request GET:/load-sessions/cart
     * @secure
     * @response `200` `DsCartBadgeDTO` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    cartList: (params: RequestParams = {}) =>
      this.request<DsCartBadgeDTO, Record<string, string>>({
        path: `/load-sessions/cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет нагрузку в черновик сессии текущего пользователя. Если черновика нет, создает новый.
     *
     * @tags load-sessions
     * @name DraftLoadsCreate
     * @summary Добавить нагрузку в черновик (авторизованный пользователь)
     * @request POST:/load-sessions/draft/loads/{load_id}
     * @secure
     * @response `201` `DsSuccessResponse` Created
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    draftLoadsCreate: (loadId: number, params: RequestParams = {}) =>
      this.request<DsSuccessResponse, Record<string, string>>({
        path: `/load-sessions/draft/loads/${loadId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о сессии, включая привязанные нагрузки.
     *
     * @tags load-sessions
     * @name LoadSessionsDetail
     * @summary Получить сессию по ID (авторизованный пользователь)
     * @request GET:/load-sessions/{id}
     * @secure
     * @response `200` `DsLoadSessionDTO` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `404` `Record<string,string>` Сессия не найдена
     */
    loadSessionsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsLoadSessionDTO, Record<string, string>>({
        path: `/load-sessions/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет поля сессии, доступные пользователю (например, тип помещения).
     *
     * @tags load-sessions
     * @name LoadSessionsUpdate
     * @summary Обновить сессию (авторизованный пользователь)
     * @request PUT:/load-sessions/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    loadSessionsUpdate: (
      id: number,
      updateData: DsLoadSessionUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/load-sessions/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Логически удаляет сессию (переводит в статус deleted).
     *
     * @tags load-sessions
     * @name LoadSessionsDelete
     * @summary Удалить сессию (авторизованный пользователь)
     * @request DELETE:/load-sessions/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    loadSessionsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/load-sessions/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Переводит черновик сессии в статус "сформирована". Требует авторизации.
     *
     * @tags load-sessions
     * @name FormUpdate
     * @summary Сформировать сессию загрузок (авторизованный пользователь)
     * @request PUT:/load-sessions/{id}/form
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    formUpdate: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/load-sessions/${id}/form`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description Обновляет параметры нагрузки в сессии (например, площадь).
     *
     * @tags load-sessions
     * @name LoadsUpdate
     * @summary Обновить параметры нагрузки в сессии (авторизованный пользователь)
     * @request PUT:/load-sessions/{id}/loads/{load_id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    loadsUpdate: (
      id: number,
      loadId: number,
      updateData: DsLoadToCalculationUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/load-sessions/${id}/loads/${loadId}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаляет нагрузку из сессии загрузок.
     *
     * @tags load-sessions
     * @name LoadsDelete
     * @summary Удалить нагрузку из сессии (авторизованный пользователь)
     * @request DELETE:/load-sessions/{id}/loads/{load_id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    loadsDelete: (id: number, loadId: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/load-sessions/${id}/loads/${loadId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Обрабатывает сессию модератором: завершает или отклоняет. Требует прав модератора.
     *
     * @tags load-sessions
     * @name ResolveUpdate
     * @summary Завершить или отклонить сессию (модератор)
     * @request PUT:/load-sessions/{id}/resolve
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Требуются права модератора
     */
    resolveUpdate: (
      id: number,
      action: DsLoadSessionResolveRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/load-sessions/${id}/resolve`,
        method: "PUT",
        body: action,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  loads = {
    /**
     * @description Возвращает отфильтрованный список всех нагрузок. Доступно всем.
     *
     * @tags loads
     * @name LoadsList
     * @summary Получить список нагрузок (все)
     * @request GET:/loads
     * @response `200` `DsPaginatedResponse` OK
     */
    loadsList: (
      query?: {
        /** Поиск по названию */
        search?: string;
        /** Фильтр по категории */
        category?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsPaginatedResponse, any>({
        path: `/loads`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает новую нагрузку в системе. Требует прав модератора.
     *
     * @tags loads
     * @name LoadsCreate
     * @summary Создать новую нагрузку (модератор)
     * @request POST:/loads
     * @secure
     * @response `201` `DsLoadDTO` Created
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Требуются права модератора
     */
    loadsCreate: (load: DsLoadCreateRequest, params: RequestParams = {}) =>
      this.request<DsLoadDTO, Record<string, string>>({
        path: `/loads`,
        method: "POST",
        body: load,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию о нагрузке по её ID. Доступно всем.
     *
     * @tags loads
     * @name LoadsDetail
     * @summary Получить нагрузку по ID (все)
     * @request GET:/loads/{id}
     * @response `200` `DsLoadDTO` OK
     * @response `404` `Record<string,string>` Нагрузка не найдена
     */
    loadsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsLoadDTO, Record<string, string>>({
        path: `/loads/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные нагрузки. Требует прав модератора.
     *
     * @tags loads
     * @name LoadsUpdate
     * @summary Обновить нагрузку (модератор)
     * @request PUT:/loads/{id}
     * @secure
     * @response `200` `DsLoadDTO` OK
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Требуются права модератора
     */
    loadsUpdate: (
      id: number,
      load: DsLoadUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsLoadDTO, Record<string, string>>({
        path: `/loads/${id}`,
        method: "PUT",
        body: load,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет нагрузку из системы. Требует прав модератора.
     *
     * @tags loads
     * @name LoadsDelete
     * @summary Удалить нагрузку (модератор)
     * @request DELETE:/loads/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Требуются права модератора
     */
    loadsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/loads/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Загружает изображение для нагрузки. Требует прав модератора.
     *
     * @tags loads
     * @name ImageCreate
     * @summary Загрузить изображение для нагрузки (модератор)
     * @request POST:/loads/{id}/image
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Требуются права модератора
     */
    imageCreate: (
      id: number,
      data: {
        /** Изображение */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/loads/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Создает нового пользователя в системе. По умолчанию роль "пользователь", не "модератор".
     *
     * @tags auth
     * @name UsersCreate
     * @summary Регистрация нового пользователя (все)
     * @request POST:/users
     * @response `201` `DsUserDTO` Created
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `500` `Record<string,string>` Внутренняя ошибка сервера
     */
    usersCreate: (
      credentials: DsUserRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsUserDTO, Record<string, string>>({
        path: `/users`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает публичные данные пользователя. Требует авторизации.
     *
     * @tags users
     * @name UsersDetail
     * @summary Получение данных пользователя по ID (авторизованный пользователь)
     * @request GET:/users/{id}
     * @secure
     * @response `200` `DsUserDTO` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `404` `Record<string,string>` Пользователь не найден
     */
    usersDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsUserDTO, Record<string, string>>({
        path: `/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет имя пользователя или пароль. Требует авторизации.
     *
     * @tags users
     * @name UsersUpdate
     * @summary Обновление данных пользователя (авторизованный пользователь)
     * @request PUT:/users/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `500` `Record<string,string>` Внутренняя ошибка сервера
     */
    usersUpdate: (
      id: number,
      updateData: DsUserUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/users/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
