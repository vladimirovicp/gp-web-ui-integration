# ADMX Template — документация

> Дата: 2026-05-05
> Файл: `chain/js/components/templates/admx-template.js`

---

## Содержание

1. [Общее описание](#1-общее-описание)
2. [Архитектура и потоки данных](#2-архитектура-и-потоки-данных)
3. [Зависимости](#3-зависимости)
4. [Публичный API](#4-публичный-api)
5. [Структура DOM-шаблона](#5-структура-dom-шаблона)
6. [Секции кода](#6-секции-кода)
   - 6.1 [Константы](#61-константы)
   - 6.2 [Утилиты общего назначения](#62-утилиты-общего-назначения)
   - 6.3 [Нормализация данных политики](#63-нормализация-данных-политики)
   - 6.4 [Загрузка и парсинг текущих значений](#64-загрузка-и-парсинг-текущих-значений)
   - 6.5 [Формирование значений для записи](#65-формирование-значений-для-записи)
   - 6.6 [Рендеринг контролов формы](#66-рендеринг-контролов-формы)
   - 6.7 [Управление состоянием формы](#67-управление-состоянием-формы)
   - 6.8 [Персистентность (localStorage)](#68-персистентность-localstorage)
   - 6.9 [Главная функция renderAdmxTemplate](#69-главная-функция-renderadmxtemplate)
7. [Жизненный цикл компонента](#7-жизненный-цикл-компонента)
8. [Формат обмена данными с сервером](#8-формат-обмена-данными-с-сервером)
   - 8.1 [Чтение: API.get_current_value()](#81-чтение-apiget_current_value)
   - 8.2 [Запись: API.set()](#82-запись-apiset)
9. [Формат хранения в localStorage](#9-формат-хранения-в-localstorage)
10. [Dirty-checking (механизм Apply/Cancel)](#10-dirty-checking-механизм-applycancel)
11. [Типы контролов и их поведение](#11-типы-контролов-и-их-поведение)
12. [Диаграмма состояний формы](#12-диаграмма-состояний-формы)

---

## 1. Общее описание

Модуль `admx-template.js` — это ядро работы с ADMX-шаблонами групповых политик в UI. Он отвечает за:

- **Рендеринг** формы ADMX-политики с радиокнопками состояния (Не сконфигурировано / Включено / Отключено) и контролами ввода (enum, boolean, decimal, text).
- **Загрузку** текущих значений с сервера через FreeIPA RPC-запрос `gpo.get_current_value`.
- **Парсинг** ответов сервера различных форматов (пустой объект, объект с `value_data`, строка `state;value`).
- **Сохранение** значений на сервер через RPC-запрос `gpo.set_policy` в формате `"state;value"`.
- **Персистентность** в `localStorage` для восстановления при пустых ответах сервера.
- **Dirty-checking** через механизм снапшотов для управления кнопками Apply/Cancel.
- **Жизненный цикл** — автоматическая очистка event listeners при переключении на другой элемент дерева.

---

## 2. Архитектура и потоки данных

```
┌─────────────────────────────────────────────────────────────────────┐
│                         app.js                                       │
│  renderSelectedItem() → item.template === 'admx'                    │
│       → renderAdmxTemplate({ isHelpOpen, header, item, admxTreePath})│
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    admx-template.js                                   │
│                                                                       │
│  ┌─────────────────────┐    ┌──────────────────────┐                 │
│  │ normalizePolicyEntries│   │  renderAdmxControlRow │                │
│  │  controlEntries      │──▶│  (enum/bool/dec/text) │                │
│  │  policyValueEntry    │   └──────────────────────┘                 │
│  └─────────┬───────────┘                                             │
│            │                                                          │
│            ▼                                                          │
│  ┌─────────────────────┐    ┌──────────────────────┐                 │
│  │ loadCurrentAdmxValues│──▶│ API.get_current_value │                 │
│  │  (async, при открытии)│   │  → parseAdmxCurrentValue              │
│  └─────────┬───────────┘   └──────────────────────┘                 │
│            │                                                          │
│            ▼                                                          │
│  ┌─────────────────────┐    ┌──────────────────────┐                 │
│  │ handleApply (async)  │──▶│ API.set               │                │
│  │  buildAdmxSetValue   │   │  value = "state;value"│                │
│  └─────────┬───────────┘   └──────────────────────┘                 │
│            │                                                          │
│            ▼                                                          │
│  ┌─────────────────────┐                                             │
│  │ upsertAdmxEntries   │ → localStorage (admx key)                  │
│  │  (персистентность)   │                                             │
│  └─────────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Внешние модули

| Модуль | Файл | Роль |
|--------|------|------|
| `element-creator` | `util/element-creator.js` | Создание DOM-элементов через `ElementCreator` |
| `admx` (localStorage) | `util/mainLocalStorage/admx.js` | Чтение/запись ADMX-записей в localStorage |
| `API` | `util/API.js` | RPC-запросы к FreeIPA (`get_current_value`, `set`) |
| `policy-ru.js` / `policy-en.js` | `tree-view/` | Определения политик (658 политик, метаданные контролов) |
| `policy-converter.js` | `tree-view/` | Конвертация сырых данных в tree nodes с `template: 'admx'` |

---

## 3. Зависимости

Модуль использует AMD-определение (`define`) и импортирует:

```javascript
define([
    '../../util/element-creator',         // createElement для DOM
    '../../util/mainLocalStorage/admx',   // getAdmxEntriesByPaths, upsertAdmxEntries
    '../../util/API'                      // API.get_current_value, API.set, API.waitForNameGpt
], function(__dep0, __dep1, API) { ... });
```

---

## 4. Публичный API

Модуль экспортирует единственную функцию:

```javascript
renderAdmxTemplate({ isHelpOpen, item, admxTreePath, header })
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `isHelpOpen` | `boolean` | Начальное состояние панели помощи (по умолчанию `false`) |
| `item` | `Object` | Выбранный элемент дерева. Содержит `policyData`, `policyKey`, `target`, `admxTreePath` |
| `admxTreePath` | `string\|null` | Путь в дереве ADMX-метаданных (например, `"Machine/categories/.../policies/KEY"`) |
| `header` | `Object\|null` | Компонент заголовка с кнопками Apply/Cancel |

**Возвращает**: `ElementCreator` с дополнительным методом `cleanup()`.

---

## 5. Структура DOM-шаблона

```
div.gp__admx-wrapper
├── div.gp__admx                              (основная панель политики)
│   ├── div.gp__admx-settings                 (заголовок + состояние)
│   │   ├── div.title                          "Политика: <displayName>"
│   │   ├── div.gp__admx-state-policy-title    "Состояние политики:"
│   │   ├── div.gp__admx-state-policy          (3 радиокнопки)
│   │   │   ├── label.gp__admx-radio            ○ Не сконфигурировано (value="not-configured")
│   │   │   ├── label.gp__admx-radio            ○ Включено (value="enabled")
│   │   │   └── label.gp__admx-radio            ○ Отключено (value="disabled")
│   │   │   data-policy-path="..."              (registry-путь policyValue)
│   │   │   data-enabled-value="1"              (значение при enabled)
│   │   │   data-disabled-value="0"             (значение при disabled)
│   │   └── div.field__line                    (горизонтальный разделитель)
│   └── div.gp__admx-info                     (таблица контролов)
│       ├── div.gp__admx-item                  (заголовок таблицы)
│       │   ├── div.gp__admx-description        "Описание"
│       │   └── div.gp__admx-options            "Опции"
│       ├── div.gp__admx-item                  (controlRow #1)
│       │   ├── div.gp__admx-description        label из metadata
│       │   └── div.gp__admx-options            <select>/<input> контрол
│       └── div.gp__admx-item                  (controlRow #N) ...
└── div.gp__admx-help                         (панель помощи, сворачиваемая)
    ├── div.gp__admx-supported                 "Поддерживается на: <supportedOn>"
    ├── div.gp__admx-comment                   textarea для комментария
    └── div.gp__admx-text-help                 "Помощь: <explainText>"
```

### Data-атрибуты контролов

Каждый `<input>` или `<select>` в `.gp__admx-options` имеет:

| Атрибут | Описание |
|---------|----------|
| `data-policy-path` | Registry-путь политики |
| `data-storage-path` | Путь хранения (для поиска DOM-элемента) |
| `data-policy-type` | Тип контрола (`enum`, `boolean`, `decimal`, `text`) |
| `name` | Идентификатор контрола (`metadata.id` или `metadata.valueName`) |
| `disabled` | Блокировка (зависит от состояния политики) |

---

## 6. Секции кода

### 6.1 Константы

```javascript
const ADMX_DEFAULT_STATE = 'not-configured';     // Состояние по умолчанию
const VALID_ADMX_STATES = new Set([               // Допустимые состояния
    'not-configured', 'enabled', 'disabled'
]);
```

### 6.2 Утилиты общего назначения

| Функция | Назначение |
|---------|------------|
| `addManagedEventListener(cleanups, target, event, handler)` | Регистрирует слушатель и сохраняет функцию удаления в массив `cleanups` |
| `formatExplainText(text)` | Разбивает текст на строки, вставляя `<br>` между ними |
| `extractStoragePathFromData(data)` | Извлекает путь из `Read_Path_GPT('...')` |
| `isPlainObject(value)` | Проверяет, что значение — простой объект (не null, не массив) |
| `normalizeAdmxState(state)` | Возвращает валидное состояние или `'not-configured'` |
| `getDefaultControlValue(metadata)` | Возвращает дефолтное значение по типу контрола |

### 6.3 Нормализация данных политики

#### `resolvePolicyPath({ entryKey, metadata, policyHeader })`

Разрешает итоговый registry-путь для записи. Если `entryKey` начинается с `\` (относительный путь), путь собирается из `policyHeader.key` + `metadata.valueName`.

```
entryKey='\1', headerKey='Software\ALT\Policies', valueName='MyValue'
→ 'Software\ALT\Policies\MyValue'
```

#### `normalizePolicyEntries(policyData, policyHeader)`

Разделяет сырые данные политики на два массива:

- **`controlEntries[]`** — контролы формы (enum, boolean, decimal, text). Каждый содержит:
  ```javascript
  { entryKey, metadata, policyPath, storagePath }
  ```
- **`policyValueEntry`** — единственная запись типа `policyValue` (определяет enabled/disabled значения).

### 6.4 Загрузка и парсинг текущих значений

#### `unwrapCurrentValue(rawValue)`

Рекурсивно разворачивает вложенные структуры ответа API:

```
{ result: { value_data: "enabled;1" } } → { value_data: "enabled;1" }
[ { result: "enabled;2" } ]              → "enabled;2"
{ value: "disabled;0" }                  → "disabled;0"
{}                                        → {}
```

Проверяет ключи по приоритету: `result` → `value` → `currentValue`.

#### `parseStringValueAsAdmxState(stringValue)`

Парсит строку формата `"state;value"`:

```
"enabled;1"       → { hasData: true,  state: "enabled",         value: "1" }
"disabled"        → { hasData: true,  state: "disabled",        value: "" }
null / ""         → { hasData: false, state: "not-configured",  value: null }
```

#### `parseAdmxCurrentValue(rawValue)` — главная функция парсинга

Обрабатывает все варианты ответа сервера:

| Формат ответа API | Результат |
|-------------------|-----------|
| `{}` (пустой объект) | `{ hasData: false, state: "not-configured", value: null }` |
| `{ value_data: "enabled;1", value_type: "REG_SZ" }` | `{ hasData: true, state: "enabled", value: "1" }` |
| `{ state: "enabled", value: "5" }` | `{ hasData: true, state: "enabled", value: "5" }` |
| `null` / `undefined` | `{ hasData: false, state: "not-configured", value: null }` |
| `"enabled;1"` (строка) | `{ hasData: true, state: "enabled", value: "1" }` |

**Порядок проверок:**
1. Пустой объект (`Object.keys().length === 0`) → нет данных
2. Объект с `value_data` → извлечь и распарсить как `"state;value"`
3. Объект с `state` → прямое чтение state/value
4. `null`/`undefined`/`''` → нет данных
5. Строка → парсинг через `parseStringValueAsAdmxState()`

### 6.5 Формирование значений для записи

#### `buildAdmxMetadataPath({ item, admxTreePath })`

Формирует metadata-путь для API:
```
"Machine/categories/Система ALT/inherited/LAPS/policies/ALT_LAPS:LAPS_PostAuthenticationActions"
```

#### `buildAdmxSetValue(state, fieldValue)`

Формирует строку для записи на сервер:
```
buildAdmxSetValue('enabled', 5)  → "enabled;5"
buildAdmxSetValue('disabled', '') → "disabled;"
```

### 6.6 Рендеринг контролов формы

| Функция | Тип | HTML-элемент | Метаданные |
|---------|-----|-------------|------------|
| `renderEnumControl` | enum | `<select>` + `<option>` | `items`, `defaultItem` |
| `renderBooleanControl` | boolean | `<input type="checkbox">` | `trueValue`, `falseValue` |
| `renderDecimalControl` | decimal | `<input type="number">` | `minValue`, `maxValue`, `defaultValue` |
| `renderTextControl` | text | `<input type="text">` | — |
| `renderUnsupportedControl` | list, unknown | `<div>` "В разработке" | — |

Все контролы проходят через `createCommonControlAttrs()` для единообразного набора data-атрибутов.

### 6.7 Управление состоянием формы

| Функция | Назначение |
|---------|------------|
| `getSelectedAdmxState(root)` | Читает текущее состояние из radio-кнопок |
| `setSelectedAdmxState(root, state)` | Устанавливает radio-кнопку |
| `syncControlsWithPolicyState(root)` | Блокирует/разблокирует контролы (активны только при "Включено") |
| `getControlElementByStoragePath(root, path)` | Находит DOM-элемент по `data-storage-path` |
| `readControlValue(el, metadata)` | Считывает значение с учётом типа (checked/value) |
| `applyControlValue(el, metadata, value)` | Устанавливает значение с учётом типа |
| `buildAdmxFormSnapshot({ root, controls })` | Создаёт снапшот текущего состояния формы |
| `applyAdmxFormSnapshot({ root, snapshot, controls })` | Восстанавливает форму из снапшота (Cancel) |

### 6.8 Персистентность (localStorage)

Механизм localStorage обеспечивает сохранность данных между перезагрузками страницы, когда сервер возвращает пустой результат.

| Функция | Назначение |
|---------|------------|
| `resolveStoredState({ entries, pvEntry, controls })` | Находит первое непустое состояние из localStorage |
| `restorePersistedAdmxValues(...)` | Восстанавливает форму из localStorage |
| `hasPersistedAdmxData(...)` | Проверяет наличие сохранённых данных |
| `resolvePolicyValueForState(pvEntry, state)` | Возвращает enabledValue/disabledValue для policyValue |
| `buildPersistedAdmxEntries(...)` | Формирует массив записей для localStorage из текущей формы |

### 6.9 Главная функция renderAdmxTemplate

Полный алгоритм при открытии ADMX-политики:

```
1. Подготовка параметров
   ├── effectiveAdmxTreePath, effectiveTarget, metadataPath
   └── btnApply, btnCancel из header

2. Нормализация данных
   ├── normalizePolicyEntries() → controlEntries[], policyValueEntry
   ├── getAdmxEntriesByPaths() → persistedEntries (из localStorage)
   └── hasPersistedAdmxData() → hasPersistedEntries

3. Рендеринг DOM
   ├── Радиокнопки состояния (not-configured / enabled / disabled)
   ├── Контролы (controlRows) — все disabled
   └── Панель помощи (supportedOn, comment, explainText)

4. Инициализация состояния
   ├── initialFormSnapshot = null  (кнопки скрыты)
   ├── isLoading = true
   └── isSaving = false

5. Регистрация обработчиков
   ├── statePolicyElement  → 'change'  → handleStatePolicyChange
   ├── admxTemplateElement → 'change'  → handleControlsChange
   ├── admxTemplateElement → 'input'   → handleControlsChange
   ├── btnCancel           → 'click'   → handleCancel
   └── btnApply            → 'click'   → handleApply

6. Запуск loadCurrentAdmxValues() (async)
   └── (см. раздел 7)

7. Возвращаем ElementCreator с cleanup()
```

---

## 7. Жизненный цикл компонента

```
                  ┌──────────────┐
                  │  Создание    │
                  │  renderAdmx  │
                  │  Template()  │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
         ┌───────│  isLoading   │───────┐
         │       │  = true      │       │
         │       └──────┬───────┘       │
         │              │               │
         │              ▼               │
         │    ┌─────────────────┐       │
         │    │ loadCurrent     │       │   Кнопки Apply/Cancel
         │    │ AdmxValues()    │       │   НЕ АКТИВНЫ
         │    │ (загрузка с     │       │   (initialFormSnapshot = null)
         │    │  сервера)       │       │
         │    └────────┬────────┘       │
         │             │                │
         │     ┌───────┴───────┐        │
         │     ▼               ▼        │
         │  ┌────────┐   ┌──────────┐   │
         │  │Есть    │   │Нет данных│   │
         │  │данные  │   │с сервера │   │
         │  └───┬────┘   └────┬─────┘   │
         │      │              │         │
         │      ▼              ▼         │
         │  Установить    Есть в localSt?│
         │  state+values  ├── Да → restore
         │  из ответа     └── Нет → defaults
         │             │                │
         │             ▼                │
         │    ┌─────────────────┐       │
         └───▶│ isLoading=false │───────┘
              │ initialSnapshot │
              │ = snapshot      │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ ГОТОВ К РАБОТЕ  │
              │                 │
              │ Пользователь    │
              │ меняет значения │
              │       │         │
              │       ▼         │
              │ dirty-check:    │
              │ snapshot !==    │
              │ initial         │
              │       │         │
              │       ▼         │
              │ Apply/Cancel    │
              │ АКТИВНЫ         │
              └────────┬────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
     ┌────────────┐        ┌────────────┐
     │  Cancel    │        │   Apply    │
     │  restore   │        │ API.set()  │
     │  snapshot  │        │ localStorage│
     │  кнопки    │        │ обновить    │
     │  скрыты    │        │ initialSnap │
     └────────────┘        └────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    cleanup()    │
              │ (при переходе   │
              │  на другой item)│
              │ removeAllListeners│
              │ кнопки скрыты   │
              └─────────────────┘
```

---

## 8. Формат обмена данными с сервером

### 8.1 Чтение: API.get_current_value()

**Вызов:**
```javascript
API.get_current_value(nameGpt, target, path)
```

**Параметры:**
- `nameGpt` — файловый путь GPO (например, `\\example.test\SysVol\...\Policies\{GUID}`)
- `target` — `'Machine'` или `'User'`
- `path` — registry-путь политики (например, `Software\BaseALT\Policies\Laps\PostAuthenticationActions`)

**Внутренняя реализация** (API.js):
```javascript
rpc.command({
    entity: 'gpo',
    method: 'get_current_value',
    args: [nameGpt, target, path],
    on_success: (data) => {
        var result = (data.result && data.result.result) || null;
        resolve(result);
    }
});
```

**Возможные варианты ответа:**

#### Вариант 1: Нет данных (политика не назначена)
```json
{}
```
→ `parseAdmxCurrentValue` вернёт `{ hasData: false }` → дефолтные значения

#### Вариант 2: Есть данные — основной формат
```json
{
    "value_data": "enabled;1",
    "value_type": "REG_SZ"
}
```
→ `value_data` парсится: `"enabled"` → состояние, `"1"` → значение

#### Вариант 3: Есть данные — только состояние
```json
{
    "value_data": "disabled",
    "value_type": "REG_DWORD"
}
```
→ состояние `"disabled"`, значение `""`

### 8.2 Запись: API.set()

**Вызов:**
```javascript
API.set(nameGpt, target, path, value, metadata)
```

**Параметры:**
```json
{
    "nameGpt": "\\\\example.test\\SysVol\\example.test\\Policies\\{16D7EE44-...}",
    "target": "Machine",
    "path": "Software\\BaseALT\\Policies\\Laps\\PostAuthenticationActions",
    "value": "enabled;1",
    "metadata": "Machine/categories/Система ALT/inherited/LAPS/policies/ALT_LAPS:LAPS_PostAuthenticationActions"
}
```

Формат `value`: `"состояние;значение_поля"`

| Пример value | Состояние | Значение поля |
|-------------|-----------|---------------|
| `"enabled;1"` | Включено | `1` |
| `"enabled;50"` | Включено | `50` |
| `"disabled;"` | Отключено | (пусто) |
| `"not-configured;"` | Не сконфигурировано | (пусто) |

---

## 9. Формат хранения в localStorage

Ключ: `'admx'`

Значение — плоский объект, где ключ — registry-путь политики:

```json
{
    "Software\\BaseALT\\Policies\\Laps\\PostAuthenticationActions": {
        "path": "Software\\BaseALT\\Policies\\Laps\\PostAuthenticationActions",
        "state": "enabled",
        "type": "enum",
        "value": "1",
        "policyKey": "LAPS_PostAuthenticationActions",
        "policyTitle": "Действия после аутентификации LAPS",
        "admxTreePath": "Machine/categories/Система ALT/inherited/LAPS/policies/ALT_LAPS",
        "updatedAt": "2026-05-05T10:30:00.000Z"
    },
    "Software\\BaseALT\\Policies\\Laps\\PostAuthenticationResetDelay": {
        "path": "Software\\BaseALT\\Policies\\Laps\\PostAuthenticationResetDelay",
        "state": "enabled",
        "type": "decimal",
        "value": 50,
        "policyKey": "LAPS_PostAuthenticationResetDelay",
        "policyTitle": "Задержка сброса после аутентификации LAPS",
        "admxTreePath": "Machine/categories/Система ALT/inherited/LAPS/policies/ALT_LAPS",
        "updatedAt": "2026-05-05T10:30:00.000Z"
    }
}
```

**Схема записи:**

| Поле | Тип | Описание |
|------|-----|----------|
| `path` | `string` | Registry-путь (ключ объекта) |
| `state` | `string` | `'not-configured'` / `'enabled'` / `'disabled'` |
| `type` | `string` | `'enum'` / `'boolean'` / `'decimal'` / `'text'` / `'policyValue'` |
| `value` | `*` | Текущее значение контрола |
| `policyKey` | `string\|null` | Ключ политики |
| `policyTitle` | `string\|null` | Отображаемое название |
| `admxTreePath` | `string\|null` | Путь в дереве метаданных |
| `updatedAt` | `string` | ISO-дата последнего обновления |

Модуль `admx.js` валидирует схему при каждом чтении/записи через `validateAdmxEntry()`.

---

## 10. Dirty-checking (механизм Apply/Cancel)

Механизм определяет, были ли изменения в форме с момента последнего сохранения/загрузки.

### Как работает

1. **Базовый снапшот** (`initialFormSnapshot`) создаётся после завершения `loadCurrentAdmxValues()` или `handleApply()`.

2. **Текущий снапшот** строится при каждом изменении формы (change/input events).

3. **Сравнение**: `JSON.stringify(current) !== JSON.stringify(initial)`.

4. **Результат**: если отличаются → кнопки Apply/Cancel получают CSS-класс `active`.

### Структура снапшота

```javascript
{
    state: "enabled",                    // состояние radio-кнопок
    controls: [
        { path: "Software\\...\\Actions", type: "enum",    value: "1"  },
        { path: "Software\\...\\Delay",   type: "decimal", value: 50   }
    ]
}
```

### Когда кнопки НЕ активны

- `isLoading === true` (идёт загрузка с сервера)
- `isSaving === true` (идёт сохранение)
- `initialFormSnapshot === null` (загрузка ещё не завершена)
- Текущий снапшот совпадает с базовым

---

## 11. Типы контролов и их поведение

### enum

- **HTML**: `<select>` с `<option>` элементами
- **metadata**: `{ items: { "0": "Нет действий", "1": "Сброс пароля" }, defaultItem: 0 }`
- **Чтение**: `controlElement.value` → строка
- **Запись**: `controlElement.value = "1"`

### boolean

- **HTML**: `<input type="checkbox">`
- **metadata**: `{ trueValue: 1, falseValue: 0 }`
- **Чтение**: `checked ? trueValue : falseValue`
- **Запись**: `checked = (value === true || String(value) === String(trueValue))`

### decimal

- **HTML**: `<input type="number">` с `min`/`max`
- **metadata**: `{ minValue: 0, maxValue: 24, defaultValue: 0 }`
- **Чтение**: `Number(controlElement.value)`, `null` при пустом
- **Запись**: `controlElement.value = value ?? ''`

### text

- **HTML**: `<input type="text">`
- **metadata**: `{ defaultValue: "" }`
- **Чтение**: `controlElement.value` → строка
- **Запись**: `controlElement.value = value ?? ''`

### list (не поддерживается)

- Отображается заглушка "В разработке"

---

## 12. Диаграмма состояний формы

### Состояние политики → доступность контролов

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Не сконфигурировано│    │    Включено      │     │   Отключено      │
│ (not-configured)  │    │   (enabled)      │     │  (disabled)      │
│                   │    │                  │     │                  │
│  контролы:        │    │  контролы:       │     │  контролы:       │
│  ██ DISABLED ██   │    │  ▓▓ ENABLED ▓▓   │     │  ██ DISABLED ██  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Алгоритм выбора источника данных при загрузке

```
loadCurrentAdmxValues()
        │
        ▼
  API.get_current_value() для каждого controlEntry
        │
        ▼
  parseAdmxCurrentValue() для каждого ответа
        │
        ├── Все hasData === false ?
        │       │
        │       ├── Есть в localStorage ?
        │       │       │
        │       │       ├── ДА → restorePersistedState()
        │       │       │         (восстановление из localStorage)
        │       │       │
        │       │       └── НЕТ → applyDefaultValuesToAdmxForm()
        │       │                 (state=not-configured, дефолтные значения)
        │       │
        └── Есть хотя бы один hasData === true
                │
                ├── state из первого ответа с данными
                │
                ├── Для каждого контрола:
                │   ├── hasData → применить значение из ответа
                │   └── !hasData → применить дефолтное значение
                │
                └── syncControlsWithPolicyState()
```
