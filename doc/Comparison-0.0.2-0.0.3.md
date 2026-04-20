# Сравнение версий 0.0.2 → 0.0.3

## 📊 Общая сводка
- Добавлено файлов: 10
- Изменено файлов: 2
- Удалено файлов: 0
- Переименовано файлов: 0

Ключевой вывод: версия `0.0.3` переводит GPUI из состояния прототипа с жёстко зашитым деревом и автозапуском bundled-скрипта в модульную, data-driven реализацию с загрузкой policy-данных по RPC, отдельными стилями/иконками и новым UI для ADMX/Help/Preferences.

Дополнительные наблюдения:
- `chain/chain.js` не изменился.
- Размер `chain/js/app.js` вырос с `2524` до `4124` строк.
- В `0.0.2` код уже пытался подключать `css/main.css` и `css/other.css`, но самих файлов не было. В `0.0.3` эти ресурсы наконец добавлены.

---

## 🆕 Новая функциональность

- GPUI теперь загружается как AMD-модуль с экспортом `init(...)`, а не как self-executing bundle через `<script>`.
- Дерево политик перестроено на основе реальных policy-данных через RPC `gpo.get_policy`, а не на основе статически зашитого `treeViewList`.
- Добавлен асинхронный lifecycle дерева:
  - статус `Loading policies...`
  - обработка ошибки `Unable to load policies.`
  - автоматическая инициализация первого выбранного узла
- Добавлен полноценный ADMX flow:
  - отдельный шаблон `renderAdmxTemplate`
  - кнопки `Apply`, `Cancel`, `Information`
  - чтение/сохранение значений в `localStorage`
  - нормализация policy entries и поддержка типов `enum`, `boolean`, `decimal`, `text`
- Добавлен help-pane для папок и ADMX-экранов.
- Появились отдельные шаблоны для разных preference-разделов:
  - `shortcuts`
  - `environment`
  - `folders`
  - `registry`
  - `driveMaps`
  - `networkShares`
  - `files`
  - `iniFiles`
- Добавлены CSS и SVG-ресурсы для нормального отображения GPUI.

---

## 🐛 Исправления

- Исправлен способ загрузки GPUI:
  - было: прямое добавление `<script src="js/plugins/chain/js/app.js">`
  - стало: `require(['./js/app'], ...)` с обработкой ошибок и явным вызовом `app.init(...)`
- Исправлена потенциально "голая" загрузка UI без стилей:
  - в `0.0.2` CSS-файлы запрашивались, но отсутствовали в поставке
  - в `0.0.3` соответствующие файлы реально добавлены
- Убрана жёсткая зависимость UI от статически зашитого demo-дерева; дерево теперь строится по данным политики.
- Добавлена безопасная инициализация хранилищ (`safe-storage`, схемы валидации), что снижает риск падений из-за битого `localStorage`.
- Появилась обработка ошибок загрузки policy-данных и fallback-состояния интерфейса.

---

## ♻️ Рефакторинг

- `app.js` переведён из IIFE в AMD-модуль:
  - было: `(() => { ... })();`
  - стало: `define(["freeipa/ipa", "freeipa/rpc"], function(IPA, rpc) { return { init } })`
- Статическое дерево `treeViewList` заменено на pipeline:
  - `convertPolicyCategory`
  - `convertPolicySection`
  - `buildTreeViewList`
  - `loadTreeViewList`
- `treeViewState` переписан:
  - вместо простого `setSelectedItem(...)` появился навигационный state-manager
  - добавлены `selectedPath`, `WeakMap`-ссылки на DOM-узлы и родителей, cleanup текущего view
- Шаблоны preferences обобщены:
  - старый `renderPreferencesTemplate()` был ориентирован фактически на shortcuts
  - новый `renderPreferencesTemplate({ renderTable, getDataFromStorage, header, name })` стал reusable-слоем
- Локализация очищена от части hardcoded-строк:
  - ряд названий preference-разделов переведён на `t(...)`

---

## ⚡ Оптимизация

- Ленивый запуск GPUI через `require(...)` уменьшает жёсткую связанность и позволяет опираться на кэш AMD-loader.
- Выделение стилей и иконок из JS-бандла упрощает сопровождение и уменьшает смешение ответственности.
- Навигация по дереву через `WeakMap` и явное хранение путей делает управление состоянием масштабируемее.

---

## 🔥 Удалённый код

- Удалён старый механизм запуска GPUI через динамическую вставку `<script>`.
- Удалено статически зашитое demo-дерево политик как основной источник данных.
- Удалена старая логика `treeViewState.setSelectedItem(...)` как центральная точка рендера; вместо неё появился более сложный navigation/render lifecycle.
- Явно удалённых файлов нет.

---

## 🏗 Архитектурные изменения

### Новые модули внутри `chain/js/app.js`

В `0.0.3` в bundle появились новые логические модули:

- `src/app/components/tree-view/policy-converter.js`
- `src/app/util/safe-storage.js`
- `src/app/util/mainLocalStorage/admx.js`
- `src/app/components/templates/admx-template.js`
- `src/app/components/templates/folder-template.js`
- `src/app/components/templates/scripts-template.js`
- `src/app/components/templates/preference/templates-*.js`

### Изменение структуры проекта

Структура `0.0.3` стала богаче:

- добавлена папка `chain/css/`
- добавлена папка `chain/img/`
- добавлена иерархия `chain/img/svg/ico/`

Это говорит о переходе от "одного JS-бандла" к более полноценному frontend-пакету с отдельными слоями:

- логика
- стили
- ассеты

### Изменения в зависимостях

Манифестов зависимостей (`package.json`, `requirements.txt` и т.п.) в сравниваемых каталогах нет, поэтому изменений npm/pip-зависимостей не обнаружено.

При этом появились новые runtime-зависимости:

- `gpo.js` теперь зависит от AMD `require`
- `app.js` теперь явно зависит от `freeipa/ipa` и `freeipa/rpc`
- CSS теперь зависит от наличия SVG-иконок в `img/svg/...`

---

## ⚠️ Влияние изменений

### Потенциальные риски

- `policyName`, передаваемый из `gpo.js` в `app.init(...)`, в `app.js` фактически не используется.
  Причина риска: выбранный GPO в модальном окне может не влиять на загружаемое содержимое GPUI.
- `path` в `gpo.js` захардкожен как `'/'`.
  Причина риска: `get_policy` может всегда загружать корневую структуру, а не политику конкретного выбранного объекта.
- В коде остался `HELP_PLACEHOLDER` с заглушечным текстом.
  Причина риска: пользователь может увидеть техническую заглушку в production UI.
- В проект добавлены дублирующиеся ассеты:
  - `img/arrow.svg` == `img/svg/arrow.svg`
  - `img/close.svg` == `img/svg/close.svg`
  Причина риска: рассинхронизация файлов при последующих изменениях.
- Значение `currentLang` изменено с `ru` на `en`.
  Причина риска: русскоязычный интерфейс по умолчанию больше не гарантирован.

### Обратная совместимость

- `0.0.3` несовместима со старым способом запуска `app.js` из `0.0.2`, потому что теперь модуль ожидает AMD-загрузку и экспорт `init`.
- При неполной поставке ассетов (`css/`, `img/`) интерфейс версии `0.0.3` будет отображаться некорректно.
- Регистрация сущности `gpo` и базовые `edit/save/gpui` actions сохранены, поэтому внешняя точка входа плагина в целом не ломается.

### Возможные проблемы при эксплуатации

- Если RPC `gpo.get_policy` отвечает долго или ошибкой, дерево политик останется в состоянии загрузки/ошибки и GPUI не инициализируется полноценно.
- Часть preference-разделов пока реализована как заглушки "в процессе реализации", то есть coverage UI расширился, но не все разделы функциональны.

---

## 📂 Изменения по файлам

### `chain/gpo.js`

**Тип изменения:** изменён

**Описание:**

Изменён способ запуска GPUI внутри модального окна. Вместо динамической вставки script-тега используется AMD-загрузка модуля и явный вызов `app.init(...)`.

**Причина:**

Логично выглядит как переход к управляемой модульной инициализации, чтобы:

- избежать повторной "слепой" загрузки скрипта
- получить обработку ошибок загрузки
- унифицировать контракт между `gpo.js` и `app.js`

**Новые функции:**

- новых top-level функций не добавлено
- добавлена новая логика инициализации модуля через `require(...)`

**Удалённые функции:**

- нет

**Изменённая логика:**

- `gpui_action.execute_action(...)` теперь:
  - загружает `./js/app` через AMD
  - проверяет наличие `app.init`
  - вызывает `app.init({ containerId, policyName, path })`
  - уведомляет пользователя об ошибке при невозможности загрузить или инициализировать модуль

**Изменения:**

```diff
 define([
     'require',
     'freeipa/ipa',
     'freeipa/phases',
     'freeipa/reg',
     'freeipa/navigation',
     'freeipa/rpc'
 ], function(require, IPA, phases, reg, navigation, rpc) {

-            var script = document.createElement('script');
-            script.src = 'js/plugins/chain/js/app.js';
-            document.body.appendChild(script);
+            require(['./js/app'], function(app) {
+                if (app && typeof app.init === 'function') {
+                    app.init({
+                        containerId: 'gp__container',
+                        policyName: policyName,
+                        path: '/'
+                    });
+                    return;
+                }
+                IPA.notify('Failed to initialize GPUI module', 'error');
+            }, function(err) {
+                IPA.notify('Failed to load GPUI module', 'error');
+                if (window.console && console.error) {
+                    console.error('[gpui] Failed to load app module.', err);
+                }
+            });
```

**Оценка влияния:**

- Плюс: меньше связности и лучше lifecycle инициализации.
- Риск: `policyName` передаётся, но не используется в `app.js`; `path` жёстко задан как `/`.

---

### `chain/js/app.js`

**Тип изменения:** изменён

**Описание:**

Файл радикально переработан. Версия `0.0.2` была в основном прототипом GPUI с жёстко заданным деревом и фокусом на Preferences/Shortcuts. Версия `0.0.3` стала крупным модульным UI-бандлом с:

- AMD-инициализацией
- загрузкой данных политики через RPC
- tree-view с loading/error состояниями
- ADMX templates
- help pane
- валидируемым localStorage
- отдельными шаблонами для разных preference-разделов

**Причина:**

Логически это развитие от demo/mockup-подхода к реальной интеграции с данными GPO/ADMX.

**Новые функции:**

- `init`
- `setTreeItemActive`
- `setFolderOpenedState`
- `convertPolicyCategory`
- `convertPolicySection`
- `buildTreeViewList`
- `loadTreeViewList`
- `renderTreeViewStatus`
- `initializeTreeView`
- `getItemSafe`
- `setItemSafe`
- `ensureInitialized`
- `validateAdmxEntry`
- `validateAdmxSchema`
- `initAdmxStorage`
- `getAdmxFromLocalStorage`
- `saveAdmxToLocalStorage`
- `upsertAdmxEntries`
- `renderAdmxTemplate`
- `renderFolderTemplate`
- `renderScriptsTemplate`
- `waitForPolicy`
- `getPolicy`
- `loadMainPolicy`
- шаблонные функции `renderEnvironmentTemplate`, `renderFoldersTemplate`, `renderRegistryTemplate`, `renderDriveMapsTemplate`, `renderNetworkSharesTemplate`, `renderFilesTemplate`, `renderIniFilesTemplate`

**Удалённые функции / удалённая логика:**

- удалён старый self-executing bootstrap `(() => { ... })();`
- удалён статический `treeViewList` как основной источник дерева
- удалён старый центральный сценарий `treeViewState.setSelectedItem(...)`
- `initShortcutsLocalStorage` заменён на `initShortcutsStorage`

**Изменённая логика:**

- Инициализация переведена на модульный экспорт `init(...)`.
- Дерево стало строиться из `gpo.get_policy`.
- Заголовок расширен кнопками для ADMX и help.
- Появилось управление раскрытием/активацией узлов через state-manager и `WeakMap`.
- Preferences-шаблоны обобщены и стали переиспользуемыми.
- Добавлена валидация localStorage-схем.
- Язык по умолчанию изменён с `ru` на `en`.

**Показательные изменения:**

```diff
-(() => {
+define(["freeipa/ipa", "freeipa/rpc"], function(IPA, rpc) {
+  function init(options) {
```

```diff
-  var currentLang = "ru";
+  var currentLang = "en";
```

```diff
-  var treeViewList = [
-    {
-      title: t("policies.localGroupPolicy"),
-      type: "folder",
-      opened: true,
-      ...
-    }
-  ];
+  function convertPolicyCategory(categoryNode, ctx = {}) { ... }
+  function convertPolicySection(section, sectionClass = "") { ... }
+  function buildTreeViewList(policyData = {}) { ... }
+  async function loadTreeViewList() { ... }
```

```diff
-  function renderTreeView(workspace = null, treeViewState2 = null) {
-    const element = createElement("div", {
-      className: "tree-view",
-      children: [renderTreeViewList(void 0, workspace, treeViewState2)]
-    });
-    return element;
-  }
+  var TREE_VIEW_MESSAGES = {
+    loading: "Loading policies...",
+    error: "Unable to load policies."
+  };
+  async function initializeTreeView(element, workspace = null, treeViewState2 = null) {
+    element.clear();
+    element.append(renderTreeViewStatus("loading"));
+    try {
+      const treeData = await loadTreeViewList();
+      element.clear();
+      element.append(renderTreeViewList(treeData, workspace, treeViewState2));
+      treeViewState2?.initializeSelection?.();
+    } catch (error) {
+      element.clear();
+      element.append(renderTreeViewStatus("error"));
+    }
+  }
```

```diff
   children: [
     createElement("div", {
       className: "gp__control",
       ...
+    }),
+    createElement("div", {
+      className: "gp__control-admx",
+      children: [
+        createElement("button", { className: ["button", "admx__btn-apply"], text: "Применить" }),
+        createElement("button", { className: ["button", "admx__btn-cancel"], text: "Отмена" })
+      ]
+    }),
+    createElement("div", {
+      className: "gp__control-help",
+      children: [
+        createElement("button", { className: ["button", "btn-information"], text: "Сведения" })
+      ]
     })
   ]
```

```diff
+  function getPolicy(path, onSuccess, onError) {
+    var command = rpc.command({
+      entity: "gpo",
+      method: "get_policy",
+      args: [policyPath],
+      options: { version: IPA.api_version },
+      ...
+    });
+    command.execute();
+  }
+
+  function loadMainPolicy(path) {
+    getPolicy(path || "/", function(policy) {
+      mainPolicy = policy;
+      policyLoaded = true;
+      ...
+    });
+  }
```

**Оценка влияния:**

- Плюс: система стала заметно ближе к production-интеграции.
- Плюс: UI теперь опирается на реальные policy-данные.
- Риск: часть новых разделов пока заглушки.
- Риск: `policyName` не используется, help содержит placeholder, а язык по умолчанию сменился.

---

### `chain/css/main.css`

**Тип изменения:** добавлен

**Описание:**

Добавлен основной stylesheet GPUI. Он покрывает:

- layout контейнера, header/footer/main
- tree-view и состояния opened/closed/active
- модальные окна preferences
- формы и поля
- help-pane
- ADMX layout
- иконки через `background-image`

**Причина:**

Без этого файла интерфейс из `app.js` не мог корректно отображаться. Это одновременно новая функциональность и исправление отсутствующих ресурсов.

**Изменения:**

```diff
+ .gp__container {
+   min-width: 1200px;
+ }
+
+ .gp__container .tree-view .icon.ico-computer {
+   background-image: url(../img/svg/ico/computer.svg);
+ }
+
+ .workspace .gp__list-children-help.is-open {
+   width: 432px;
+   padding: 20px;
+ }
+
+ .gp__admx-help.is-open {
+   width: 432px;
+   padding: 20px;
+ }
```

**Оценка влияния:**

- Критично для визуальной работоспособности `0.0.3`.
- Создаёт прямую зависимость от наличия SVG-файлов.

---

### `chain/css/other.css`

**Тип изменения:** добавлен

**Описание:**

Добавлены точечные CSS-override'ы для модального окна GPUI и ADMX radio controls.

**Причина:**

Похоже на compatibility-layer поверх существующих FreeIPA/Bootstrap-стилей.

**Изменения:**

```diff
+ .modal-gpui{
+     width: 100%;
+     height: 100vh;
+ }
+
+ .modal-gpui .modal-dialog .modal-content{
+     height: 90vh;
+ }
+
+ .gp__admx-radio input[type="radio"]{
+     opacity: unset;
+     position: static;
+ }
```

**Оценка влияния:**

- Улучшает интеграцию GPUI внутри modal shell.
- Может влиять на поведение layout в существующей теме FreeIPA.

---

### `chain/img/arrow.svg`

**Тип изменения:** добавлен

**Описание:**

SVG-иконка для раскрытия дерева.

**Причина:**

Используется в `main.css` как `icon-switcher`.

**Примечание:**

Файл полностью дублирует `chain/img/svg/arrow.svg`.

---

### `chain/img/close.svg`

**Тип изменения:** добавлен

**Описание:**

SVG-иконка закрытия модального окна preferences.

**Причина:**

Используется в `main.css` для `.preference__modal-header .close`.

**Примечание:**

Файл полностью дублирует `chain/img/svg/close.svg`.

---

### `chain/img/svg/arrow.svg`

**Тип изменения:** добавлен

**Описание:**

Основной SVG-ресурс для tree-view arrow.

**Причина:**

Используется в CSS-пути `../img/svg/arrow.svg`.

---

### `chain/img/svg/close.svg`

**Тип изменения:** добавлен

**Описание:**

Основной SVG-ресурс для close-icon модальных диалогов.

**Причина:**

Используется в CSS-пути `../../img/svg/close.svg`.

---

### `chain/img/svg/ico/computer.svg`

**Тип изменения:** добавлен

**Описание:**

Иконка узла `Machine` в дереве.

**Причина:**

Поддержка визуального различения типов узлов tree-view.

---

### `chain/img/svg/ico/file.svg`

**Тип изменения:** добавлен

**Описание:**

Иконка файлового/leaf-узла дерева.

**Причина:**

Используется для ADMX/policy/preferences leaf nodes.

---

### `chain/img/svg/ico/folder.svg`

**Тип изменения:** добавлен

**Описание:**

Иконка папки для tree-view.

**Причина:**

Используется для category/folder nodes.

---

### `chain/img/svg/ico/user.svg`

**Тип изменения:** добавлен

**Описание:**

Иконка пользовательской ветки дерева.

**Причина:**

Поддержка визуального различения `User`-раздела.

---

## 📁 Итоговая классификация изменений

### По категориям

**🆕 Новая функциональность**
- AMD bootstrap для GPUI
- загрузка policy-дерева по RPC
- ADMX UI и localStorage persistence
- help pane
- новые preference templates
- CSS/SVG-ассеты

**🐛 Исправления багов**
- исправлена доставка CSS-ресурсов
- исправлен способ загрузки `app.js`
- добавлены error/loading states дерева
- добавлена защита от битого `localStorage`

**♻️ Рефакторинг**
- `app.js` разбит на большее число логических модулей
- статические данные заменены builder-пайплайном
- state-management дерева и шаблонов переработан

**⚡ Оптимизация**
- ленивый запуск GPUI
- более управляемое состояние дерева
- отделение логики/стилей/ассетов

**🔥 Удалённый код**
- удалён старый script injection flow
- удалено статическое demo-дерево как основная модель данных

---

## ✅ Вывод

Версия `0.0.3` является не косметическим обновлением, а существенным шагом в сторону реальной продуктовой интеграции GPUI. Главные изменения касаются не только внешнего вида, но и архитектуры: интерфейс начал работать как модульная система с RPC-загрузкой данных и отдельными слоями хранения, отображения и навигации.

При этом релиз несёт несколько рисков, которые стоит отдельно проверить на code review и smoke-test:

- корректно ли используется выбранный GPO, если `policyName` пока не участвует в загрузке данных
- действительно ли `path: '/'` допустим для всех сценариев
- не попадёт ли `HELP_PLACEHOLDER` в production
- нужны ли дубли SVG в двух каталогах
- приемлема ли смена языка по умолчанию с `ru` на `en`
