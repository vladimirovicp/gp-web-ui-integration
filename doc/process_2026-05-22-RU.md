# Отчет об удалении localStorage из ADMX

Дата: 2026-05-22

## Цель

Удалить все использование `localStorage` в ADMX и оставить работу ADMX только через:

- `API.get_current_value` при открытии
- `API.set` и `API.deletePolicy` при применении
- снимок состояния формы в памяти для `Apply`/`Cancel`

## Измененные файлы

- `chain/js/app.js`
- `chain/js/components/templates/admx-template.js`
- `chain/js/components/templates/admx/admx-template-controller.js`
- удален `chain/js/components/templates/admx/admx-storage-state.js`
- удален `chain/js/util/mainLocalStorage/admx.js`

## Удаленный код localStorage для ADMX

Удалено из runtime:

- импорт `./util/mainLocalStorage/admx` в `chain/js/app.js`
- вызов `initAdmxStorage()` в `chain/js/app.js`
- импорт `../../util/mainLocalStorage/admx` в `chain/js/components/templates/admx-template.js`
- чтение сохраненных записей ADMX через `getAdmxEntriesByPaths(...)`
- передача `persistedEntries` / `hasPersistedEntries` в контроллер ADMX
- импорт `../../../util/mainLocalStorage/admx` в `admx-template-controller.js`
- импорт `./admx-storage-state` в `admx-template-controller.js`
- запись в local storage после успешного `Apply` через `upsertAdmxEntries(...)`
- удаление из local storage для `not-configured` через `removeAdmxEntriesByPaths(...)`
- резервное восстановление из local storage, когда `API.get_current_value` возвращал пустые данные
- резервное восстановление из local storage, когда `API.get_current_value` завершался ошибкой

Удаленные файлы:

- `chain/js/components/templates/admx/admx-storage-state.js`
- `chain/js/util/mainLocalStorage/admx.js`

## Итоговое поведение ADMX

- При открытии политики ADMX значения теперь загружаются только через `API.get_current_value`.
- Если сервер не возвращает значения ADMX, форма инициализируется значениями по умолчанию в памяти.
- Если загрузка завершается ошибкой, форма также инициализируется значениями по умолчанию в памяти.
- `Apply` отправляет только `API.set` или `API.deletePolicy`.
- После успешного `Apply` обновляется только снимок состояния в памяти.
- `Cancel` восстанавливает только снимок состояния в памяти, сохраненный после загрузки или успешного применения.

## Примечания по проверке

Проверены ссылки в коде для:

- `mainLocalStorage/admx`
- `initAdmxStorage`
- `getAdmxEntriesByPaths`
- `upsertAdmxEntries`
- `removeAdmxEntriesByPaths`
- `admx-storage-state`

Оставшихся runtime-ссылок в `chain/js` не найдено.

## Ручные проверки

- Открыть политику ADMX с существующими значениями на стороне сервера и убедиться, что поля заполняются данными с сервера.
- Открыть политику ADMX без значений на стороне сервера и убедиться, что форма стартует в состоянии `not-configured` со значениями контролов по умолчанию.
- Изменить значения ADMX и нажать `Apply`; убедиться, что запросы используют `API.set`.
- Переключить политику в `not-configured` и нажать `Apply`; убедиться, что запросы используют `API.deletePolicy`.
- Изменить поля и нажать `Cancel`; убедиться, что форма возвращается к последнему загруженному/примененному состоянию в памяти.
- Перезагрузить страницу после несохраненных изменений ADMX и убедиться, что несохраненные значения не восстанавливаются из хранилища браузера.
