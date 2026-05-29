# Отчет по текстам для локализации

Дата: 2026-05-25

## Краткий вывод

В проекте уже есть базовый механизм локализации:

- `chain/js/locales/translations.js`
- `chain/js/locales/en.js`
- `chain/js/locales/ru.js`

Сейчас через `t(...)` переведена только часть дерева слева: верхние разделы политик и разделы Preferences. Остальной пользовательский текст в основном прописан прямо в компонентах, FreeIPA-спеках и уведомлениях.

Ниже перечислены места, где находится простой текст, который можно вынести в локали.

## Уже локализовано

### `chain/js/components/tree-view/tree-view-list-data.js`

Используются ключи из `chain/js/locales/*`:

- строка 13: `t('policies.localGroupPolicy')`
- строка 21: `t('policies.machine')`
- строки 28, 80: `t('policies.adminTemplates')`
- строка 36: `t('preferences.title')`
- строка 43: `t('preferences.systemSettings')`
- строка 73: `t('policies.user')`

### `chain/js/components/tree-view/tree-view-preferences.js`

Используются ключи:

- `preferences.shortcuts`
- `preferences.environment`
- `preferences.folders`
- `preferences.registry`
- `preferences.driveMaps`
- `preferences.networkShares`
- `preferences.files`
- `preferences.iniFiles`

## Дерево и рабочая область GPUI

### `chain/js/components/tree-view/tree-view-list-data.js`

Остались строки, заданные напрямую:

- строка 17: `Local group policies templates`
- строка 25: `Machine level policies`
- строка 33: `Machine administrative templates`
- строка 40: `Preferences policies.`
- строка 48: `Policies that set system settings.`
- строка 53: `Настройки системы`
- строка 59: `Скрипты`
- строка 77: `User level policies`
- строка 87: `Настройки`
- строка 93: `Настройки системы`

### `chain/js/components/tree-view/tree-view.js`

Сообщения состояния загрузки:

- строка 8: `Loading policies...`
- строка 9: `Unable to load policies.`

### `chain/js/components/templates/folder-template.js`

Текст блока помощи:

- строки 5-10: `HELP_PLACEHOLDER` с тестовым русским текстом
- строка 60: `Помощь:`

### `chain/js/components/templates/default-template.js`

- строка 15: `Шаблон не определен`

### `chain/js/components/templates/scripts-template.js`

- строка 15: `Шаблон скрипта не реализован`

## ADMX-шаблон политики

### `chain/js/components/templates/admx-template.js`

Текст в карточке политики:

- строка 44: `Политика: `
- строка 53: `Состояние политики:`
- строка 75: `Не сконфигурировано`
- строка 90: `Включено`
- строка 105: `Отключено`
- строка 124: `Описание`
- строка 128: `Опции`
- строка 145: `Поддерживается на:`
- строка 158: `Комментарий:`
- строка 172: `Помощь:`

### `chain/js/components/templates/admx/admx-controls-renderer.js`

- строка 24: `В разработке`

Важно: строки `policyHeader.displayName`, `policyHeader.supportedOn`, `policyHeader.explainText`, `metadata.label` и `label` у enum-опций приходят из данных политик, а не из локалей интерфейса. Их лучше локализовать через выбор правильного набора данных политики или через общий словарь ADMX.

### `chain/js/components/templates/admx/admx-template-controller.js`

Технические ошибки, потенциально видимые через консоль/обработчики:

- строка 141: `GPO file system path is not available.`
- строка 145: `ADMX target is not available.`
- строка 213: `[ADMX] Failed to apply policy values.`
- строка 295: `[ADMX] Failed to load current values.`

## Preferences: общий экран

### `chain/js/components/templates/preference/preferences-view-template.js`

Основной экран Preferences и модальное окно:

- строка 183: `Настройки:`
- строка 195: `Описание:`
- строка 229: `Диалог настроек`
- строка 259: `Основные настройки`
- строка 266: `Общие`
- строка 290: `Отмена`
- строка 303: `Ок`

### `chain/js/components/workspace/preferences-template-common.js`

Общие настройки Preferences:

- строка 27: `Остановить обработку элементов при ошибке`
- строка 47: `Выполнять в контексте безопасности текущего пользователя (опция пользовательских политик)`
- строка 67: `Удалить элемент, если больше не применим`
- строка 88: `Применить только один раз`
- строка 109: `Выбор элементов`
- строка 121: `Описание:`

## Preferences: Shortcuts

### `chain/js/components/templates/preference/shortcuts/preferences-template-shortcuts.js`

Форма создания/редактирования ярлыка:

- строка 22: `Действие:`
- строки 37, 43, 49, 55: `Создать`, `Заменить`, `Обновить`, `Удалить`
- строка 78: `Название:`
- строка 102: `Тип цели:`
- строки 117, 123, 129: `Объект файловой системы`, `URL-адрес`, `Объект оболочки`
- строка 147: `Место нахождения:`
- строки 159, 165, 171, 177, 183, 189, 195, 201, 207, 213, 219, 225, 231, 237, 243, 249: варианты местоположения (`[Укажите полный путь]`, `Рабочий стол`, `Стартовое меню`, ...)
- строка 272: `Целевой путь:`
- строка 296: `Аргументы:`
- строка 325: `Путь к файлу значка:`
- строка 349: `Индекс значка:`
- строка 380: `Начинать:`
- строка 404: `Быстрая клавиша:`
- строка 412: `Введи комбинацию клавиш`
- строка 429: `Запуск:`
- строки 444, 450, 456: `Обычное окно`, `Свёрнутое`, `Увеличенное`
- строка 474: `Комментарий:`

### `chain/js/components/templates/preference/shortcuts/preferences-table-shortcuts.js`

Таблица ярлыков и блок описания:

- строка 6: `Создать`, `Заменить`, `Обновить`, `Удалить`
- строка 14: `Да`, `Нет`
- строки 24-30: `Не обрабатывать элементы в расширении при ошибке:`, `Запускать в контексте пользователя:`, `Удалить, если не применимо:`, `Применить один раз:`, `Отфильтровано:`, `Отключено:`, `Отключено уровнем выше:`
- строка 126: `В настоящий момент политик не добавлено`
- строки 146-149: `Имя`, `Очерёдность`, `Действие`, `Цель`

## Preferences: заглушки разделов

В этих файлах текст заглушек стоит напрямую:

- `chain/js/components/templates/preference/templates-files.js`, строка 15: `Шаблон files в процессе реализации`
- `chain/js/components/templates/preference/templates-environment.js`, строка 15: `Шаблон environment в процессе реализации`
- `chain/js/components/templates/preference/templates-folders.js`, строка 15: `Шаблон folders в процессе реализации`
- `chain/js/components/templates/preference/templates-driveMaps.js`, строка 15: `Шаблон driveMaps в процессе реализации`
- `chain/js/components/templates/preference/templates-iniFiles.js`, строка 15: `Шаблон iniFiles в процессе реализации`
- `chain/js/components/templates/preference/templates-networkShares.js`, строка 15: `Шаблон networkShares в процессе реализации`
- `chain/js/components/templates/preference/templates-registry.js`, строка 15: `Шаблон registry в процессе реализации`

## Header и Footer GPUI

### `chain/js/components/header/header.js`

Кнопки верхней панели:

- строка 20: `Создать`
- строка 24: `Изменить`
- строка 28: `Удалить`
- строка 37: `Применить`
- строка 41: `Отмена`
- строка 50: `Сведения`

### `chain/js/components/footer/footer.js`

Тестовые/служебные кнопки:

- строка 46: `get_current_value`
- строка 53: `set`
- строка 60: `deletePolicy`

Если footer остается только отладочным, эти строки можно не переводить. Если он виден пользователю, их стоит вынести в локали.

## FreeIPA entity: GPO

### `chain/gpo.js`

Спека страниц, таблиц, полей и диалогов:

- строка 34: `Group Policy Objects`
- строка 38: `Policy Name`
- строка 43: `GUID`
- строка 47: `Version`
- строка 51: `Flags`
- строка 58: `Edit`
- строка 63: `GPUI`
- строка 76: `Identity`
- строка 80: `Policy Name`
- строка 85: `GUID`
- строка 90: `Distinguished Name`
- строка 95: `File System Path`
- строка 99: `Version Number`
- строка 103: `Flags`
- строка 111: `Add Group Policy Object`
- строка 115: `Policy Name`
- строка 128: `Edit`
- строка 162: `Edit Group Policy Object: ...`
- строки 168, 176, 189, 196, 205: `Policy Name`, `Command`, `Path`, `JSON Data (for gpo-set-policy)`, `Result`
- строки 178-181: `gpo-get-current-value`, `gpo-list-children`, `gpo-set-policy`, `gpo-get-policy`
- строка 242: `Save`
- строка 304: `Execute Command`
- строка 362: `Cancel`
- строка 388: `Save`
- строка 493: `GPUI`
- строка 518: `GPUI | ...`

Уведомления и сообщения:

- строка 138: `Please select exactly one GPO to edit`
- строки 280-282: успешное обновление/переименование GPO
- строка 288: `Failed to update GPO`
- строка 328: `Invalid JSON data: ...`
- строка 334: `Executing...`
- строка 347: `Command failed`
- строка 352: `Error: ...`
- строка 371: `Failed to load GPO data`
- строка 430: `Version number must be greater than current version ...`
- строка 435: `Using manually specified version: ...`
- строка 442: `No changes made`
- строки 464-466: успешное обновление/переименование GPO
- строка 476: `Failed to update GPO`
- строка 502: `Please select exactly one GPO to edit`
- строка 549: `Failed to initialize GPUI module`
- строка 551: `Failed to load GPUI module`

## FreeIPA entity: Chain

### `chain/chain.js`

Уведомления:

- строка 28: `Please select exactly one chain to enable`
- строка 43: `Chain "... " enabled successfully`
- строка 47: `Failed to enable chain`
- строка 76: `Please select exactly one chain to disable`
- строка 91: `Chain "... " disabled successfully`
- строка 95: `Failed to disable chain`
- строка 123: `Please select exactly one chain to move`
- строка 138: `Chain moved up successfully`
- строка 142: `Failed to move chain up: ...`
- строка 166: `Please select exactly one chain to move`
- строка 181: `Chain moved down successfully`
- строка 185: `Failed to move chain down: ...`
- строка 209: `Please select exactly one GPC to move`
- строка 224: `Unable to determine chain name for move up`
- строка 238: `GPC "... " moved up successfully`
- строка 242: `Failed to move GPC up`
- строка 270: `Please select exactly one GPC to move`
- строка 285: `Unable to determine chain name for move down`
- строка 299: `GPC "... " moved down successfully`
- строка 303: `Failed to move GPC down`

Спека страниц, таблиц, кнопок и диалогов:

- строка 387: `Group Policy Chains`
- строка 393: `Chain Name`
- строка 398: `User Group`
- строка 403: `Computer Group`
- строка 408: `Active`
- строки 422, 427, 432, 437: `Enable`, `Disable`, `Move Up`, `Move Down`
- строки 454-455: `Group Policy Objects`
- строки 459, 465, 470, 475: `Policy Name`, `Container Name`, `File System Path`, `Version`
- строка 486: `Add Group Policy Objects to Chain`
- строка 487: `Remove Group Policy Objects from Chain`
- строки 497, 502: `Move Up`, `Move Down`
- строка 509: `Add Group Policy Chain`
- строка 513: `Chain Name`
- строка 514: `Unique name for the Group Policy Chain`
- строка 521: `User Group`
- строка 522: `Select a user group for this chain`
- строка 535: `Computer Group`
- строка 536: `Select a computer group for this chain`
- строка 548: `Group Policy Links`
- строка 549: `Select Group Policy Objects to link to this chain`
- строка 589: `GROUP Policy`
- строка 593: `Chains`
- строка 597: `Group Policy Objects`

## API и технические ошибки

### `chain/js/util/API.js`

Эти строки сейчас технические, но могут попасть в UI через обработчики ошибок:

- строка 93: `File System Path is empty.`
- строка 101: `Failed to get File System Path: ...`
- строка 165: `Failed to get policy`
- строка 197: `Failed to get current value`
- строка 233: `Failed to set policy`
- строка 264: `Failed to delete policy`

## Данные ADMX-политик

### `chain/js/components/tree-view/policy-en.js`
### `chain/js/components/tree-view/policy-ru.js`

Это большие наборы данных политик. В них есть пользовательский текст:

- `category`
- `help`
- `displayName`
- `header.displayName`
- `header.explainText`
- `header.supportedOn`
- `metadata.label`
- `metadata.items`

Примеры из `policy-en.js`:

- строка 14: `category: "ALT System"`
- строка 21: `displayName: "Permission to use /usr/bin/dvd+rw-booktype"`
- строка 26: `explainText: "..."`
- строка 31: `supportedOn: "At least ALT Platform 8"`
- строка 44: `label: "Who is allowed to execute:"`

Примеры из `policy-ru.js`:

- строка 14: `category: "Компоненты Linux"`
- строка 15: `help: "Содержит настройки ядра операционной системы."`
- строка 26: `displayName: "Действия после проверки подлинности 888"`
- строка 31: `explainText: "..."`
- строка 36: `supportedOn: "10 Платформа ALT как минимум"`

Рекомендация: не переносить весь ADMX-контент в `locales/en.js` и `locales/ru.js`, потому что это не UI-строки, а отдельный большой доменный словарь. Лучше выбирать `policy-en.js` или `policy-ru.js` по текущему языку, либо хранить ADMX-данные отдельно от локалей интерфейса.

## Что вынести в первую очередь

1. Верхнюю панель GPUI: `header.js`.
2. ADMX-экран: `admx-template.js` и `admx-controls-renderer.js`.
3. Preferences: `preferences-view-template.js`, `preferences-template-common.js`, `preferences-template-shortcuts.js`, `preferences-table-shortcuts.js`.
4. Оставшиеся статические ветки дерева в `tree-view-list-data.js`.
5. FreeIPA-спеки и уведомления в `chain/gpo.js` и `chain/chain.js`.
6. Технические ошибки API, если они отображаются пользователю.

## Предлагаемая структура ключей

Можно расширить локали примерно так:

- `common.actions.create/edit/delete/apply/cancel/ok/save`
- `common.status.loading/error/inProgress`
- `tree.*`
- `admx.*`
- `preferences.common.*`
- `preferences.shortcuts.*`
- `preferences.table.*`
- `freeipa.gpo.*`
- `freeipa.chain.*`
- `errors.*`

Для строк с переменными нужны шаблоны, например:

- `freeipa.gpo.updatedSuccessfully: 'GPO "{name}" updated successfully'`
- `freeipa.chain.enabledSuccessfully: 'Chain "{name}" enabled successfully'`
- `errors.failedWithMessage: '{action}: {message}'`

