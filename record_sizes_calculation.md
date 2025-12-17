# Расчет размеров записей в таблицах системы загрузок

## Таблица 1: request_load_calculations (заявки на расчет нагрузок)

Поля записи:
- `id` (идентификатор заявки) - 8 байт
- `user_id` (идентификатор пользователя-создателя) - 8 байт
- `assigned_user_id` (идентификатор назначенного пользователя) - 8 байт
- `created_at` (дата создания) - 8 байт
- `updated_at` (дата обновления) - 8 байт
- `completed_at` (дата завершения) - 8 байт
- `request_title` (название заявки) - 100 байт
- `status` (статус заявки) - 20 байт

**Формула 5: Размер записи в таблице request_load_calculations**

```
Размер_записи = id + user_id + assigned_user_id + created_at + updated_at + completed_at + request_title + status
Размер_записи = 8 + 8 + 8 + 8 + 8 + 8 + 100 + 20 = 168 байт
```

## Таблица 2: load_calculations (расчеты нагрузок)

Поля записи:
- `id` (идентификатор расчета) - 8 байт
- `request_id` (идентификатор заявки) - 8 байт
- `load_id` (идентификатор нагрузки) - 8 байт
- `normative_value` (нормативное значение нагрузки, кН/м²) - 16 байт (DECIMAL)
- `reliability_coefficient` (коэффициент надежности) - 16 байт (DECIMAL)

**Формула 6: Размер записи в таблице load_calculations**

```
Размер_записи = id + request_id + load_id + normative_value + reliability_coefficient
Размер_записи = 8 + 8 + 8 + 16 + 16 = 56 байт
```

## Итоговые размеры записей

- **request_load_calculations**: 168 байт на запись
- **load_calculations**: 56 байт на запись

