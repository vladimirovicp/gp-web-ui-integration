/**
 * admx-template.js — модуль рендеринга и управления ADMX-шаблоном групповой политики.
 *
 * Отвечает за:
 *   - Построение DOM-формы ADMX-политики (радиокнопки состояния, контролы enum/boolean/decimal/text).
 *   - Загрузку текущих значений политики с сервера через API.get_current_value().
 *   - Парсинг ответов сервера (unwrap вложенных объектов, формат "state;value", поле value_data).
 *   - Сохранение значений на сервер через API.set() в формате "state;value".
 *   - Персистентность в localStorage через модуль admx.js (на случай пустого ответа сервера).
 *   - Dirty-checking (сравнение снапшотов формы) для активации кнопок Apply/Cancel.
 *   - Управление жизненным циклом (cleanup всех event listeners).
 *
 * Зависимости:
 *   - element-creator  — утилита для создания DOM-элементов (ElementCreator).
 *   - admx (localStorage) — хранение ADMX-записей между перезагрузками.
 *   - API — взаимодействие с сервером FreeIPA (RPC-запросы).
 *
 * Публичный API:
 *   - renderAdmxTemplate({ isHelpOpen, item, admxTreePath, header }) — главная точка входа.
 */
define(['../../util/element-creator', '../../util/mainLocalStorage/admx', '../../util/API'], function(__dep0, __dep1, API) {
var { createElement } = __dep0;
var { getAdmxEntriesByPaths, upsertAdmxEntries } = __dep1;

/**
 * Состояние политики по умолчанию — «Не сконфигурировано».
 * Используется когда сервер вернул пустой результат или при первичном открытии.
 * @constant {string}
 */
const ADMX_DEFAULT_STATE = 'not-configured';

/**
 * Множество допустимых состояний ADMX-политики.
 * Любое значение не из этого множества будет заменено на ADMX_DEFAULT_STATE.
 * @constant {Set<string>}
 */
const VALID_ADMX_STATES = new Set(['not-configured', 'enabled', 'disabled']);

// ============================================================================
// СЕКЦИЯ 1: Утилиты общего назначения
// ============================================================================

/**
 * Регистрирует обработчик события на целевом элементе и автоматически
 * сохраняет функцию удаления в массив cleanups.
 *
 * Используется для гарантированного освобождения ресурсов при уничтожении шаблона
 * (вызов cleanup()). Каждый вызов создает замыкание с removeEventListener.
 *
 * @param {Function[]} cleanups - Массив функций очистки (push-only, pop при cleanup).
 * @param {EventTarget} target - DOM-элемент, на который вешается слушатель.
 * @param {string} eventName - Имя события (click, change, input и т.д.).
 * @param {Function} handler - Обработчик события.
 * @param {Object} [options] - Опции addEventListener.
 */
function addManagedEventListener(cleanups, target, eventName, handler, options) {
    if (!target || typeof target.addEventListener !== 'function' || typeof handler !== 'function') {
        return;
    }

    target.addEventListener(eventName, handler, options);
    cleanups.push(() => target.removeEventListener(eventName, handler, options));
}

/**
 * Разбивает текстовое описание политики (explainText) на строки по \n или \r\n
 * и вставляет между ними DOM-элемент <br> для корректного отображения в HTML.
 *
 * @param {string} [explainText=''] - Исходный текст описания с переносами строк.
 * @returns {Array<string|ElementCreator>} - Массив чередующихся строк и <br>-элементов.
 */
function formatExplainText(explainText = '') {
    return explainText
        .split(/\r?\n/)
        .flatMap((line, index, lines) => (index < lines.length - 1 ? [line, createElement('br')] : [line]));
}

/**
 * Извлекает путь хранения (storagePath) из строки данных вида:
 *   "Read_Path_GPT('Software\BaseALT\Policies\Laps\PostAuthenticationActions')"
 *
 * Этот путь используется как registry-ключ при чтении/записи значений политики.
 * Если строка не соответствует шаблону — возвращается пустая строка.
 *
 * @param {string} [data=''] - Исходная строка с вызовом Read_Path_GPT.
 * @returns {string} - Извлеченный путь или пустая строка.
 */
function extractStoragePathFromData(data = '') {
    if (typeof data !== 'string') {
        return '';
    }

    const match = data.match(/Read_Path_GPT\((['"])(.*?)\1\)/);
    return match?.[2] ?? '';
}

/**
 * Разрешает итоговый путь политики (policyPath) для конкретной записи.
 *
 * Если entryKey начинается с '\' (относительный путь), путь собирается из
 * headerKey (из заголовка политики) и valueName (из метаданных записи).
 * В противном случае возвращается оригинальный entryKey как абсолютный путь.
 *
 * Пример: entryKey='\1', headerKey='Software\ALT\Policies', valueName='MyValue'
 *   → 'Software\ALT\Policies\MyValue'
 *
 * @param {Object} params
 * @param {string} params.entryKey - Ключ записи из policyData (может быть относительным).
 * @param {Object} params.metadata - Метаданные записи (содержит valueName).
 * @param {Object} params.policyHeader - Заголовок политики (содержит key).
 * @returns {string} - Итоговый путь политики.
 */
function resolvePolicyPath({ entryKey = '', metadata = {}, policyHeader = {} } = {}) {
    if (entryKey.startsWith('\\')) {
        const headerKey = policyHeader?.key ?? '';
        const valueName = metadata?.valueName ?? '';

        if (headerKey && valueName) {
            return `${headerKey}\\${valueName}`;
        }

        if (valueName) {
            return valueName;
        }
    }

    return entryKey;
}

/**
 * Нормализует сырые данные политики (policyData) в два массива:
 *   - controlEntries — контролы формы (enum, boolean, decimal, text).
 *   - policyValueEntry — запись типа policyValue (определяет enabled/disabled значения).
 *
 * Проходится по всем ключам policyData, пропуская 'displayName' и 'header'.
 * Для каждой записи с metadata формирует нормализованную структуру:
 *   { entryKey, metadata, policyPath, storagePath }
 *
 * Записи с metadata.type === 'policyValue' выделяются отдельно (только первая).
 *
 * @param {Object} policyData - Сырые данные политики из tree-view (policy-ru.js / policy-en.js).
 * @param {Object} policyHeader - Заголовок политики (policyData.header).
 * @returns {{ controlEntries: Object[], policyValueEntry: Object|null }}
 */
function normalizePolicyEntries(policyData = {}, policyHeader = {}) {
    const controlEntries = [];
    let policyValueEntry = null;

    Object.entries(policyData).forEach(([entryKey, entryValue]) => {
        if (entryKey === 'displayName' || entryKey === 'header') {
            return;
        }

        const metadata = entryValue?.metadata;

        if (!metadata) {
            return;
        }

        const resolvedPolicyPath = resolvePolicyPath({ entryKey, metadata, policyHeader });
        const normalizedEntry = {
            entryKey,
            metadata,
            policyPath: resolvedPolicyPath,
            storagePath: extractStoragePathFromData(entryValue?.data) || resolvedPolicyPath,
        };

        if (metadata.type === 'policyValue') {
            if (!policyValueEntry) {
                policyValueEntry = normalizedEntry;
            }
            return;
        }

        controlEntries.push(normalizedEntry);
    });

    return { controlEntries, policyValueEntry };
}

/**
 * Определяет значение по умолчанию для enum-контрола.
 *
 * Приоритет:
 *   1. defaultItem из метаданных (если ключ существует в items).
 *   2. Первый ключ из items.
 *   3. Пустая строка (если items пуст).
 *
 * @param {Object} items - Объект { value: label } для option-элементов.
 * @param {*} defaultItem - Индекс/ключ элемента по умолчанию из метаданных.
 * @returns {string} - Выбранный ключ (value) для option.
 */
function getEnumDefaultValue(items = {}, defaultItem) {
    const itemKeys = Object.keys(items);

    if (itemKeys.length === 0) {
        return '';
    }

    if (defaultItem !== undefined && defaultItem !== null) {
        const normalizedDefault = String(defaultItem);
        if (Object.prototype.hasOwnProperty.call(items, normalizedDefault)) {
            return normalizedDefault;
        }
    }

    return itemKeys[0];
}

/**
 * Проверяет, является ли значение «простым объектом» (plain object).
 * Исключает null, массивы, DOM-элементы и другие специфичные объекты.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isPlainObject(value) {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value);
}

/**
 * Нормализует строку состояния ADMX.
 * Если переданное значение не входит в VALID_ADMX_STATES — возвращает ADMX_DEFAULT_STATE.
 *
 * @param {string} state - Строка состояния (enabled, disabled, not-configured, и т.д.).
 * @returns {string} - Валидное состояние или 'not-configured'.
 */
function normalizeAdmxState(state) {
    return VALID_ADMX_STATES.has(state)
        ? state
        : ADMX_DEFAULT_STATE;
}

/**
 * Возвращает значение контрола по умолчанию в зависимости от его типа.
 *
 * - enum: первый элемент из items или defaultItem.
 * - boolean: falseValue из метаданных или false.
 * - decimal/text: defaultValue из метаданных или пустая строка.
 *
 * @param {Object} metadata - Метаданные контрола (type, items, defaultItem, falseValue и т.д.).
 * @returns {*} - Значение по умолчанию для данного типа контрола.
 */
function getDefaultControlValue(metadata = {}) {
    switch (metadata?.type) {
        case 'enum':
            return getEnumDefaultValue(metadata.items ?? {}, metadata.defaultItem);
        case 'boolean':
            return Object.prototype.hasOwnProperty.call(metadata, 'falseValue')
                ? metadata.falseValue
                : false;
        case 'decimal':
        case 'text':
        default:
            return metadata.defaultValue ?? '';
    }
}

// ============================================================================
// СЕКЦИЯ 2: Загрузка и парсинг текущих значений с сервера
// ============================================================================

/**
 * Устанавливает значения по умолчанию на форму ADMX.
 * Вызывается когда сервер вернул пустые данные и нет localStorage-записей.
 *
 * Устанавливает состояние «Не сконфигурировано», применяет дефолтные значения
 * для всех контролов и блокирует их (syncControlsWithPolicyState).
 *
 * @param {Object} params
 * @param {Element} params.rootElement - Корневой DOM-элемент формы.
 * @param {Object[]} params.controlEntries - Массив нормализованных записей контролов.
 */
function applyDefaultValuesToAdmxForm({ rootElement, controlEntries = [] } = {}) {
    if (!rootElement) {
        return;
    }

    setSelectedAdmxState(rootElement, ADMX_DEFAULT_STATE);

    controlEntries.forEach(({ storagePath, metadata }) => {
        const controlElement = getControlElementByStoragePath(rootElement, storagePath);
        applyControlValue(controlElement, metadata, getDefaultControlValue(metadata));
    });

    syncControlsWithPolicyState(rootElement);
}

/**
 * Рекурсивно разворачивает вложенную структуру ответа API.
 *
 * Сервер FreeIPA может возвращать данные в разных форматах:
 *   - Массив: берется первый элемент.
 *   - Объект: проверяются ключи 'result', 'value', 'currentValue' (по приоритету).
 *   - Примитив: возвращается как есть.
 *
 * Примеры:
 *   { result: { value_data: "enabled;1" } } → { value_data: "enabled;1" }
 *   [ { result: "enabled;2" } ]             → "enabled;2"
 *   { value: "disabled;0" }                 → "disabled;0"
 *   {}                                       → {}
 *
 * @param {*} rawValue - Сырой ответ от API.get_current_value().
 * @returns {*} - Развёрнутое значение (объект, строка, null).
 */
function unwrapCurrentValue(rawValue) {
    if (Array.isArray(rawValue)) {
        return rawValue.length > 0
            ? unwrapCurrentValue(rawValue[0])
            : null;
    }

    if (isPlainObject(rawValue)) {
        const candidateKeys = ['result', 'value', 'currentValue'];

        for (const key of candidateKeys) {
            if (Object.prototype.hasOwnProperty.call(rawValue, key)) {
                return unwrapCurrentValue(rawValue[key]);
            }
        }
    }

    return rawValue;
}

/**
 * Парсит строковое значение в формате "state;value" в структурированный объект.
 *
 * Формат: "enabled;1" → { hasData: true, state: "enabled", value: "1" }
 * Формат: "disabled"  → { hasData: true, state: "disabled", value: "" }
 * Формат: null/""     → { hasData: false, state: "not-configured", value: null }
 *
 * Используется как для прямых строковых ответов API, так и для извлечённых
 * из поля value_data (см. parseAdmxCurrentValue).
 *
 * @param {*} stringValue - Строка формата "state;value" или null/undefined.
 * @returns {{ hasData: boolean, state: string, value: string|null }}
 */
function parseStringValueAsAdmxState(stringValue) {
    if (stringValue === null || stringValue === undefined || stringValue === '') {
        return {
            hasData: false,
            state: ADMX_DEFAULT_STATE,
            value: null,
        };
    }

    const str = String(stringValue);
    const delimiterIndex = str.indexOf(';');

    if (delimiterIndex === -1) {
        return {
            hasData: true,
            state: normalizeAdmxState(str),
            value: '',
        };
    }

    return {
        hasData: true,
        state: normalizeAdmxState(str.slice(0, delimiterIndex)),
        value: str.slice(delimiterIndex + 1),
    };
}

/**
 * Главная функция парсинга текущего значения политики.
 *
 * Обрабатывает все возможные форматы ответа сервера:
 *
 * 1. Пустой объект {} → hasData: false (сервер не имеет данных для этого пути).
 *    Пример ответа: API возвращает {} для неназначенной политики.
 *
 * 2. Объект с value_data → извлекает и парсит строку "state;value".
 *    Пример ответа: { value_data: "enabled;1", value_type: "REG_SZ" }
 *    Результат: { hasData: true, state: "enabled", value: "1" }
 *
 * 3. Объект с state → прямое указание состояния (обратная совместимость).
 *    Пример: { state: "enabled", value: "1" }
 *
 * 4. null/undefined/'' → hasData: false.
 *
 * 5. Строка → делегирует в parseStringValueAsAdmxState() для разбора "state;value".
 *
 * @param {*} rawValue - Сырой ответ от API.get_current_value().
 * @returns {{ hasData: boolean, state: string, value: string|null }}
 */
function parseAdmxCurrentValue(rawValue) {
    const normalizedRawValue = unwrapCurrentValue(rawValue);

    if (isPlainObject(normalizedRawValue)) {
        // Пустой объект → сервер не имеет данных для данного registry-пути.
        // Формируется fallback на дефолтные значения или localStorage.
        if (Object.keys(normalizedRawValue).length === 0) {
            return {
                hasData: false,
                state: ADMX_DEFAULT_STATE,
                value: null,
            };
        }

        // Объект с value_data — основной формат ответа сервера.
        // value_data содержит строку "state;value", value_type — тип реестра (REG_SZ и т.д.).
        // Пример: { value_data: "enabled;1", value_type: "REG_SZ" }
        if (Object.prototype.hasOwnProperty.call(normalizedRawValue, 'value_data')) {
            return parseStringValueAsAdmxState(normalizedRawValue.value_data);
        }

        // Объект с прямым указанием state — альтернативный формат.
        // if (Object.prototype.hasOwnProperty.call(normalizedRawValue, 'state')) {
        //     return {
        //         hasData: true,
        //         state: normalizeAdmxState(normalizedRawValue.state),
        //         value: Object.prototype.hasOwnProperty.call(normalizedRawValue, 'value')
        //             ? normalizedRawValue.value
        //             : '',
        //     };
        // }
    }

    if (normalizedRawValue === null || normalizedRawValue === undefined || normalizedRawValue === '') {
        return {
            hasData: false,
            state: ADMX_DEFAULT_STATE,
            value: null,
        };
    }

    // Строка формата "state;value" — парсим через утилиту.

    console.log('normalizedRawValue = ',normalizedRawValue)

    return parseStringValueAsAdmxState(normalizedRawValue);
}

// ============================================================================
// СЕКЦИЯ 3: Формирование значений для записи на сервер
// ============================================================================

/**
 * Строит metadata-путь для API-запроса set_policy.
 * Формат: "Machine/categories/.../policies/policyKey".
 *
 * Используется как параметр metadata при вызове API.set().
 *
 * @param {Object} params
 * @param {Object} params.item - Выбранный элемент дерева.
 * @param {string|null} params.admxTreePath - Путь в дереве ADMX-политик.
 * @returns {string} - Полный metadata-путь.
 */
function buildAdmxMetadataPath({ item = {}, admxTreePath = null } = {}) {
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;
    const policyKey = item?.policyKey ?? '';

    if (effectiveAdmxTreePath && policyKey) {
        return `${effectiveAdmxTreePath}/${policyKey}`;
    }

    return effectiveAdmxTreePath ?? '';
}

/**
 * Формирует строку значения для записи на сервер в формате "state;value".
 *
 * Примеры:
 *   buildAdmxSetValue('enabled', 5)   → "enabled;5"
 *   buildAdmxSetValue('disabled', '')  → "disabled;"
 *   buildAdmxSetValue('not-configured', null) → "not-configured;"
 *
 * @param {string} state - Состояние политики (enabled/disabled/not-configured).
 * @param {*} fieldValue - Значение поля контрола.
 * @returns {string} - Строка формата "state;value" для API.set().
 */
function buildAdmxSetValue(state, fieldValue) {
    const normalizedState = normalizeAdmxState(state);
    const normalizedValue = fieldValue === null || fieldValue === undefined
        ? ''
        : String(fieldValue);

    return `${normalizedState};${normalizedValue}`;
}

// ============================================================================
// СЕКЦИЯ 4: Рендеринг контролов формы
// ============================================================================

/**
 * Создает общий набор HTML-атрибутов для элемента контрола.
 * Все контролы (select, input) имеют одинаковый набор data-атрибутов
 * для идентификации при чтении/записи значений.
 *
 * @param {Object} params
 * @param {Object} params.metadata - Метаданные контрола (id, valueName).
 * @param {string} params.policyPath - Путь политики (registry-ключ).
 * @param {string} params.storagePath - Путь хранения (может отличаться от policyPath).
 * @param {string} params.type - Тип контрола (enum/boolean/decimal/text).
 * @param {boolean} params.isDisabled - Флаг блокировки контрола.
 * @returns {Object} - Объект атрибутов для ElementCreator.
 */
function createCommonControlAttrs({ metadata = {}, policyPath = '', storagePath = '', type = '', isDisabled = true } = {}) {
    return {
        name: metadata.id ?? metadata.valueName ?? 'admx-control',
        disabled: isDisabled ? 'disabled' : null,
        'data-policy-path': policyPath,
        'data-storage-path': storagePath || policyPath,
        'data-policy-type': type,
    };
}

/**
 * Рендерит заглушку «В разработке» для неподдерживаемых типов контролов (list и др.).
 *
 * @returns {ElementCreator}
 */
function renderUnsupportedControl() {
    return createElement('div', {
        className: 'field__element',
        text: '\u0412 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u043a\u0435'
    });
}

/**
 * Рендерит контрол типа enum — выпадающий список (<select>).
 * Опции формируются из metadata.items ({ value: label }).
 * Выбранная по умолчанию опция определяется через getEnumDefaultValue().
 *
 * @param {Object} params - См. createCommonControlAttrs.
 * @returns {ElementCreator} - DOM-элемент select с опциями.
 */
function renderEnumControl({ metadata = {}, policyPath = '', storagePath = '', isDisabled = true } = {}) {
    const items = metadata.items ?? {};
    const selectedValue = getEnumDefaultValue(items, metadata.defaultItem);
    const optionEntries = Object.entries(items);

    return createElement('div', {
        className: 'field__element',
        children: [
            createElement('select', {
                attrs: createCommonControlAttrs({
                    metadata,
                    policyPath,
                    storagePath,
                    type: 'enum',
                    isDisabled
                }),
                children: optionEntries.map(([value, label]) => createElement('option', {
                    attrs: {
                        value,
                        selected: value === selectedValue ? 'selected' : null
                    },
                    text: label
                }))
            })
        ]
    });
}

/**
 * Рендерит контрол типа boolean — чекбокс (<input type="checkbox">).
 * Значения true/false определяются в metadata (trueValue/falseValue).
 *
 * @param {Object} params - См. createCommonControlAttrs.
 * @returns {ElementCreator}
 */
function renderBooleanControl({ metadata = {}, policyPath = '', storagePath = '', isDisabled = true } = {}) {
    return createElement('div', {
        className: 'field__element',
        children: [
            createElement('input', {
                attrs: {
                    ...createCommonControlAttrs({
                        metadata,
                        policyPath,
                        storagePath,
                        type: 'boolean',
                        isDisabled
                    }),
                    type: 'checkbox'
                }
            })
        ]
    });
}

/**
 * Рендерит контрол типа decimal — числовое поле (<input type="number">).
 * Границы (min/max) и значение по умолчанию берутся из metadata.
 *
 * @param {Object} params - См. createCommonControlAttrs.
 * @returns {ElementCreator}
 */
function renderDecimalControl({ metadata = {}, policyPath = '', storagePath = '', isDisabled = true } = {}) {
    return createElement('div', {
        className: 'field__element',
        children: [
            createElement('input', {
                attrs: {
                    ...createCommonControlAttrs({
                        metadata,
                        policyPath,
                        storagePath,
                        type: 'decimal',
                        isDisabled
                    }),
                    type: 'number',
                    min: metadata.minValue ?? null,
                    max: metadata.maxValue ?? null,
                    value: metadata.defaultValue ?? null
                }
            })
        ]
    });
}

/**
 * Рендерит контрол типа text — текстовое поле (<input type="text">).
 *
 * @param {Object} params - См. createCommonControlAttrs.
 * @returns {ElementCreator}
 */
function renderTextControl({ metadata = {}, policyPath = '', storagePath = '', isDisabled = true } = {}) {
    return createElement('div', {
        className: 'field__element',
        children: [
            createElement('input', {
                attrs: {
                    ...createCommonControlAttrs({
                        metadata,
                        policyPath,
                        storagePath,
                        type: 'text',
                        isDisabled
                    }),
                    type: 'text'
                }
            })
        ]
    });
}

/**
 * Фабрика контролов: выбирает нужный рендер-метод по metadata.type.
 * Для неподдерживаемых типов (list, неизвестные) рендерит заглушку.
 *
 * @param {Object} params - См. createCommonControlAttrs.
 * @returns {ElementCreator}
 */
function renderControlByType({ metadata = {}, policyPath = '', storagePath = '', isDisabled = true } = {}) {
    const type = metadata?.type;

    switch (type) {
        case 'enum':
            return renderEnumControl({ metadata, policyPath, storagePath, isDisabled });
        case 'boolean':
            return renderBooleanControl({ metadata, policyPath, storagePath, isDisabled });
        case 'decimal':
            return renderDecimalControl({ metadata, policyPath, storagePath, isDisabled });
        case 'text':
            return renderTextControl({ metadata, policyPath, storagePath, isDisabled });
        case 'list':
            return renderUnsupportedControl();
        default:
            return renderUnsupportedControl();
    }
}

/**
 * Рендерит строку контрола: описание (label) + сам контрол.
 * Структура DOM: div.gu__admx-item > div.gu__admx-description + div.gu__admx-options > контрол.
 *
 * @param {Object} params
 * @param {Object} params.metadata - Метаданные контрола (содержит label).
 * @param {string} params.policyPath - Путь политики.
 * @param {string} params.storagePath - Путь хранения.
 * @param {boolean} params.isDisabled - Флаг блокировки.
 * @returns {ElementCreator}
 */
function renderAdmxControlRow({ metadata = {}, policyPath = '', storagePath = '', isDisabled = true } = {}) {
    return createElement('div', {
        className: 'gp__admx-item',
        children: [
            createElement('div', {
                className: 'gp__admx-description',
                text: metadata.label ?? ''
            }),
            createElement('div', {
                className: 'gp__admx-options',
                children: [
                    renderControlByType({ metadata, policyPath, storagePath, isDisabled })
                ]
            })
        ]
    });
}

// ============================================================================
// СЕКЦИЯ 5: Управление состоянием формы (state, disabled, snapshots)
// ============================================================================

/**
 * Устанавливает или снимает атрибут disabled у всех контролов формы.
 *
 * @param {Element} rootElement - Корневой элемент формы.
 * @param {boolean} shouldDisable - true = заблокировать, false = разблокировать.
 */
function setControlsDisabledState(rootElement, shouldDisable) {
    if (!rootElement) {
        return;
    }

    const controls = rootElement.querySelectorAll('.gp__admx-options input, .gp__admx-options select, .gp__admx-options textarea');

    controls.forEach((control) => {
        control.disabled = shouldDisable;
    });
}

/**
 * Возвращает текущее выбранное состояние политики из радиокнопок.
 *
 * @param {Element} rootElement - Корневой элемент формы.
 * @returns {string} - 'not-configured' | 'enabled' | 'disabled'.
 */
function getSelectedAdmxState(rootElement) {
    return rootElement?.querySelector('input[name="admx-state"]:checked')?.value ?? ADMX_DEFAULT_STATE;
}

/**
 * Устанавливает выбранную радиокнопку состояния политики.
 * Используется CSS.escape для защиты от спецсимволов в значении.
 *
 * @param {Element} rootElement - Корневой элемент формы.
 * @param {string} [state=ADMX_DEFAULT_STATE] - Состояние для установки.
 */
function setSelectedAdmxState(rootElement, state = ADMX_DEFAULT_STATE) {
    if (!rootElement) {
        return;
    }

    const normalizedState = typeof state === 'string' && state.length > 0
        ? state
        : ADMX_DEFAULT_STATE;

    const radioToSelect = rootElement.querySelector(`input[name="admx-state"][value="${CSS.escape(normalizedState)}"]`);

    if (radioToSelect instanceof HTMLInputElement) {
        radioToSelect.checked = true;
    }
}

/**
 * Синхронизирует доступность контролов с выбранным состоянием политики.
 *
 * Логика: контролы разблокированы ТОЛЬКО при состоянии «Включено».
 * При «Не сконфигурировано» и «Отключено» — контролы заблокированы.
 *
 * @param {Element} rootElement - Корневой элемент формы.
 */
function syncControlsWithPolicyState(rootElement) {
    if (!rootElement) {
        return;
    }

    const currentState = getSelectedAdmxState(rootElement);
    setControlsDisabledState(rootElement, currentState !== 'enabled');
}

/**
 * Находит DOM-элемент контрола по его storagePath через data-атрибут.
 *
 * @param {Element} rootElement - Корневой элемент формы.
 * @param {string} storagePath - Путь хранения для поиска.
 * @returns {Element|null} - Найденный input/select или null.
 */
function getControlElementByStoragePath(rootElement, storagePath = '') {
    if (!rootElement || !storagePath) {
        return null;
    }

    return rootElement.querySelector(`[data-storage-path="${CSS.escape(storagePath)}"]`);
}

/**
 * Считывает текущее значение из DOM-элемента контрола с учётом типа.
 *
 * - boolean: возвращает trueValue/falseValue из metadata в зависимости от checked.
 * - decimal: парсит Number, возвращает null при пустом поле, значение при NaN.
 * - enum/text: возвращает controlElement.value как строку.
 *
 * @param {Element} controlElement - DOM-элемент input/select.
 * @param {Object} metadata - Метаданные контрола (type, trueValue, falseValue).
 * @returns {*} - Текущее значение контрола (строка, число, boolean-значение, null).
 */
function readControlValue(controlElement, metadata = {}) {
    if (!controlElement) {
        return null;
    }

    switch (metadata?.type) {
        case 'boolean': {
            const trueValue = Object.prototype.hasOwnProperty.call(metadata, 'trueValue')
                ? metadata.trueValue
                : true;
            const falseValue = Object.prototype.hasOwnProperty.call(metadata, 'falseValue')
                ? metadata.falseValue
                : false;

            return controlElement.checked ? trueValue : falseValue;
        }
        case 'decimal': {
            if (controlElement.value === '') {
                return null;
            }

            const parsedValue = Number(controlElement.value);
            return Number.isNaN(parsedValue) ? controlElement.value : parsedValue;
        }
        case 'enum':
        case 'text':
        default:
            return controlElement.value;
    }
}

/**
 * Применяет значение к DOM-элементу контрола с учётом типа.
 *
 * - boolean: устанавливает checked, сравнивая значение с trueValue.
 * - decimal/enum/text: устанавливает value напрямую (или пустую строку при null).
 *
 * @param {Element} controlElement - DOM-элемент контрола.
 * @param {Object} metadata - Метаданные (type, trueValue).
 * @param {*} value - Значение для установки (строка, число, boolean).
 */
function applyControlValue(controlElement, metadata = {}, value = null) {
    if (!controlElement || value === undefined) {
        return;
    }

    switch (metadata?.type) {
        case 'boolean': {
            const trueValue = Object.prototype.hasOwnProperty.call(metadata, 'trueValue')
                ? metadata.trueValue
                : true;

            controlElement.checked = value === true || String(value) === String(trueValue);
            return;
        }
        case 'decimal':
        case 'enum':
        case 'text':
        default:
            controlElement.value = value ?? '';
    }
}

/**
 * Создает снапшот текущего состояния формы.
 *
 * Используется для dirty-checking: сравнение текущего снапшота
 * с initialFormSnapshot определяет, были ли изменения и нужно ли
 * активировать кнопки Apply/Cancel.
 *
 * @param {Object} params
 * @param {Element} params.rootElement - Корневой элемент формы.
 * @param {Object[]} params.controlEntries - Массив контролов.
 * @returns {{ state: string, controls: Array<{ path: string, type: string, value: *}> }}
 */
function buildAdmxFormSnapshot({ rootElement, controlEntries = [] } = {}) {
    return {
        state: getSelectedAdmxState(rootElement),
        controls: controlEntries.map(({ storagePath, metadata }) => {
            const controlElement = getControlElementByStoragePath(rootElement, storagePath);

            return {
                path: storagePath,
                type: metadata?.type ?? '',
                value: readControlValue(controlElement, metadata),
            };
        }),
    };
}

/**
 * Восстанавливает состояние формы из ранее созданного снапшота.
 * Используется при Cancel — возвращает форму к состоянию после последнего Apply.
 *
 * @param {Object} params
 * @param {Element} params.rootElement
 * @param {Object} params.snapshot - Снапшот, созданный buildAdmxFormSnapshot().
 * @param {Object[]} params.controlEntries
 */
function applyAdmxFormSnapshot({ rootElement, snapshot = null, controlEntries = [] } = {}) {
    if (!rootElement || !snapshot) {
        return;
    }

    setSelectedAdmxState(rootElement, snapshot.state);

    const snapshotEntries = new Map(
        Array.isArray(snapshot.controls)
            ? snapshot.controls.map((entry) => [entry.path, entry])
            : []
    );

    controlEntries.forEach(({ storagePath, metadata }) => {
        const snapshotEntry = snapshotEntries.get(storagePath);

        if (!snapshotEntry) {
            return;
        }

        const controlElement = getControlElementByStoragePath(rootElement, storagePath);
        applyControlValue(controlElement, metadata, snapshotEntry.value);
    });

    syncControlsWithPolicyState(rootElement);
}

// ============================================================================
// СЕКЦИЯ 6: Работа с localStorage (персистентность)
// ============================================================================

/**
 * Определяет сохранённое состояние политики из localStorage-записей.
 * Ищет первое непустое значение state среди policyValueEntry и controlEntries.
 *
 * @param {Object} params
 * @param {Object} params.persistedEntries - Записи из localStorage, ключ = storagePath.
 * @param {Object|null} params.policyValueEntry
 * @param {Object[]} params.controlEntries
 * @returns {string} - Сохранённое состояние или ADMX_DEFAULT_STATE.
 */
function resolveStoredState({ persistedEntries = {}, policyValueEntry = null, controlEntries = [] } = {}) {
    const candidatePaths = [
        policyValueEntry?.storagePath ?? null,
        ...controlEntries.map(({ storagePath }) => storagePath),
    ].filter(Boolean);

    for (const path of candidatePaths) {
        const persistedEntry = persistedEntries[path];

        if (persistedEntry?.state) {
            return persistedEntry.state;
        }
    }

    return ADMX_DEFAULT_STATE;
}

/**
 * Восстанавливает значения из localStorage на форму.
 * Вызывается когда API вернул пустые данные, но в localStorage есть записи.
 *
 * @param {Object} params
 * @param {Element} params.rootElement
 * @param {Object} params.persistedEntries
 * @param {Object|null} params.policyValueEntry
 * @param {Object[]} params.controlEntries
 */
function restorePersistedAdmxValues({ rootElement, persistedEntries = {}, policyValueEntry = null, controlEntries = [] } = {}) {
    if (!rootElement) {
        return;
    }

    const restoredState = resolveStoredState({
        persistedEntries,
        policyValueEntry,
        controlEntries,
    });

    setSelectedAdmxState(rootElement, restoredState);

    controlEntries.forEach(({ storagePath, metadata }) => {
        const persistedEntry = persistedEntries[storagePath];

        if (!persistedEntry) {
            return;
        }

        const controlElement = getControlElementByStoragePath(rootElement, storagePath);
        applyControlValue(controlElement, metadata, persistedEntry.value);
    });

    syncControlsWithPolicyState(rootElement);
}

/**
 * Проверяет, есть ли хотя бы одна запись в localStorage для данной политики.
 *
 * @param {Object} params - См. resolveStoredState.
 * @returns {boolean}
 */
function hasPersistedAdmxData({ persistedEntries = {}, policyValueEntry = null, controlEntries = [] } = {}) {
    const candidatePaths = [
        policyValueEntry?.storagePath ?? null,
        ...controlEntries.map(({ storagePath }) => storagePath),
    ].filter(Boolean);

    return candidatePaths.some((path) => Object.prototype.hasOwnProperty.call(persistedEntries, path));
}

/**
 * Возвращает значение policyValue для заданного состояния.
 *
 * policyValue — это запись, которая определяет, какое значение записывается
 * в реестр при enabled/disabled (например, enabledValue=1, disabledValue=0).
 * При «Не сконфигурировано» возвращается null.
 *
 * @param {Object|null} policyValueEntry
 * @param {string} state
 * @returns {*|null}
 */
function resolvePolicyValueForState(policyValueEntry = null, state = ADMX_DEFAULT_STATE) {
    if (!policyValueEntry?.metadata) {
        return null;
    }

    if (state === 'enabled') {
        return policyValueEntry.metadata.enabledValue ?? null;
    }

    if (state === 'disabled') {
        return policyValueEntry.metadata.disabledValue ?? null;
    }

    return null;
}

/**
 * Формирует массив записей для сохранения в localStorage.
 *
 * Для каждого controlEntry создаётся запись с текущим значением из формы.
 * Дополнительно добавляется запись для policyValueEntry (если есть) с
 * enabledValue/disabledValue в зависимости от состояния.
 *
 * Каждая запись: { path, state, type, value, policyKey, policyTitle, admxTreePath, updatedAt }.
 *
 * @param {Object} params
 * @param {Element} params.rootElement
 * @param {Object} params.item
 * @param {string|null} params.admxTreePath
 * @param {Object[]} params.controlEntries
 * @param {Object|null} params.policyValueEntry
 * @returns {Object[]}
 */
function buildPersistedAdmxEntries({
    rootElement,
    item = {},
    admxTreePath = null,
    controlEntries = [],
    policyValueEntry = null,
} = {}) {
    const state = getSelectedAdmxState(rootElement);
    const updatedAt = new Date().toISOString();
    const policyTitle = item?.title ?? item?.policyData?.header?.displayName ?? null;
    const policyKey = item?.policyKey ?? null;
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;
    const entriesByPath = new Map();

    controlEntries.forEach(({ storagePath, metadata }) => {
        if (!storagePath) {
            return;
        }

        const controlElement = getControlElementByStoragePath(rootElement, storagePath);

        entriesByPath.set(storagePath, {
            path: storagePath,
            state,
            type: metadata?.type ?? 'unknown',
            value: readControlValue(controlElement, metadata),
            policyKey,
            policyTitle,
            admxTreePath: effectiveAdmxTreePath,
            updatedAt,
        });
    });

    if (policyValueEntry?.storagePath) {
        entriesByPath.set(policyValueEntry.storagePath, {
            path: policyValueEntry.storagePath,
            state,
            type: 'policyValue',
            value: resolvePolicyValueForState(policyValueEntry, state),
            policyKey,
            policyTitle,
            admxTreePath: effectiveAdmxTreePath,
            updatedAt,
        });
    }

    return [...entriesByPath.values()];
}

// ============================================================================
// СЕКЦИЯ 7: Главная функция — renderAdmxTemplate
// ============================================================================

/**
 * Рендерит полный рабочий пространство для ADMX-политики.
 *
 * Создаёт DOM-структуру формы, загружает текущие значения с сервера,
 * регистрирует обработчики событий и управляет жизненным циклом компонента.
 *
 * Возвращает объект ElementCreator с дополнительным методом cleanup(),
 * который вызывается при переключении на другой элемент дерева.
 *
 * @param {Object} params
 * @param {boolean} [params.isHelpOpen=false] - Открыта ли панель помощи.
 * @param {Object} [params.item={}] - Выбранный элемент дерева (содержит policyData, policyKey, target).
 * @param {string|null} [params.admxTreePath=null] - Путь в дереве ADMX-метаданных.
 * @param {Object|null} [params.header=null] - Компонент заголовка (содержит кнопки Apply/Cancel).
 * @returns {ElementCreator} - Объект с getElement() и cleanup().
 */
function renderAdmxTemplate({ isHelpOpen = false, item = {}, admxTreePath = null, header = null } = {}) {

    // -- Подготовка параметров -------------------------------------------------

    /** Путь в дереве ADMX-метаданных (для metadata-параметра API.set). */
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;

    /** Целевая область политики: 'Machine' или 'User'. */
    const effectiveTarget = item?.target ?? item?.policyData?.header?.class ?? item?.header?.class ?? '';

    /** Полный metadata-путь для API.set(). */
    const metadataPath = buildAdmxMetadataPath({ item, admxTreePath: effectiveAdmxTreePath });

    /** DOM-элемент заголовка с кнопками Apply/Cancel. */
    const headerEl = header?.getElement?.();
    const btnApply = headerEl?.querySelector('.admx__btn-apply') ?? null;
    const btnCancel = headerEl?.querySelector('.admx__btn-cancel') ?? null;

    /** Массив функций очистки для cleanup(). */
    const cleanups = [];

    // -- Нормализация данных политики ------------------------------------------

    const policyData = item.policyData ?? {};
    const policyHeader = policyData.header ?? {};

    /**
     * controlEntries — массив контролов формы (enum/boolean/decimal/text).
     * policyValueEntry — запись типа policyValue (enabled/disabled значения).
     */
    const { controlEntries, policyValueEntry } = normalizePolicyEntries(policyData, policyHeader);

    /** Загружаем ранее сохранённые записи из localStorage по storagePath. */
    const persistedEntries = getAdmxEntriesByPaths([
        policyValueEntry?.storagePath ?? null,
        ...controlEntries.map(({ storagePath }) => storagePath),
    ].filter(Boolean));

    /** Есть ли вообще какие-то сохранённые данные в localStorage. */
    const hasPersistedEntries = hasPersistedAdmxData({
        persistedEntries,
        policyValueEntry,
        controlEntries,
    });

    // -- Рендеринг DOM ---------------------------------------------------------

    /** Предварительно рендерим строки контролов (заблокированные по умолчанию). */
    const controlRows = controlEntries.map(({ metadata, policyPath, storagePath }) => renderAdmxControlRow({
        metadata,
        policyPath,
        storagePath,
        isDisabled: true
    }));

    /**
     * DOM-структура ADMX-шаблона:
     *
     * div.gu__admx-wrapper
     * ├── div.gu__admx                          (основная панель)
     * │   ├── div.gu__admx-settings             (заголовок + радиокнопки состояния)
     * │   │   ├── div.title                      ("Политика: <name>")
     * │   │   ├── div.gu__admx-state-policy-title ("Состояние политики:")
     * │   │   ├── div.gu__admx-state-policy      (3 радиокнопки: не сконфигурировано / включено / отключено)
     * │   │   │   data-policy-path, data-enabled-value, data-disabled-value
     * │   │   └── div.field__line               (разделитель)
     * │   └── div.gu__admx-info                 (таблица контролов)
     * │       ├── div.gu__admx-item              (заголовок: Описание | Опции)
     * │       └── ...controlRows                  (динамические строки контролов)
     * └── div.gu__admx-help                     (панель помощи, сворачиваемая)
     *     ├── div.gu__admx-supported             ("Поддерживается на: <supportedOn>")
     *     ├── div.gu__admx-comment               (textarea для комментария)
     *     └── div.gu__admx-text-help             ("Помощь: <explainText>")
     */
    const admxTemplate = createElement('div', {
        className: 'gp__admx-wrapper',
        children: [
            createElement('div', {
                className: 'gp__admx',
                children: [
                    createElement('div', {
                        className: 'gp__admx-settings',
                        children: [
                            createElement('div', {
                                className: 'title',
                                children: [
                                    '\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430: ',
                                    createElement('span', {
                                        className: 'title__name',
                                        text: policyHeader.displayName ?? ''
                                    })
                                ]
                            }),
                            createElement('div', {
                                className: 'gp__admx-state-policy-title',
                                text: '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u043f\u043e\u043b\u0438\u0442\u0438\u043a\u0438:'
                            }),
                            // Блок радиокнопок состояния политики.
                            // data-атрибуты хранят значения для policyValue (enabled/disabled).
                            createElement('div', {
                                className: 'gp__admx-state-policy',
                                attrs: {
                                    'data-policy-path': policyValueEntry?.policyPath ?? null,
                                    'data-enabled-value': policyValueEntry?.metadata?.enabledValue ?? null,
                                    'data-disabled-value': policyValueEntry?.metadata?.disabledValue ?? null,
                                },
                                children: [
                                    createElement('label', {
                                        className: 'gp__admx-radio',
                                        children: [
                                            createElement('input', {
                                                attrs: {
                                                    type: 'radio',
                                                    name: 'admx-state',
                                                    value: 'not-configured',
                                                    checked: 'checked'
                                                }
                                            }),
                                            createElement('span', {
                                                text: '\u041d\u0435 \u0441\u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043e'
                                            })
                                        ]
                                    }),
                                    createElement('label', {
                                        className: 'gp__admx-radio',
                                        children: [
                                            createElement('input', {
                                                attrs: {
                                                    type: 'radio',
                                                    name: 'admx-state',
                                                    value: 'enabled'
                                                }
                                            }),
                                            createElement('span', {
                                                text: '\u0412\u043a\u043b\u044e\u0447\u0435\u043d\u043e'
                                            })
                                        ]
                                    }),
                                    createElement('label', {
                                        className: 'gp__admx-radio',
                                        children: [
                                            createElement('input', {
                                                attrs: {
                                                    type: 'radio',
                                                    name: 'admx-state',
                                                    value: 'disabled'
                                                }
                                            }),
                                            createElement('span', {
                                                text: '\u041e\u0442\u043a\u043b\u044e\u0447\u0435\u043d\u043e'
                                            })
                                        ]
                                    })
                                ]
                            }),
                            createElement('div', {
                                className: 'field__line'
                            })
                        ]
                    }),
                    createElement('div', {
                        className: 'gp__admx-info',
                        children: [
                            createElement('div', {
                                className: 'gp__admx-item',
                                children: [
                                    createElement('div', {
                                        className: 'gp__admx-description',
                                        text: '\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435'
                                    }),
                                    createElement('div', {
                                        className: 'gp__admx-options',
                                        text: '\u041e\u043f\u0446\u0438\u0438'
                                    })
                                ]
                            }),
                            ...controlRows
                        ]
                    })
                ]
            }),
            // Панель помощи — сворачиваемая, управляется CSS-классом 'is-open'.
            createElement('div', {
                className: ['gp__admx-help', isHelpOpen ? 'is-open' : null],
                children: [
                    createElement('div', {
                        className: 'gp__admx-supported',
                        children: [
                            createElement('div', {
                                className: 'title',
                                text: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430:'
                            }),
                            createElement('div', {
                                className: 'gp__admx-content',
                                text: policyHeader.supportedOn ?? ''
                            })
                        ]
                    }),
                    createElement('div', {
                        className: 'gp__admx-comment',
                        children: [
                            createElement('div', {
                                className: 'title',
                                text: '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439:'
                            }),
                            createElement('textarea', {
                                attrs: {
                                    name: 'comment'
                                }
                            })
                        ]
                    }),
                    createElement('div', {
                        className: 'gp__admx-text-help',
                        children: [
                            createElement('div', {
                                className: 'title',
                                text: '\u041f\u043e\u043c\u043e\u0449\u044c:'
                            }),
                            createElement('div', {
                                className: 'gp__admx-content',
                                children: formatExplainText(policyHeader.explainText)
                            })
                        ]
                    })
                ]
            })
        ]
    });

    // -- Инициализация состояния компонента ------------------------------------

    /** DOM-элемент отрендеренного шаблона. */
    const admxTemplateElement = admxTemplate.getElement();

    /** DOM-элемент блока радиокнопок состояния. */
    const statePolicyElement = admxTemplateElement.querySelector('.gp__admx-state-policy');

    /**
     * Снапшот формы после завершения загрузки/сохранения.
     * null означает, что загрузка ещё не завершена (кнопки неактивны).
     * Сравнение с текущим снапшотом определяет dirty-состояние.
     */
    let initialFormSnapshot = null;

    /** Флаг: идёт ли асинхронная загрузка значений с сервера. */
    let isLoading = true;

    /** Флаг: идёт ли асинхронное сохранение значений на сервер. */
    let isSaving = false;

    // -- Управление кнопками Apply/Cancel в заголовке -------------------------

    /**
     * Устанавливает CSS-класс 'active' на кнопках Apply/Cancel.
     *
     * Кнопки активны ТОЛЬКО когда:
     *   - isLoading === false (загрузка завершена)
     *   - isSaving === false (не идёт сохранение)
     *   - initialFormSnapshot !== null (есть базовый снапшот)
     *   - active === true (переданный аргумент)
     *
     * @param {boolean} active - Показать (true) или скрыть (false) кнопки.
     */
    const setHeaderAdmxButtonsActive = (active) => {
        const canUseButtons = !isLoading && !isSaving && initialFormSnapshot !== null;

        if (btnApply) {
            btnApply.classList.toggle('active', canUseButtons && active);
        }

        if (btnCancel) {
            btnCancel.classList.toggle('active', canUseButtons && active);
        }
    };

    /**
     * Восстанавливает форму из localStorage-записей.
     * Замыкается на persistedEntries, policyValueEntry, controlEntries.
     */
    const restorePersistedState = () => {
        restorePersistedAdmxValues({
            rootElement: admxTemplateElement,
            persistedEntries,
            policyValueEntry,
            controlEntries,
        });
    };

    /**
     * Проверяет dirty-состояние формы и обновляет видимость кнопок.
     * Сравнивает текущий снапшот с initialFormSnapshot через JSON.stringify.
     */
    const refreshHeaderAdmxButtons = () => {
        if (initialFormSnapshot === null) {
            setHeaderAdmxButtonsActive(false);
            return;
        }

        const currentSnapshot = buildAdmxFormSnapshot({
            rootElement: admxTemplateElement,
            controlEntries,
        });

        setHeaderAdmxButtonsActive(JSON.stringify(currentSnapshot) !== JSON.stringify(initialFormSnapshot));
    };

    // При первичном рендере кнопки скрыты (isLoading=true).
    setHeaderAdmxButtonsActive(false);

    // -- Обработчики событий ---------------------------------------------------

    /**
     * Обработчик переключения радиокнопок состояния.
     * При смене состояния синхронизирует disabled-статус контролов
     * и проверяет dirty-состояние формы.
     */
    const handleStatePolicyChange = (event) => {
        if (isLoading || isSaving) {
            return;
        }

        const targetElement = event.target;

        if (!(targetElement instanceof HTMLInputElement)) {
            return;
        }

        if (targetElement.name !== 'admx-state') {
            return;
        }

        syncControlsWithPolicyState(admxTemplateElement);
        refreshHeaderAdmxButtons();
    };

    /**
     * Обработчик изменения значений контролов (change + input).
     * Проверяет dirty-состояние формы после каждого изменения.
     */
    const handleControlsChange = (event) => {
        if (isLoading || isSaving) {
            return;
        }

        const targetElement = event.target;

        if (!(targetElement instanceof HTMLElement)) {
            return;
        }

        if (!targetElement.closest('.gp__admx-options')) {
            return;
        }

        refreshHeaderAdmxButtons();
    };

    // Регистрируем все слушатели с управлением жизненным циклом.
    addManagedEventListener(cleanups, statePolicyElement, 'change', handleStatePolicyChange);
    addManagedEventListener(cleanups, admxTemplateElement, 'change', handleControlsChange);
    addManagedEventListener(cleanups, admxTemplateElement, 'input', handleControlsChange);

    /**
     * Обработчик Cancel — откатывает форму к состоянию initialFormSnapshot.
     * Деактивирует кнопки (форма снова совпадает с базовым снапшотом).
     */
    const handleCancel = () => {
        if (!btnCancel?.classList.contains('active') || initialFormSnapshot === null || isLoading || isSaving) {
            return;
        }

        applyAdmxFormSnapshot({
            rootElement: admxTemplateElement,
            snapshot: initialFormSnapshot,
            controlEntries,
        });
        refreshHeaderAdmxButtons();
    };

    /**
     * Обработчик Apply — сохраняет текущие значения на сервер и в localStorage.
     *
     * Алгоритм:
     * 1. Ожидает загрузки nameGpt (файловый путь GPO).
     * 2. Для каждого controlEntry формирует строку "state;value" через buildAdmxSetValue().
     * 3. Отправляет API.set() параллельно для всех контролов.
     * 4. При успехе — сохраняет записи в localStorage через upsertAdmxEntries().
     * 5. Обновляет initialFormSnapshot (форма больше не dirty).
     *
     * При ошибке — прерывает выполнение, isSaving сбрасывается в finally.
     */
    const handleApply = async () => {
        if (!btnApply?.classList.contains('active') || isLoading || isSaving) {
            return;
        }

        try {
            isSaving = true;
            setHeaderAdmxButtonsActive(false);

            const currentNameGpt = await API.waitForNameGpt();

            if (!currentNameGpt) {
                throw new Error('GPO file system path is not available.');
            }

            if (!effectiveTarget) {
                throw new Error('ADMX target is not available.');
            }

            // Параллельно отправляем set-запросы для каждого контрола.
            await Promise.all(controlEntries.map(async (controlEntry) => {
                const controlPath = controlEntry.storagePath || controlEntry.policyPath;

                if (!controlPath) {
                    return;
                }

                const controlElement = getControlElementByStoragePath(admxTemplateElement, controlEntry.storagePath);
                const controlValue = readControlValue(controlElement, controlEntry.metadata);
                const setValue = buildAdmxSetValue(getSelectedAdmxState(admxTemplateElement), controlValue);

                console.log('[ADMX] API.set payload:', {
                    nameGpt: currentNameGpt,
                    target: effectiveTarget,
                    path: controlPath,
                    value: setValue,
                    metadata: metadataPath,
                });

                await API.set(currentNameGpt, effectiveTarget, controlPath, setValue, metadataPath);
            }));

            // Сохраняем в localStorage для fallback при пустом ответе сервера.
            const admxEntries = buildPersistedAdmxEntries({
                rootElement: admxTemplateElement,
                item,
                admxTreePath: effectiveAdmxTreePath,
                controlEntries,
                policyValueEntry,
            });

            const didSave = upsertAdmxEntries(admxEntries);

            if (!didSave) {
                return;
            }

            // Обновляем базовый снапшот — форма больше не dirty.
            initialFormSnapshot = buildAdmxFormSnapshot({
                rootElement: admxTemplateElement,
                controlEntries,
            });
        } catch (error) {
            console.error('[ADMX] Failed to apply policy values.', error);
            return;
        } finally {
            isSaving = false;
            refreshHeaderAdmxButtons();
        }
    };

    // Регистрируем кнопки Apply/Cancel.
    addManagedEventListener(cleanups, btnCancel, 'click', handleCancel);
    addManagedEventListener(cleanups, btnApply, 'click', handleApply);

    // -- Асинхронная загрузка текущих значений ---------------------------------

    /**
     * Загружает текущие значения политики с сервера при открытии шаблона.
     *
     * Алгоритм:
     * 1. Ожидает загрузки nameGpt.
     * 2. Для каждого controlEntry параллельно вызывает API.get_current_value().
     * 3. Парсит ответы через parseAdmxCurrentValue().
     * 4. Если все ответы пустые (hasData=false):
     *    a. Проверяет localStorage → restorePersistedState().
     *    b. Иначе → applyDefaultValuesToAdmxForm().
     * 5. Если есть данные → устанавливает состояние и значения контролов.
     * 6. В finally: isLoading=false, создаёт initialFormSnapshot.
     *
     * При ошибке — fallback на localStorage.
     */
    const loadCurrentAdmxValues = async () => {
        try {
            const currentNameGpt = await API.waitForNameGpt();

            if (!currentNameGpt || !effectiveTarget) {
                applyDefaultValuesToAdmxForm({
                    rootElement: admxTemplateElement,
                    controlEntries,
                });
                return;
            }

            // Параллельно загружаем текущие значения для всех контролов.
            const results = await Promise.all(controlEntries.map(async (controlEntry) => {
                const controlPath = controlEntry.storagePath || controlEntry.policyPath;

                if (!controlPath) {
                    return {
                        controlEntry,
                        parsedValue: {
                            hasData: false,
                            state: ADMX_DEFAULT_STATE,
                            value: null,
                        },
                    };
                }

                console.log('[ADMX] API.get_current_value payload:', {
                    nameGpt: currentNameGpt,
                    target: effectiveTarget,
                    path: controlPath,
                });

                const rawValue = await API.get_current_value(currentNameGpt, effectiveTarget, controlPath);

                console.log('[ADMX] API.get_current_value result:', {
                    path: controlPath,
                    result: rawValue,
                });

                return {
                    controlEntry,
                    parsedValue: parseAdmxCurrentValue(rawValue),
                };
            }));

            // Определяем, есть ли хотя бы один ответ с данными.
            const firstValue = results[0]?.parsedValue ?? null;
            const hasAnyData = results.some(({ parsedValue }) => parsedValue?.hasData);

            if (!hasAnyData) {
                // Все контролы вернули пустой результат.
                // Проверяем localStorage как fallback.
                if (hasPersistedEntries) {
                    console.log('[ADMX] API returned empty values. Restoring persisted local state.');
                    restorePersistedState();
                    return;
                }

                // Нет ни серверных данных, ни localStorage — дефолтные значения.
                applyDefaultValuesToAdmxForm({
                    rootElement: admxTemplateElement,
                    controlEntries,
                });
                return;
            }

            // Есть данные — устанавливаем состояние из первого ответа.
            setSelectedAdmxState(admxTemplateElement, normalizeAdmxState(firstValue?.state));

            // Устанавливаем значения контролов из ответов сервера.
            results.forEach(({ controlEntry, parsedValue }) => {
                const controlElement = getControlElementByStoragePath(admxTemplateElement, controlEntry.storagePath);
                const nextValue = parsedValue?.hasData
                    ? parsedValue.value
                    : getDefaultControlValue(controlEntry.metadata);

                applyControlValue(controlElement, controlEntry.metadata, nextValue);
            });

            syncControlsWithPolicyState(admxTemplateElement);
        } catch (error) {
            console.error('[ADMX] Failed to load current values.', error);
            restorePersistedState();
        } finally {
            // Загрузка завершена — разблокируем форму и создаём базовый снапшот.
            isLoading = false;
            initialFormSnapshot = buildAdmxFormSnapshot({
                rootElement: admxTemplateElement,
                controlEntries,
            });
            setHeaderAdmxButtonsActive(false);
        }
    };

    // Запускаем асинхронную загрузку при создании шаблона.
    loadCurrentAdmxValues();

    // -- Очистка при уничтожении шаблона ---------------------------------------

    /**
     * Функция очистки — вызывается из app.js при переключении на другой элемент дерева.
     * Удаляет все зарегистрированные event listeners и деактивирует кнопки.
     */
    let cleanedUp = false;
    admxTemplate.cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;

        while (cleanups.length > 0) {
            const cleanup = cleanups.pop();
            if (typeof cleanup === 'function') {
                cleanup();
            }
        }

        setHeaderAdmxButtonsActive(false);
    };

    return admxTemplate;
}

    return { renderAdmxTemplate };
});
