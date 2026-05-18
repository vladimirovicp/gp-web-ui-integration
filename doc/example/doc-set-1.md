# Пример работы API.js (на примере footer.js)

## Обзор

Файл `footer.js` использует два метода API: `get_current_value` и `set`.
Ниже описаны их входные и выходные данные.

---

## API.get_current_value(nameGpt, target, path)

### Назначение

Получает текущее значение политики с сервера FreeIPA.

### Входные данные (из footer.js)

| Параметр | Значение (в коде JS) | Значение (в рантайме) | Тип | Описание |
|----------|----------------------|-----------------------|-----|----------|
| `nameGpt` | `'\\\\example.test\\SysVol\\example.test\\Policies\\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}'` | `\example.test\SysVol\example.test\Policies\{...}` | `string` | Файловый путь GPO |
| `target` | `'Machine'` | `Machine` | `string` | Область применения политики (`Machine` / `User`) |
| `path` | `'Software\\\\BaseALT\\\\Policies\\\\Laps\\\\PostAuthenticationResetDelay'` | `Software\BaseALT\Policies\Laps\PostAuthenticationResetDelay` | `string` | Путь к политике в реестре |

### ⚠️ Проблема экранирования обратных слешей

В `footer.js` константы объявлены с **недостаточным** экранированием:

```js
// ❌ НЕПРАВИЛЬНО — обратные слеши "съедаются" парсером JS
const NAME_GPT = '\\example.test\SysVol\example.test\Policies\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}';
const PATH = 'Software\\BaseALT\\Policies\\Laps\\PostAuthenticationResetDelay';
```

**Почему так происходит?**

В JavaScript строка `'\\'` — это экранированный слеш, который даёт один символ `\`.
А `\S`, `\V`, `\P`, `\{` — это **неспециализированные escape-последовательности**.
В обычном (неstrict) режиме JS просто отбрасывает обратный слеш и оставляет букву:
- `\S` → `S`
- `\V` → `V`
- `\P` → `P`
- `\{` → `{`

В результате в рантайме строка теряет все разделительные обратные слеши:

```
\\example.test\SysVol\example.test\Policies\{…}
↓
\example.testSysVol.example.testPolicies{…}
```

**Как исправить:**

Каждый обратный слеш в исходном Windows-пути нужно дублировать:

```js
// ✅ ПРАВИЛЬНО — каждый \ заменяем на \\
const NAME_GPT = '\\\\example.test\\SysVol\\example.test\\Policies\\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}';
const PATH = 'Software\\\\BaseALT\\\\Policies\\\\Laps\\\\PostAuthenticationResetDelay';
```

Либо использовать `String.raw`:

```js
const NAME_GPT = String.raw`\\example.test\SysVol\example.test\Policies\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}`;
const PATH = String.raw`Software\BaseALT\Policies\Laps\PostAuthenticationResetDelay`;
```

### RPC-запрос

```js
rpc.command({
    entity: 'gpo',
    method: 'get_current_value',
    args: [nameGpt, target, path],
    options: { version: IPA.api_version }
}).execute();
```

### Выходные данные

- **Успех:** `Promise` резолвится с текущим значением политики (тип зависит от политики) или `null`, если значение не найдено.
- **Ошибка:** `Promise` реджектится с `Error('Failed to get current value')`.

```js
// Пример успешного ответа:
"enabled;test-9"

// Пример ответа при отсутствии значения:
null
```

---

## API.set(nameGpt, target, path, value)

### Назначение

Устанавливает значение политики на сервере FreeIPA.

### Входные данные (из footer.js)

| Параметр | Значение (в коде JS) | Значение (в рантайме) | Тип | Описание |
|----------|----------------------|-----------------------|-----|----------|
| `nameGpt` | `'\\\\example.test\\SysVol\\example.test\\Policies\\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}'` | `\example.test\SysVol\example.test\Policies\{...}` | `string` | Файловый путь GPO |
| `target` | `'Machine'` | `Machine` | `string` | Область применения политики (`Machine` / `User`) |
| `path` | `'Software\\\\BaseALT\\\\Policies\\\\Laps\\\\PostAuthenticationResetDelay'` | `Software\BaseALT\Policies\Laps\PostAuthenticationResetDelay` | `string` | Путь к политике в реестре |
| `value` | `'test-9'` | `test-9` | `string` | Новое значение политики |

### RPC-запрос

```js
rpc.command({
    entity: 'gpo',
    method: 'set_policy',
    args: [nameGpt, target, path, value],
    options: { version: IPA.api_version }
}).execute();
```

### Выходные данные

- **Успех:** `Promise` резолвится с результатом от сервера.
  - Если `data.result.result` существует — возвращается он напрямую.
  - Иначе возвращается объект `{ success: true, data: rpcResult, raw: data }`.
- **Ошибка:** `Promise` реджектится с `Error('Failed to set policy')`.

```js
// Пример успешного ответа с data.result.result:
{
    "some": "response data"
}

// Пример успешного ответа без data.result.result:
{
    success: true,
    data: { /* rpcResult */ },
    raw: { /* полный ответ */ }
}
```
