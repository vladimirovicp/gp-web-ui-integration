# Предложения по декомпозиции `admx-template.js`

Дата анализа: `2026-05-22`

Исходный файл: `chain/js/components/templates/admx-template.js`

Объем файла: около `1700` строк.

## Краткий вывод

`admx-template.js` сейчас совмещает несколько разных ролей в одном модуле:

- нормализация входных данных политики;
- парсинг ответов API;
- преобразование значений для записи;
- рендеринг DOM-контролов;
- чтение и применение значений формы;
- dirty-checking и управление кнопками `Apply/Cancel`;
- fallback в `localStorage`;
- orchestration жизненного цикла шаблона.

Из-за этого главный риск находится не только в размере файла, но и в высокой связности: изменение логики загрузки, сохранения или рендера почти всегда требует заходить в один и тот же большой модуль.

## Логические блоки, которые уже видны в файле

По текущей структуре функции естественно группируются так:

1. Общие утилиты и нормализация policy data:
   `addManagedEventListener`, `formatExplainText`, `extractStoragePathFromData`, `resolvePolicyPath`, `normalizePolicyEntries`, `getEnumDefaultValue`, `isPlainObject`, `normalizeAdmxState`, `getDefaultControlValue`.

2. Парсинг текущих значений из API:
   `applyDefaultValuesToAdmxForm`, `unwrapCurrentValue`, `parseStringValueAsAdmxState`, `parseAdmxCurrentValue`.

3. Подготовка payload для записи:
   `buildAdmxSetValue`.

4. Рендеринг контролов:
   `createCommonControlAttrs`, `renderUnsupportedControl`, `renderEnumControl`, `renderBooleanControl`, `renderDecimalControl`, `renderTextControl`, `renderControlByType`, `renderAdmxControlRow`.

5. Работа с формой как с state-моделью:
   `setControlsDisabledState`, `getSelectedAdmxState`, `setSelectedAdmxState`, `syncControlsWithPolicyState`, `getControlElementByStoragePath`, `readControlValue`, `applyControlValue`, `buildAdmxFormSnapshot`, `applyAdmxFormSnapshot`.

6. Персистентность и fallback:
   `resolveStoredState`, `restorePersistedAdmxValues`, `hasPersistedAdmxData`, `resolvePolicyValueForState`, `buildPersistedAdmxEntries`.

7. Главный orchestration-слой:
   `renderAdmxTemplate`, включая:
   - подготовку `item/header`;
   - сбор DOM;
   - слушатели;
   - загрузку значений;
   - сохранение;
   - cleanup.

## Рекомендуемое разбиение на файлы

Ниже вариант, который дает хорошую декомпозицию без чрезмерного дробления.

### Вариант 1. Практичный и сбалансированный

Предлагаемая директория:

`chain/js/components/templates/admx/`

Файлы:

1. `admx-template.js`
   Точка входа.
   Оставить только публичный экспорт `renderAdmxTemplate()` и сборку зависимостей.

2. `admx-policy-normalizers.js`
   Сюда вынести:
   `extractStoragePathFromData`, `resolvePolicyPath`, `normalizePolicyEntries`, `getEnumDefaultValue`, `normalizeAdmxState`, `getDefaultControlValue`, `isPlainObject`.

   Почему:
   Это чистые функции без прямой привязки к DOM. Их удобно тестировать отдельно.

3. `admx-value-parser.js`
   Сюда вынести:
   `unwrapCurrentValue`, `parseStringValueAsAdmxState`, `parseAdmxCurrentValue`, `buildAdmxSetValue`.

   Почему:
   Это отдельный слой преобразования API-данных в доменную модель ADMX и обратно.

4. `admx-controls-renderer.js`
   Сюда вынести:
   `createCommonControlAttrs`, `renderUnsupportedControl`, `renderEnumControl`, `renderBooleanControl`, `renderDecimalControl`, `renderTextControl`, `renderControlByType`, `renderAdmxControlRow`, `formatExplainText`.

   Почему:
   Это чистый UI-rendering слой, который отвечает только за создание DOM-структуры.

5. `admx-form-state.js`
   Сюда вынести:
   `setControlsDisabledState`, `getSelectedAdmxState`, `setSelectedAdmxState`, `syncControlsWithPolicyState`, `getControlElementByStoragePath`, `readControlValue`, `applyControlValue`, `buildAdmxFormSnapshot`, `applyAdmxFormSnapshot`, `applyDefaultValuesToAdmxForm`.

   Почему:
   Это единый слой работы с формой после рендера: чтение, применение значений, snapshots, disabled-state.

6. `admx-storage-state.js`
   Сюда вынести:
   `resolveStoredState`, `restorePersistedAdmxValues`, `hasPersistedAdmxData`, `resolvePolicyValueForState`, `buildPersistedAdmxEntries`.

   Почему:
   Здесь отдельная бизнес-логика fallback и сохранения локального состояния.

7. `admx-template-controller.js`
   Сюда вынести из `renderAdmxTemplate`:
   - обработчики `handleStatePolicyChange`, `handleControlsChange`, `handleCancel`, `handleApply`;
   - `loadCurrentAdmxValues`;
   - логику `setHeaderAdmxButtonsActive`, `refreshHeaderAdmxButtons`, `restorePersistedState`;
   - `cleanup`.

   Почему:
   Сейчас именно orchestration делает файл тяжёлым. Вынос контроллера даст самый заметный выигрыш в читаемости.

8. `admx-constants.js`
   Сюда вынести:
   `ADMX_DEFAULT_STATE`, `VALID_ADMX_STATES`.

   Почему:
   Небольшой, но полезный файл. Константы перестанут быть скрытой внутренней зависимостью.

## Более компактный вариант

Если не хочется создавать много файлов, можно начать с 4 модулей:

1. `admx-template.js`
   Только входная точка и экспорт.

2. `admx-template-renderer.js`
   Весь DOM-рендеринг плюс `formatExplainText`.

3. `admx-template-state.js`
   Состояние формы, snapshots, localStorage fallback, парсинг значений, `buildAdmxSetValue`.

4. `admx-template-controller.js`
   Загрузка, сохранение, обработчики событий, lifecycle.

Плюс:

- меньше файлов;
- проще внедрить быстро.

Минус:

- часть бизнес-логики снова смешается;
- через несколько итераций файл `admx-template-state.js` может снова разрастись.

## Самый логичный первый этап выноса

Если делать по шагам и с минимальным риском, порядок лучше такой:

1. Вынести `constants + normalizers + value-parser`.
   Это самый безопасный слой, почти без зависимостей на DOM.

2. Вынести `controls-renderer`.
   Это хорошо уменьшит основной файл визуально.

3. Вынести `form-state`.
   После этого снимется основной объем служебной логики вокруг формы.

4. Последним выделить `template-controller`.
   Этот этап уже лучше делать, когда остальные зависимости стабильно оформлены.

## Рекомендуемые имена файлов

Наиболее логичные имена, если придерживаться текущего стиля проекта:

- `admx-template.js`
- `admx-constants.js`
- `admx-policy-normalizers.js`
- `admx-value-parser.js`
- `admx-controls-renderer.js`
- `admx-form-state.js`
- `admx-storage-state.js`
- `admx-template-controller.js`

Если хочется чуть короче:

- `constants.js`
- `normalizers.js`
- `value-parser.js`
- `controls-renderer.js`
- `form-state.js`
- `storage-state.js`
- `template-controller.js`

Но первый вариант лучше, потому что названия остаются самодокументируемыми и не конфликтуют с другими шаблонами.

## Что оставить в `admx-template.js`

После декомпозиции в `admx-template.js` лучше оставить только:

- импорт зависимостей;
- подготовку входных аргументов;
- создание базовой структуры экрана через renderer;
- вызов controller, который навешивает поведение;
- экспорт `renderAdmxTemplate`.

То есть файл должен стать тонким composition-root, а не местом хранения всей логики.

## Дополнительное наблюдение по качеству структуры

Сейчас `renderAdmxTemplate()` делает сразу несколько вещей:

- нормализует модель данных;
- читает `localStorage`;
- рендерит DOM;
- управляет async загрузкой;
- управляет async сохранением;
- занимается dirty-checking;
- занимается cleanup.

Это хороший кандидат на разделение по принципу:

- `view` — только строит интерфейс;
- `state` — знает, как читать/применять значения;
- `controller` — связывает UI, API и storage.

## Предлагаемая целевая схема зависимостей

```text
admx-template.js
  -> admx-constants.js
  -> admx-policy-normalizers.js
  -> admx-controls-renderer.js
  -> admx-form-state.js
  -> admx-storage-state.js
  -> admx-value-parser.js
  -> admx-template-controller.js
  -> API.js
  -> mainLocalStorage/admx
```

Лучше, чтобы зависимости были направлены так:

- `renderer` не знает про `API`;
- `normalizers` не знают про DOM;
- `value-parser` не знает про `localStorage`;
- `controller` знает обо всех остальных и координирует их.

## Итоговая рекомендация

Оптимальным выглядит разбиение на 7-8 файлов с отдельным `controller` и отдельным `form-state`.

Если нужна минимальная первая итерация, то достаточно начать с выноса в отдельные файлы:

- `admx-policy-normalizers.js`
- `admx-value-parser.js`
- `admx-controls-renderer.js`

Именно это даст быстрый выигрыш в читаемости без тяжелой перестройки поведения.
