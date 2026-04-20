define(["freeipa/ipa", "freeipa/rpc", "./locales/en", "./locales/ru"], function(IPA, rpc, en_default, ru_default) {
  function init(options) {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/app/util/element-creator.js
  var ElementCreator = class _ElementCreator {
    /**
     * Создает новый экземпляр ElementCreator
     * @param {string} tagName - Тег элемента (div, span, button и т.д.)
     * @param {Object} options - Опции для создания элемента
     * @param {string|string[]} options.className - CSS класс(ы)
     * @param {string} options.id - ID элемента
     * @param {Object} options.attrs - Дополнительные атрибуты (data-*, aria-*, и т.д.)
     * @param {string} options.text - Текстовое содержимое
     * @param {string} options.html - HTML содержимое (взаимоисключающе с text)
     * @param {Object} options.style - Инлайн стили
     * @param {Object} options.events - Объект с обработчиками событий {click: handler, mouseover: handler}
     * @param {ElementCreator[]|Element[]|string[]} options.children - Дочерние элементы
     */
    constructor(tagName = "div", options = {}) {
      this.element = document.createElement(tagName);
      this.applyOptions(options);
    }
    /**
     * Применяет опции к элементу
     * @private
     */
    applyOptions(options) {
      const {
        className,
        id,
        attrs = {},
        text,
        html,
        style = {},
        events = {},
        children = []
      } = options;
      if (id) {
        this.element.id = id;
      }
      if (className) {
        const classes = Array.isArray(className) ? className : [className];
        this.element.classList.add(...classes.filter(Boolean));
      }
      Object.entries(attrs).forEach(([key, value]) => {
        if (value !== null && value !== void 0) {
          this.element.setAttribute(key, value);
        }
      });
      Object.entries(style).forEach(([key, value]) => {
        this.element.style[key] = value;
      });
      if (text !== void 0 && text !== null) {
        this.element.textContent = text;
      }
      if (html !== void 0 && html !== null) {
        this.element.innerHTML = html;
      }
      Object.entries(events).forEach(([eventName, handler]) => {
        if (typeof handler === "function") {
          this.element.addEventListener(eventName, handler);
        }
      });
      if (Array.isArray(children) && children.length > 0) {
        children.forEach((child) => {
          this.append(child);
        });
      }
    }
    /**
     * Добавляет класс(ы) к элементу
     * @param {string|string[]} className - Класс(ы) для добавления
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    addClass(className) {
      const classes = Array.isArray(className) ? className : [className];
      this.element.classList.add(...classes.filter(Boolean));
      return this;
    }
    /**
     * Удаляет класс(ы) из элемента
     * @param {string|string[]} className - Класс(ы) для удаления
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    removeClass(className) {
      const classes = Array.isArray(className) ? className : [className];
      this.element.classList.remove(...classes.filter(Boolean));
      return this;
    }
    /**
     * Переключает класс элемента
     * @param {string} className - Класс для переключения
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    toggleClass(className) {
      this.element.classList.toggle(className);
      return this;
    }
    /**
     * Устанавливает атрибут элемента
     * @param {string} name - Имя атрибута
     * @param {string} value - Значение атрибута
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    setAttr(name, value) {
      if (value !== null && value !== void 0) {
        this.element.setAttribute(name, value);
      }
      return this;
    }
    /**
     * Удаляет атрибут элемента
     * @param {string} name - Имя атрибута
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    removeAttr(name) {
      this.element.removeAttribute(name);
      return this;
    }
    /**
     * Устанавливает текстовое содержимое
     * @param {string} text - Текст
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    setText(text) {
      this.element.textContent = text;
      return this;
    }
    /**
     * Устанавливает HTML содержимое
     * @param {string} html - HTML строка
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    setHTML(html) {
      this.element.innerHTML = html;
      return this;
    }
    /**
     * Устанавливает инлайн стили
     * @param {Object|string} style - Объект со стилями или CSS строка
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    setStyle(style) {
      if (typeof style === "string") {
        this.element.style.cssText = style;
      } else {
        Object.entries(style).forEach(([key, value]) => {
          this.element.style[key] = value;
        });
      }
      return this;
    }
    /**
     * Добавляет обработчик события
     * @param {string} eventName - Имя события
     * @param {Function} handler - Обработчик события
     * @param {Object} options - Опции addEventListener
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    on(eventName, handler, options) {
      if (typeof handler === "function") {
        this.element.addEventListener(eventName, handler, options);
      }
      return this;
    }
    /**
     * Удаляет обработчик события
     * @param {string} eventName - Имя события
     * @param {Function} handler - Обработчик события
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    off(eventName, handler) {
      if (typeof handler === "function") {
        this.element.removeEventListener(eventName, handler);
      }
      return this;
    }
    /**
     * Добавляет дочерний элемент
     * @param {ElementCreator|Element|string} child - Дочерний элемент или текст
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    append(child) {
      if (child instanceof _ElementCreator) {
        this.element.appendChild(child.getElement());
      } else if (child instanceof Element) {
        this.element.appendChild(child);
      } else if (typeof child === "string") {
        this.element.appendChild(document.createTextNode(child));
      }
      return this;
    }
    /**
     * Добавляет дочерний элемент в начало
     * @param {ElementCreator|Element|string} child - Дочерний элемент или текст
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    prepend(child) {
      if (child instanceof _ElementCreator) {
        this.element.insertBefore(child.getElement(), this.element.firstChild);
      } else if (child instanceof Element) {
        this.element.insertBefore(child, this.element.firstChild);
      } else if (typeof child === "string") {
        this.element.insertBefore(document.createTextNode(child), this.element.firstChild);
      }
      return this;
    }
    /**
     * Очищает содержимое элемента
     * @returns {ElementCreator} - Возвращает this для цепочки вызовов
     */
    clear() {
      this.element.innerHTML = "";
      return this;
    }
    /**
     * Возвращает созданный DOM элемент
     * @returns {Element} - DOM элемент
     */
    getElement() {
      return this.element;
    }
    /**
     * Статический метод для быстрого создания элемента
     * @param {string} tagName - Тег элемента
     * @param {Object} options - Опции для создания элемента
     * @returns {ElementCreator} - Экземпляр ElementCreator
     */
    static create(tagName = "div", options = {}) {
      return new _ElementCreator(tagName, options);
    }
    /**
     * Статический метод для создания элемента из HTML строки
     * @param {string} html - HTML строка
     * @returns {Element} - DOM элемент
     */
    static fromHTML(html) {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      return template.content.firstChild;
    }
  };
  function createElement(tagName = "div", options = {}) {
    return new ElementCreator(tagName, options);
  }
  if (typeof window !== "undefined") {
    window.createElement = createElement;
  }

  // src/app/components/header/header.js
  function renderHeader(container2) {
    const element = createElement("div", {
      className: "gp__header",
      children: [
        createElement("div", {
          className: "gp__search"
        }),
        createElement("div", {
          className: "gp__nav"
        }),
        createElement("div", {
          className: "gp__control",
          children: [
            createElement("button", {
              className: ["button", "preferences__btn-create"],
              text: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C"
            }),
            createElement("button", {
              className: ["button", "preferences__btn-edit"],
              text: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C"
            }),
            createElement("button", {
              className: ["button", "preferences__btn-delete"],
              text: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"
            })
          ]
        }),
        createElement("div", {
          className: "gp__control-admx",
          children: [
            createElement("button", {
              className: ["button", "admx__btn-apply"],
              text: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C"
            }),
            createElement("button", {
              className: ["button", "admx__btn-cancel"],
              text: "\u041E\u0442\u043C\u0435\u043D\u0430"
            })
          ]
        }),
        createElement("div", {
          className: "gp__control-help",
          children: [
            createElement("button", {
              className: ["button", "btn-information"],
              text: "\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u044F"
            })
          ]
        })
      ]
    });
    container2.appendChild(element.getElement());
    return element;
  }

  // src/app/components/tree-view/tree-view-list.js
  function setTreeItemActive(treeItemElement, container2 = document) {
    if (!treeItemElement) {
      return null;
    }
    container2.querySelectorAll(".tree-item.active").forEach((currentTreeItem) => {
      if (currentTreeItem !== treeItemElement) {
        currentTreeItem.classList.remove("active");
      }
    });
    treeItemElement.classList.add("active");
    return treeItemElement;
  }
  function setFolderOpenedState(listItemElement, item, opened) {
    if (item?.type !== "folder") {
      return Boolean(item?.opened);
    }
    if (!listItemElement) {
      item.opened = Boolean(opened);
      return item.opened;
    }
    const shouldOpen = Boolean(opened);
    const nestedList = listItemElement.querySelector(":scope > ul.tree-view__list");
    item.opened = shouldOpen;
    listItemElement.classList.toggle("opened", shouldOpen);
    listItemElement.classList.toggle("closed", !shouldOpen);
    if (nestedList) {
      nestedList.style.display = shouldOpen ? "" : "none";
    }
    return shouldOpen;
  }
  function toggleFolder(listItemElement, item) {
    return setFolderOpenedState(listItemElement, item, !item?.opened);
  }
  function renderTreeItem(item, treeViewState2, parentItem = null) {
    const classes = ["view"];
    if (item.type === "folder") {
      classes.push("folder");
      classes.push(item.opened ? "opened" : "closed");
    } else {
      classes.push("file");
    }
    const treeItem = createElement("span", {
      className: "tree-item",
      children: []
    });
    if (item.type === "folder") {
      treeItem.append(createElement("span", {
        className: "icon-switcher"
      }));
    }
    if (item.icon) {
      treeItem.append(createElement("span", {
        className: ["icon", item.icon]
      }));
    }
    treeItem.append(createElement("span", {
      className: "tree-item__title",
      text: item.title
    }));
    const listItem = createElement("li", {
      className: classes,
      children: [treeItem]
    });
    if (treeViewState2) {
      treeViewState2.registerTreeNode(item, {
        treeItemElement: treeItem.getElement(),
        listItemElement: listItem.getElement(),
        parentItem
      });
    }
    if (item.children && item.children.length > 0) {
      const nestedList = renderTreeList(item.children, treeViewState2, item);
      listItem.append(nestedList);
      if (item.type === "folder") {
        setFolderOpenedState(listItem.getElement(), item, item.opened);
      }
    }
    treeItem.on("click", (event) => {
      event.stopPropagation();
      const clickedElement = event.currentTarget;
      if (treeViewState2) {
        if (item.type === "folder" && item.children && item.children.length > 0) {
          treeViewState2.toggleFolder(item);
        }
        treeViewState2.navigateToNode(item, {
          treeItemElement: clickedElement,
          openPath: true
        });
        return;
      }
      setTreeItemActive(clickedElement);
      if (item.type === "folder" && item.children && item.children.length > 0) {
        toggleFolder(listItem.getElement(), item);
      }
    });
    return listItem;
  }
  function renderTreeList(items, treeViewState2, parentItem = null) {
    return createElement("ul", {
      className: "tree-view__list",
      children: items.map((item) => renderTreeItem(item, treeViewState2, parentItem))
    });
  }
  function renderTreeViewList(data = [], workspace = null, treeViewState2 = null) {
    const treeData = Array.isArray(data) ? data : [];
    if (workspace && treeViewState2) {
      treeViewState2.setWorkspace(workspace);
      treeViewState2.setTreeData(treeData);
    }
    return renderTreeList(treeData, treeViewState2);
  }


  // src/app/locales/translations.js
  var translations = { en: en_default, ru: ru_default };
  var currentLang = "en";
  function t(key) {
    const keys = key.split(".");
    let value = translations[currentLang];
    for (const k of keys) {
      if (value && value[k] !== void 0) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  }

  // src/app/components/tree-view/tree-view-preferences.js
  var treepreferences = [
    {
      title: t("preferences.shortcuts"),
      name: "shortcuts",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    },
    {
      title: t("preferences.environment"),
      name: "environment",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    },
    {
      title: t("preferences.folders"),
      name: "folders",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    },
    {
      title: t("preferences.registry"),
      name: "registry",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    },
    {
      title: t("preferences.driveMaps"),
      name: "driveMaps",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    },
    {
      title: t("preferences.networkShares"),
      name: "networkShares",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    },
    {
      title: t("preferences.files"),
      name: "files",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    },
    {
      title: t("preferences.iniFiles"),
      name: "iniFiles",
      type: "file",
      icon: "ico-file",
      template: "preferences",
      header: {
        class: "Machine"
      }
    }
  ];

  // src/app/components/tree-view/policy-converter.js
  function convertPolicyCategory(categoryNode, ctx = {}) {
    const hasInherited = categoryNode.inherited && categoryNode.inherited.length > 0;
    const hasPolicies = categoryNode.policies && Object.keys(categoryNode.policies).length > 0;
    if (!hasInherited && !hasPolicies) {
      return null;
    }
    const sectionClass = ctx.sectionClass || "";
    const baseSegments = Array.isArray(ctx.pathSegments) ? ctx.pathSegments : [];
    const currentCategorySegments = [...baseSegments, categoryNode.category];
    const currentCategoryPath = currentCategorySegments.join("/");
    const children = [];
    if (hasInherited) {
      for (const subCategory of categoryNode.inherited) {
        const converted = convertPolicyCategory(subCategory, {
          sectionClass,
          pathSegments: [...currentCategorySegments, "inherited"]
        });
        if (converted !== null) {
          children.push(converted);
        }
      }
    }
    if (hasPolicies) {
      for (const [key, policy] of Object.entries(categoryNode.policies)) {
        children.push({
          title: policy.displayName,
          type: "file",
          icon: "ico-file",
          policyKey: key,
          policyData: policy,
          template: "admx",
          admxTreePath: [...currentCategorySegments, "policies"].join("/")
        });
      }
    }
    return {
      title: categoryNode.category,
      type: "folder",
      opened: false,
      icon: "ico-folder",
      children: children.length > 0 ? children : void 0
    };
  }
  function convertPolicySection(section, sectionClass = "") {
    if (!section || !section.categories) return [];
    return section.categories.map((cat) => convertPolicyCategory(cat, {
      sectionClass,
      pathSegments: [sectionClass, "categories"]
    })).filter((cat) => cat !== null);
  }

  // src/app/components/tree-view/tree-view-list-data.js
  function buildTreeViewList(policyData = {}) {
    const machineCategories = convertPolicySection(policyData.Machine, "Machine");
    const userCategories = convertPolicySection(policyData.User, "User");
    return [
      {
        title: t("policies.localGroupPolicy"),
        type: "folder",
        opened: true,
        icon: null,
        help: "Local group policies templates",
        children: [
          {
            title: t("policies.machine"),
            type: "folder",
            opened: true,
            icon: "ico-computer",
            help: "Machine level policies",
            children: [
              {
                title: t("policies.adminTemplates"),
                type: "folder",
                opened: true,
                icon: "ico-folder",
                children: machineCategories,
                help: "Machine administrative templates"
              },
              {
                title: t("preferences.title"),
                type: "folder",
                opened: false,
                icon: "ico-folder",
                help: "Preferences policies.",
                children: [
                  {
                    title: t("preferences.systemSettings"),
                    //'Настройки системы',
                    type: "folder",
                    opened: false,
                    icon: "ico-folder",
                    children: treepreferences,
                    help: "Policies that set system settings."
                  }
                ]
              },
              {
                title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B",
                type: "folder",
                opened: false,
                icon: "ico-folder",
                children: [
                  {
                    title: "\u0421\u043A\u0440\u0438\u043F\u0442\u044B",
                    type: "file",
                    opened: false,
                    icon: "ico-file",
                    template: "scripts",
                    header: {
                      class: "Machine"
                    }
                  }
                ]
              }
            ]
          },
          {
            title: t("policies.user"),
            type: "folder",
            opened: false,
            icon: "ico-user",
            help: "User level policies",
            children: [
              {
                title: t("policies.adminTemplates"),
                type: "folder",
                opened: false,
                icon: "ico-folder",
                children: userCategories
              },
              {
                title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
                type: "folder",
                opened: false,
                icon: "ico-folder"
              },
              {
                title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B",
                type: "folder",
                opened: false,
                icon: "ico-folder"
              }
            ]
          }
        ]
      }
    ];
  }
  async function loadTreeViewList() {
    console.log('[loadTreeViewList] Starting, mainPolicy:', mainPolicy ? 'exists' : 'null');

    // Ждём пока mainPolicy будет не null
    await waitForPolicy(function(policyData) {
      console.log('[loadTreeViewList] waitForPolicy resolved, setting mainPolicy');
      // mainPolicy уже установлен в loadMainPolicy, ничего делать не нужно
    });

    console.log('[loadTreeViewList] After await, mainPolicy:', mainPolicy ? 'exists' : 'null');
    
    // Теперь mainPolicy гарантированно содержит данные
    const policyModule = mainPolicy;
    const policyData = policyModule?.default ?? policyModule;
    console.log('[loadTreeViewList] policyData:', policyData ? 'OK' : 'null');
    return buildTreeViewList(policyData);
  }

  // src/app/components/tree-view/tree-view.js
  var TREE_VIEW_MESSAGES = {
    loading: "Loading policies...",
    error: "Unable to load policies."
  };
  function renderTreeViewStatus(type = "loading") {
    const isError = type === "error";
    const children = [];
    if (!isError) {
      children.push(createElement("span", {
        className: "tree-view__status-spinner",
        attrs: {
          "aria-hidden": "true"
        }
      }));
    }
    children.push(createElement("span", {
      className: "tree-view__status-text",
      text: isError ? TREE_VIEW_MESSAGES.error : TREE_VIEW_MESSAGES.loading
    }));
    return createElement("div", {
      className: ["tree-view__status", isError ? "tree-view__status--error" : "tree-view__status--loading"],
      attrs: {
        role: isError ? "alert" : "status",
        "aria-live": isError ? "assertive" : "polite"
      },
      children
    });
  }
  async function initializeTreeView(element, workspace = null, treeViewState2 = null) {
    if (workspace && treeViewState2) {
      treeViewState2.setWorkspace(workspace);
      treeViewState2.setTreeData([]);
    }
    element.clear();
    element.append(renderTreeViewStatus("loading"));
    try {
      const treeData = await loadTreeViewList();
      element.clear();
      element.append(renderTreeViewList(treeData, workspace, treeViewState2));
      treeViewState2?.initializeSelection?.();
    } catch (error) {
      console.error("[tree-view] Failed to load policy-en.json.", error);
      if (workspace) {
        workspace.clear();
      }
      if (treeViewState2) {
        treeViewState2.setTreeData([]);
        treeViewState2.syncHelpButtonState?.();
        treeViewState2.syncHelpBlockState?.();
      }
      element.clear();
      element.append(renderTreeViewStatus("error"));
    }
  }
  function renderTreeView(workspace = null, treeViewState2 = null) {
    const element = createElement("div", {
      className: "tree-view"
    });
    void initializeTreeView(element, workspace, treeViewState2);
    return element;
  }

  // src/app/components/divider/divider.js
  function renderDivider() {
    const dividerLine = createElement("div", {
      className: "divider__line"
    });
    const element = createElement("div", {
      className: "divider",
      children: [dividerLine]
    });
    return element;
  }

  // src/app/components/workspace/workspace.js
  function renderWorkspace() {
    const element = createElement("div", {
      className: "workspace"
    });
    return element;
  }

  // src/app/components/main/main.js
  function renderMain(container2, treeViewState2) {
    const workspace = renderWorkspace();
    const treeView = renderTreeView(workspace, treeViewState2);
    const divider = renderDivider();
    const main = createElement("div", {
      className: "gp__main",
      children: [treeView, divider, workspace]
    });
    container2.appendChild(main.getElement());
    return { main, treeView, divider, workspace };
  }

  // src/app/components/footer/footer.js
  function renderFooter(container2) {
    const element = createElement("div", {
      className: "gp__footer"
    });
    container2.appendChild(element.getElement());
    return element.getElement();
  }

  // src/app/util/resizable.js
  function resizable(divider, panel, container2, options = {}) {
    if (!divider || !panel || !container2) {
      return () => {
      };
    }
    const minWidth = options.minWidth || 50;
    const maxWidth = options.maxWidth || container2.offsetWidth - 50;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    const handleMouseDown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = panel.offsetWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    };
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = startWidth + (e.clientX - startX);
      const calculatedMaxWidth = maxWidth === container2.offsetWidth - 50 ? container2.offsetWidth - 50 : maxWidth;
      if (newWidth >= minWidth && newWidth <= calculatedMaxWidth) {
        panel.style.width = `${newWidth}px`;
      }
    };
    const stopResizing = () => {
      isResizing = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    divider.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    return () => {
      divider.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
      stopResizing();
    };
  }

  // src/app/components/templates/default-template.js
  function renderDefaultTemplate() {
    const defaultTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D \u043D\u0435 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D"
        })
      ]
    });
    return defaultTemplate;
  }

  // src/app/components/templates/scripts-template.js
  function renderScriptsTemplate() {
    const defaultTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D \u0441\u043A\u0440\u0438\u043F\u0442\u0430 \u043D\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u043D"
        })
      ]
    });
    return defaultTemplate;
  }

  // src/app/util/safe-storage.js
  function getItemSafe(key, schema, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      if (typeof schema === "function" && !schema(parsed)) {
        console.warn(
          `[safe-storage] "${key}": data failed schema validation, using fallback`
        );
        return fallback;
      }
      return parsed;
    } catch (error) {
      console.warn(
        `[safe-storage] "${key}": read/parse error, using fallback`,
        error
      );
      return fallback;
    }
  }
  function setItemSafe(key, value, schema = null) {
    try {
      if (typeof schema === "function" && !schema(value)) {
        console.warn(
          `[safe-storage] "${key}": value failed schema validation, write rejected`
        );
        return false;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[safe-storage] "${key}": write error`, error);
      return false;
    }
  }
  function ensureInitialized(key, seed, schema = null) {
    const existing = getItemSafe(key, schema, void 0);
    if (existing !== void 0) return false;
    return setItemSafe(key, seed, schema);
  }

  // src/app/util/mainLocalStorage/admx.js
  var STORAGE_KEY = "admx";
  var VALID_STATES = /* @__PURE__ */ new Set(["not-configured", "enabled", "disabled"]);
  function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function validateAdmxEntry(entry, key) {
    if (!isPlainObject(entry)) {
      return false;
    }
    if (entry.path !== key) {
      return false;
    }
    if (typeof entry.type !== "string" || entry.type.length === 0) {
      return false;
    }
    if (!VALID_STATES.has(entry.state)) {
      return false;
    }
    return Object.prototype.hasOwnProperty.call(entry, "value");
  }
  function validateAdmxSchema(data) {
    if (!isPlainObject(data)) {
      return false;
    }
    return Object.entries(data).every(([key, value]) => validateAdmxEntry(value, key));
  }
  function initAdmxStorage() {
    return ensureInitialized(STORAGE_KEY, {}, validateAdmxSchema);
  }
  function getAdmxFromLocalStorage() {
    return getItemSafe(STORAGE_KEY, validateAdmxSchema, {});
  }
  function saveAdmxToLocalStorage(admxData) {
    return setItemSafe(STORAGE_KEY, admxData, validateAdmxSchema);
  }
  function getAdmxEntriesByPaths(paths = []) {
    const admx = getAdmxFromLocalStorage();
    return paths.reduce((accumulator, path) => {
      if (typeof path !== "string" || path.length === 0) {
        return accumulator;
      }
      if (Object.prototype.hasOwnProperty.call(admx, path)) {
        accumulator[path] = admx[path];
      }
      return accumulator;
    }, {});
  }
  function upsertAdmxEntries(entries = []) {
    if (!Array.isArray(entries)) {
      return false;
    }
    const admx = getAdmxFromLocalStorage();
    entries.forEach((entry) => {
      if (!isPlainObject(entry) || typeof entry.path !== "string" || entry.path.length === 0) {
        return;
      }
      admx[entry.path] = entry;
    });
    return saveAdmxToLocalStorage(admx);
  }

  // src/app/components/templates/admx-template.js
  var ADMX_DEFAULT_STATE = "not-configured";
  function addManagedEventListener(cleanups, target, eventName, handler, options) {
    if (!target || typeof target.addEventListener !== "function" || typeof handler !== "function") {
      return;
    }
    target.addEventListener(eventName, handler, options);
    cleanups.push(() => target.removeEventListener(eventName, handler, options));
  }
  function formatExplainText(explainText = "") {
    return explainText.split(/\r?\n/).flatMap((line, index, lines) => index < lines.length - 1 ? [line, createElement("br")] : [line]);
  }
  function extractStoragePathFromData(data = "") {
    if (typeof data !== "string") {
      return "";
    }
    const match = data.match(/Read_Path_GPT\((['"])(.*?)\1\)/);
    return match?.[2] ?? "";
  }
  function resolvePolicyPath({ entryKey = "", metadata = {}, policyHeader = {} } = {}) {
    if (entryKey.startsWith("\\")) {
      const headerKey = policyHeader?.key ?? "";
      const valueName = metadata?.valueName ?? "";
      if (headerKey && valueName) {
        return `${headerKey}\\${valueName}`;
      }
      if (valueName) {
        return valueName;
      }
    }
    return entryKey;
  }
  function normalizePolicyEntries(policyData = {}, policyHeader = {}) {
    const controlEntries = [];
    let policyValueEntry = null;
    Object.entries(policyData).forEach(([entryKey, entryValue]) => {
      if (entryKey === "displayName" || entryKey === "header") {
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
        storagePath: extractStoragePathFromData(entryValue?.data) || resolvedPolicyPath
      };
      if (metadata.type === "policyValue") {
        if (!policyValueEntry) {
          policyValueEntry = normalizedEntry;
        }
        return;
      }
      controlEntries.push(normalizedEntry);
    });
    return { controlEntries, policyValueEntry };
  }
  function getEnumDefaultValue(items = {}, defaultItem) {
    const itemKeys = Object.keys(items);
    if (itemKeys.length === 0) {
      return "";
    }
    if (defaultItem !== void 0 && defaultItem !== null) {
      const normalizedDefault = String(defaultItem);
      if (Object.prototype.hasOwnProperty.call(items, normalizedDefault)) {
        return normalizedDefault;
      }
    }
    return itemKeys[0];
  }
  function createCommonControlAttrs({ metadata = {}, policyPath = "", storagePath = "", type = "", isDisabled = true } = {}) {
    return {
      name: metadata.id ?? metadata.valueName ?? "admx-control",
      disabled: isDisabled ? "disabled" : null,
      "data-policy-path": policyPath,
      "data-storage-path": storagePath || policyPath,
      "data-policy-type": type
    };
  }
  function renderUnsupportedControl() {
    return createElement("div", {
      className: "field__element",
      text: "\u0412 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0435"
    });
  }
  function renderEnumControl({ metadata = {}, policyPath = "", storagePath = "", isDisabled = true } = {}) {
    const items = metadata.items ?? {};
    const selectedValue = getEnumDefaultValue(items, metadata.defaultItem);
    const optionEntries = Object.entries(items);
    return createElement("div", {
      className: "field__element",
      children: [
        createElement("select", {
          attrs: createCommonControlAttrs({
            metadata,
            policyPath,
            storagePath,
            type: "enum",
            isDisabled
          }),
          children: optionEntries.map(([value, label]) => createElement("option", {
            attrs: {
              value,
              selected: value === selectedValue ? "selected" : null
            },
            text: label
          }))
        })
      ]
    });
  }
  function renderBooleanControl({ metadata = {}, policyPath = "", storagePath = "", isDisabled = true } = {}) {
    return createElement("div", {
      className: "field__element",
      children: [
        createElement("input", {
          attrs: {
            ...createCommonControlAttrs({
              metadata,
              policyPath,
              storagePath,
              type: "boolean",
              isDisabled
            }),
            type: "checkbox"
          }
        })
      ]
    });
  }
  function renderDecimalControl({ metadata = {}, policyPath = "", storagePath = "", isDisabled = true } = {}) {
    return createElement("div", {
      className: "field__element",
      children: [
        createElement("input", {
          attrs: {
            ...createCommonControlAttrs({
              metadata,
              policyPath,
              storagePath,
              type: "decimal",
              isDisabled
            }),
            type: "number",
            min: metadata.minValue ?? null,
            max: metadata.maxValue ?? null,
            value: metadata.defaultValue ?? null
          }
        })
      ]
    });
  }
  function renderTextControl({ metadata = {}, policyPath = "", storagePath = "", isDisabled = true } = {}) {
    return createElement("div", {
      className: "field__element",
      children: [
        createElement("input", {
          attrs: {
            ...createCommonControlAttrs({
              metadata,
              policyPath,
              storagePath,
              type: "text",
              isDisabled
            }),
            type: "text"
          }
        })
      ]
    });
  }
  function renderControlByType({ metadata = {}, policyPath = "", storagePath = "", isDisabled = true } = {}) {
    const type = metadata?.type;
    switch (type) {
      case "enum":
        return renderEnumControl({ metadata, policyPath, storagePath, isDisabled });
      case "boolean":
        return renderBooleanControl({ metadata, policyPath, storagePath, isDisabled });
      case "decimal":
        return renderDecimalControl({ metadata, policyPath, storagePath, isDisabled });
      case "text":
        return renderTextControl({ metadata, policyPath, storagePath, isDisabled });
      case "list":
        return renderUnsupportedControl();
      default:
        return renderUnsupportedControl();
    }
  }
  function renderAdmxControlRow({ metadata = {}, policyPath = "", storagePath = "", isDisabled = true } = {}) {
    return createElement("div", {
      className: "gp__admx-item",
      children: [
        createElement("div", {
          className: "gp__admx-description",
          text: metadata.label ?? ""
        }),
        createElement("div", {
          className: "gp__admx-options",
          children: [
            renderControlByType({ metadata, policyPath, storagePath, isDisabled })
          ]
        })
      ]
    });
  }
  function setControlsDisabledState(rootElement, shouldDisable) {
    if (!rootElement) {
      return;
    }
    const controls = rootElement.querySelectorAll(".gp__admx-options input, .gp__admx-options select, .gp__admx-options textarea");
    controls.forEach((control) => {
      control.disabled = shouldDisable;
    });
  }
  function getSelectedAdmxState(rootElement) {
    return rootElement?.querySelector('input[name="admx-state"]:checked')?.value ?? ADMX_DEFAULT_STATE;
  }
  function setSelectedAdmxState(rootElement, state = ADMX_DEFAULT_STATE) {
    if (!rootElement) {
      return;
    }
    const normalizedState = typeof state === "string" && state.length > 0 ? state : ADMX_DEFAULT_STATE;
    const radioToSelect = rootElement.querySelector(`input[name="admx-state"][value="${CSS.escape(normalizedState)}"]`);
    if (radioToSelect instanceof HTMLInputElement) {
      radioToSelect.checked = true;
    }
  }
  function syncControlsWithPolicyState(rootElement) {
    if (!rootElement) {
      return;
    }
    const currentState = getSelectedAdmxState(rootElement);
    setControlsDisabledState(rootElement, currentState !== "enabled");
  }
  function getControlElementByStoragePath(rootElement, storagePath = "") {
    if (!rootElement || !storagePath) {
      return null;
    }
    return rootElement.querySelector(`[data-storage-path="${CSS.escape(storagePath)}"]`);
  }
  function readControlValue(controlElement, metadata = {}) {
    if (!controlElement) {
      return null;
    }
    switch (metadata?.type) {
      case "boolean": {
        const trueValue = Object.prototype.hasOwnProperty.call(metadata, "trueValue") ? metadata.trueValue : true;
        const falseValue = Object.prototype.hasOwnProperty.call(metadata, "falseValue") ? metadata.falseValue : false;
        return controlElement.checked ? trueValue : falseValue;
      }
      case "decimal": {
        if (controlElement.value === "") {
          return null;
        }
        const parsedValue = Number(controlElement.value);
        return Number.isNaN(parsedValue) ? controlElement.value : parsedValue;
      }
      case "enum":
      case "text":
      default:
        return controlElement.value;
    }
  }
  function applyControlValue(controlElement, metadata = {}, value = null) {
    if (!controlElement || value === void 0) {
      return;
    }
    switch (metadata?.type) {
      case "boolean": {
        const trueValue = Object.prototype.hasOwnProperty.call(metadata, "trueValue") ? metadata.trueValue : true;
        controlElement.checked = value === true || String(value) === String(trueValue);
        return;
      }
      case "decimal":
      case "enum":
      case "text":
      default:
        controlElement.value = value ?? "";
    }
  }
  function buildAdmxFormSnapshot({ rootElement, controlEntries = [] } = {}) {
    return {
      state: getSelectedAdmxState(rootElement),
      controls: controlEntries.map(({ storagePath, metadata }) => {
        const controlElement = getControlElementByStoragePath(rootElement, storagePath);
        return {
          path: storagePath,
          type: metadata?.type ?? "",
          value: readControlValue(controlElement, metadata)
        };
      })
    };
  }
  function applyAdmxFormSnapshot({ rootElement, snapshot = null, controlEntries = [] } = {}) {
    if (!rootElement || !snapshot) {
      return;
    }
    setSelectedAdmxState(rootElement, snapshot.state);
    const snapshotEntries = new Map(
      Array.isArray(snapshot.controls) ? snapshot.controls.map((entry) => [entry.path, entry]) : []
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
  function resolveStoredState({ persistedEntries = {}, policyValueEntry = null, controlEntries = [] } = {}) {
    const candidatePaths = [
      policyValueEntry?.storagePath ?? null,
      ...controlEntries.map(({ storagePath }) => storagePath)
    ].filter(Boolean);
    for (const path of candidatePaths) {
      const persistedEntry = persistedEntries[path];
      if (persistedEntry?.state) {
        return persistedEntry.state;
      }
    }
    return ADMX_DEFAULT_STATE;
  }
  function restorePersistedAdmxValues({ rootElement, persistedEntries = {}, policyValueEntry = null, controlEntries = [] } = {}) {
    if (!rootElement) {
      return;
    }
    const restoredState = resolveStoredState({
      persistedEntries,
      policyValueEntry,
      controlEntries
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
  function resolvePolicyValueForState(policyValueEntry = null, state = ADMX_DEFAULT_STATE) {
    if (!policyValueEntry?.metadata) {
      return null;
    }
    if (state === "enabled") {
      return policyValueEntry.metadata.enabledValue ?? null;
    }
    if (state === "disabled") {
      return policyValueEntry.metadata.disabledValue ?? null;
    }
    return null;
  }
  function buildPersistedAdmxEntries({
    rootElement,
    item = {},
    admxTreePath = null,
    controlEntries = [],
    policyValueEntry = null
  } = {}) {
    const state = getSelectedAdmxState(rootElement);
    const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const policyTitle = item?.title ?? item?.policyData?.header?.displayName ?? null;
    const policyKey = item?.policyKey ?? null;
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;
    const entriesByPath = /* @__PURE__ */ new Map();
    controlEntries.forEach(({ storagePath, metadata }) => {
      if (!storagePath) {
        return;
      }
      const controlElement = getControlElementByStoragePath(rootElement, storagePath);
      entriesByPath.set(storagePath, {
        path: storagePath,
        state,
        type: metadata?.type ?? "unknown",
        value: readControlValue(controlElement, metadata),
        policyKey,
        policyTitle,
        admxTreePath: effectiveAdmxTreePath,
        updatedAt
      });
    });
    if (policyValueEntry?.storagePath) {
      entriesByPath.set(policyValueEntry.storagePath, {
        path: policyValueEntry.storagePath,
        state,
        type: "policyValue",
        value: resolvePolicyValueForState(policyValueEntry, state),
        policyKey,
        policyTitle,
        admxTreePath: effectiveAdmxTreePath,
        updatedAt
      });
    }
    return [...entriesByPath.values()];
  }
  function renderAdmxTemplate({ isHelpOpen = false, item = {}, admxTreePath = null, header = null } = {}) {
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;
    const headerEl = header?.getElement?.();
    const btnApply = headerEl?.querySelector(".admx__btn-apply") ?? null;
    const btnCancel = headerEl?.querySelector(".admx__btn-cancel") ?? null;
    const cleanups = [];
    const policyData = item.policyData ?? {};
    const policyHeader = policyData.header ?? {};
    const { controlEntries, policyValueEntry } = normalizePolicyEntries(policyData, policyHeader);
    const persistedEntries = getAdmxEntriesByPaths([
      policyValueEntry?.storagePath ?? null,
      ...controlEntries.map(({ storagePath }) => storagePath)
    ].filter(Boolean));
    const controlRows = controlEntries.map(({ metadata, policyPath, storagePath }) => renderAdmxControlRow({
      metadata,
      policyPath,
      storagePath,
      isDisabled: true
    }));
    const admxTemplate = createElement("div", {
      className: "gp__admx-wrapper",
      children: [
        createElement("div", {
          className: "gp__admx",
          children: [
            createElement("div", {
              className: "gp__admx-settings",
              children: [
                createElement("div", {
                  className: "title",
                  children: [
                    "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430: ",
                    createElement("span", {
                      className: "title__name",
                      text: policyHeader.displayName ?? ""
                    })
                  ]
                }),
                createElement("div", {
                  className: "gp__admx-state-policy-title",
                  text: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0438:"
                }),
                createElement("div", {
                  className: "gp__admx-state-policy",
                  attrs: {
                    "data-policy-path": policyValueEntry?.policyPath ?? null,
                    "data-enabled-value": policyValueEntry?.metadata?.enabledValue ?? null,
                    "data-disabled-value": policyValueEntry?.metadata?.disabledValue ?? null
                  },
                  children: [
                    createElement("label", {
                      className: "gp__admx-radio",
                      children: [
                        createElement("input", {
                          attrs: {
                            type: "radio",
                            name: "admx-state",
                            value: "not-configured",
                            checked: "checked"
                          }
                        }),
                        createElement("span", {
                          text: "\u041D\u0435 \u0441\u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E"
                        })
                      ]
                    }),
                    createElement("label", {
                      className: "gp__admx-radio",
                      children: [
                        createElement("input", {
                          attrs: {
                            type: "radio",
                            name: "admx-state",
                            value: "enabled"
                          }
                        }),
                        createElement("span", {
                          text: "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E"
                        })
                      ]
                    }),
                    createElement("label", {
                      className: "gp__admx-radio",
                      children: [
                        createElement("input", {
                          attrs: {
                            type: "radio",
                            name: "admx-state",
                            value: "disabled"
                          }
                        }),
                        createElement("span", {
                          text: "\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E"
                        })
                      ]
                    })
                  ]
                }),
                createElement("div", {
                  className: "field__line"
                })
              ]
            }),
            createElement("div", {
              className: "gp__admx-info",
              children: [
                createElement("div", {
                  className: "gp__admx-item",
                  children: [
                    createElement("div", {
                      className: "gp__admx-description",
                      text: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
                    }),
                    createElement("div", {
                      className: "gp__admx-options",
                      text: "\u041E\u043F\u0446\u0438\u0438"
                    })
                  ]
                }),
                ...controlRows
              ]
            })
          ]
        }),
        createElement("div", {
          className: ["gp__admx-help", isHelpOpen ? "is-open" : null],
          children: [
            createElement("div", {
              className: "gp__admx-supported",
              children: [
                createElement("div", {
                  className: "title",
                  text: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043D\u0430:"
                }),
                createElement("div", {
                  className: "gp__admx-content",
                  text: policyHeader.supportedOn ?? ""
                })
              ]
            }),
            createElement("div", {
              className: "gp__admx-comment",
              children: [
                createElement("div", {
                  className: "title",
                  text: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439:"
                }),
                createElement("textarea", {
                  attrs: {
                    name: "comment"
                  }
                })
              ]
            }),
            createElement("div", {
              className: "gp__admx-text-help",
              children: [
                createElement("div", {
                  className: "title",
                  text: "\u041F\u043E\u043C\u043E\u0449\u044C:"
                }),
                createElement("div", {
                  className: "gp__admx-content",
                  children: formatExplainText(policyHeader.explainText)
                })
              ]
            })
          ]
        })
      ]
    });
    const admxTemplateElement = admxTemplate.getElement();
    const statePolicyElement = admxTemplateElement.querySelector(".gp__admx-state-policy");
    const setHeaderAdmxButtonsActive = (active) => {
      if (btnApply) btnApply.classList.toggle("active", active);
      if (btnCancel) btnCancel.classList.toggle("active", active);
    };
    restorePersistedAdmxValues({
      rootElement: admxTemplateElement,
      persistedEntries,
      policyValueEntry,
      controlEntries
    });
    let initialFormSnapshot = buildAdmxFormSnapshot({
      rootElement: admxTemplateElement,
      controlEntries
    });
    const refreshHeaderAdmxButtons = () => {
      const currentSnapshot = buildAdmxFormSnapshot({
        rootElement: admxTemplateElement,
        controlEntries
      });
      setHeaderAdmxButtonsActive(JSON.stringify(currentSnapshot) !== JSON.stringify(initialFormSnapshot));
    };
    setHeaderAdmxButtonsActive(false);
    const handleStatePolicyChange = (event) => {
      const targetElement = event.target;
      if (!(targetElement instanceof HTMLInputElement)) {
        return;
      }
      if (targetElement.name !== "admx-state") {
        return;
      }
      syncControlsWithPolicyState(admxTemplateElement);
      refreshHeaderAdmxButtons();
    };
    const handleControlsChange = (event) => {
      const targetElement = event.target;
      if (!(targetElement instanceof HTMLElement)) {
        return;
      }
      if (!targetElement.closest(".gp__admx-options")) {
        return;
      }
      refreshHeaderAdmxButtons();
    };
    addManagedEventListener(cleanups, statePolicyElement, "change", handleStatePolicyChange);
    addManagedEventListener(cleanups, admxTemplateElement, "change", handleControlsChange);
    addManagedEventListener(cleanups, admxTemplateElement, "input", handleControlsChange);
    const handleCancel = () => {
      if (!btnCancel?.classList.contains("active")) {
        return;
      }
      applyAdmxFormSnapshot({
        rootElement: admxTemplateElement,
        snapshot: initialFormSnapshot,
        controlEntries
      });
      refreshHeaderAdmxButtons();
    };
    const handleApply = () => {
      if (!btnApply?.classList.contains("active")) {
        return;
      }
      const admxEntries = buildPersistedAdmxEntries({
        rootElement: admxTemplateElement,
        item,
        admxTreePath: effectiveAdmxTreePath,
        controlEntries,
        policyValueEntry
      });
      const didSave = upsertAdmxEntries(admxEntries);
      if (!didSave) {
        return;
      }
      initialFormSnapshot = buildAdmxFormSnapshot({
        rootElement: admxTemplateElement,
        controlEntries
      });
      setHeaderAdmxButtonsActive(false);
    };
    addManagedEventListener(cleanups, btnCancel, "click", handleCancel);
    addManagedEventListener(cleanups, btnApply, "click", handleApply);
    let cleanedUp = false;
    admxTemplate.cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      while (cleanups.length > 0) {
        const cleanup = cleanups.pop();
        if (typeof cleanup === "function") {
          cleanup();
        }
      }
      setHeaderAdmxButtonsActive(false);
    };
    return admxTemplate;
  }

  // src/app/components/templates/folder-template.js
  var HELP_PLACEHOLDER = [
    "\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435",
    "\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435",
    "\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435",
    "\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435\u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u0440\u0430\u043D\u0434\u043E\u043C\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u043D\u0435 \u0437\u043D\u0430\u044E \u043E \u0447\u0435\u043C)  \u0442\u0435\u043A\u0441\u0442\u0430 \u0431\u043E\u043B\u044C\u0448\u0435, \u0431\u043E\u043B\u044C\u0448\u0435"
  ].join("\n");
  function renderChildRow(item, onItemClick) {
    const row = createElement("span", {
      className: "workspace-list-item",
      attrs: typeof onItemClick === "function" ? {
        role: "button",
        tabindex: "0"
      } : {},
      children: [
        createElement("span", { className: ["icon", item.icon] }),
        createElement("span", {
          className: "gp__list-children__item__title",
          text: item.title
        })
      ]
    });
    if (typeof onItemClick === "function") {
      row.on("click", () => onItemClick(item));
      row.on("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onItemClick(item);
        }
      });
    }
    return createElement("li", {
      className: ["gp__list-children__item", item.type],
      children: [row]
    });
  }
  function renderHelpBlock({ help = void 0, isOpen = false } = {}) {
    if (help === "") {
      return null;
    }
    const helpText = help === void 0 ? HELP_PLACEHOLDER : help;
    return createElement("div", {
      className: ["gp__list-children-help", isOpen ? "is-open" : null],
      children: [
        createElement("div", {
          className: "title",
          text: "\u041F\u043E\u043C\u043E\u0449\u044C:"
        }),
        createElement("div", {
          className: "content",
          text: helpText
        })
      ]
    });
  }
  function renderFolderTemplate({
    children = [],
    help = void 0,
    onItemClick = null,
    isHelpOpen = false
  } = {}) {
    const folderChildren = Array.isArray(children) ? children : [];
    const helpBlock = renderHelpBlock({
      help,
      isOpen: isHelpOpen
    });
    return createElement("div", {
      className: "gp__list-children-wrapper",
      children: [
        createElement("div", {
          className: "gp__list-children",
          children: [
            createElement("ul", {
              className: "gp__list-children__list",
              children: folderChildren.map((child) => renderChildRow(child, onItemClick))
            })
          ]
        }),
        helpBlock
      ]
    });
  }

  // src/app/components/workspace/preferences-template-common.js
  function renderPreferencesCommonTemplate() {
    const container2 = createElement("div", {
      className: "preferences-common",
      children: [
        createElement("div", {
          className: ["field", "field__checkbox"],
          attrs: { "data-name": "stopOnErrorCheckBox" },
          children: [
            createElement("label", {
              children: [
                createElement("input", {
                  attrs: {
                    type: "checkbox",
                    name: "stopOnErrorCheckBox_option"
                  }
                }),
                createElement("span", {
                  className: "field__label-checkbox",
                  text: "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u043F\u0440\u0438 \u043E\u0448\u0438\u0431\u043A\u0435"
                })
              ]
            })
          ]
        }),
        createElement("div", {
          className: ["field", "field__checkbox"],
          attrs: { "data-name": "userContextCheckBox" },
          children: [
            createElement("label", {
              children: [
                createElement("input", {
                  attrs: {
                    type: "checkbox",
                    name: "userContextCheckBox_option"
                  }
                }),
                createElement("span", {
                  className: "field__label-checkbox",
                  text: "\u0412\u044B\u043F\u043E\u043B\u043D\u044F\u0442\u044C \u0432 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0435 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F (\u043E\u043F\u0446\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0445 \u043F\u043E\u043B\u0438\u0442\u0438\u043A)"
                })
              ]
            })
          ]
        }),
        createElement("div", {
          className: ["field", "field__checkbox"],
          attrs: { "data-name": "removeThisCheckBox" },
          children: [
            createElement("label", {
              children: [
                createElement("input", {
                  attrs: {
                    type: "checkbox",
                    name: "removeThisCheckBox_option"
                  }
                }),
                createElement("span", {
                  className: "field__label-checkbox",
                  text: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u044D\u043B\u0435\u043C\u0435\u043D\u0442, \u0435\u0441\u043B\u0438 \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C"
                })
              ]
            })
          ]
        }),
        createElement("div", {
          className: ["field", "field__checkbox"],
          attrs: { "data-name": "applyOnceCheckBox" },
          children: [
            createElement("label", {
              children: [
                createElement("input", {
                  attrs: {
                    type: "checkbox",
                    name: "applyOnceCheckBox_option",
                    disabled: "disabled"
                  }
                }),
                createElement("span", {
                  className: "field__label-checkbox",
                  text: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0434\u0438\u043D \u0440\u0430\u0437"
                })
              ]
            })
          ]
        }),
        createElement("div", {
          className: ["field", "field__checkbox"],
          attrs: { "data-name": "itemLevelCheckBox" },
          children: [
            createElement("label", {
              children: [
                createElement("input", {
                  attrs: {
                    type: "checkbox",
                    name: "itemLevelCheckBox_option",
                    disabled: "disabled"
                  }
                }),
                createElement("span", {
                  className: "field__label-checkbox",
                  text: "\u0412\u044B\u0431\u043E\u0440 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
                })
              ]
            })
          ]
        }),
        createElement("div", {
          className: ["field", "field__description"],
          attrs: { "data-name": "description" },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("textarea", {
                  attrs: {
                    name: "description"
                  }
                })
              ]
            })
          ]
        })
      ]
    });
    return container2;
  }

  // src/app/util/mainLocalStorage/shortcuts.js
  var STORAGE_KEY2 = "shortcuts";
  var VALID_TARGET_TYPES = /* @__PURE__ */ new Set([0, 1, 2]);
  var SHORTCUTS_SEED = [
    {
      basic: {
        "ACTION": 3,
        "SHORTCUT_PATH": "Mail",
        "TARGET_TYPE": 2,
        "TARGET_PATH": "/usr/bin/thunderbird",
        "LOCATION": 1,
        "ARGUMENTS": "",
        "START_IN": "",
        "SHORTCUT_KEY": "",
        "WINDOW": 0,
        "COMMENT": "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0434\u043B\u044F Mail",
        "ICON_PATH": "/usr/share/icons/default/application.png",
        "ICON_INDEX": ""
      },
      common: {
        "stopOnErrorCheckBox": true,
        "userContextCheckBox": false,
        "removeThisCheckBox": false,
        "description": "\u043C\u043E\u0451 \u043A\u0440\u0430\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
      }
    },
    {
      basic: {
        "ACTION": 0,
        "SHORTCUT_PATH": "Mail",
        "TARGET_TYPE": 2,
        "TARGET_PATH": "/usr/bin/thunderbird",
        "LOCATION": 2,
        "ARGUMENTS": "",
        "START_IN": "",
        "SHORTCUT_KEY": "",
        "WINDOW": 0,
        "COMMENT": "",
        "ICON_PATH": "/usr/share/icons/default/application.png",
        "ICON_INDEX": ""
      },
      common: {
        "stopOnErrorCheckBox": false,
        "userContextCheckBox": true,
        "removeThisCheckBox": false,
        "description": "\u043C\u043E\u0451 \u043A\u0440\u0430\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 N2"
      }
    },
    {
      basic: {
        "ACTION": 2,
        "SHORTCUT_PATH": "Mail",
        "TARGET_TYPE": 2,
        "TARGET_PATH": "/usr/bin/thunderbird",
        "LOCATION": 9,
        "ARGUMENTS": "",
        "START_IN": "",
        "SHORTCUT_KEY": "",
        "WINDOW": 0,
        "COMMENT": "",
        "ICON_PATH": "/usr/share/icons/default/application.png",
        "ICON_INDEX": ""
      },
      common: {
        "stopOnErrorCheckBox": false,
        "userContextCheckBox": false,
        "removeThisCheckBox": true,
        "description": "\u043C\u043E\u0451 \u043A\u0440\u0430\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 3"
      }
    }
  ];
  function isValidShortcutEntry(item) {
    if (!item || typeof item !== "object") return false;
    const { basic, common } = (
      /** @type {Record<string, any>} */
      item
    );
    if (!basic || typeof basic !== "object") return false;
    if (!common || typeof common !== "object") return false;
    if (typeof basic.ACTION !== "number") return false;
    if (typeof basic.SHORTCUT_PATH !== "string") return false;
    if (typeof basic.TARGET_TYPE !== "number" || !VALID_TARGET_TYPES.has(basic.TARGET_TYPE)) return false;
    if (typeof basic.TARGET_PATH !== "string") return false;
    if (typeof common.stopOnErrorCheckBox !== "boolean") return false;
    if (typeof common.userContextCheckBox !== "boolean") return false;
    if (typeof common.removeThisCheckBox !== "boolean") return false;
    return true;
  }
  function validateShortcutsSchema(data) {
    if (!Array.isArray(data)) return false;
    return data.every(isValidShortcutEntry);
  }
  function initShortcutsStorage() {
    const seeded = ensureInitialized(
      STORAGE_KEY2,
      SHORTCUTS_SEED,
      validateShortcutsSchema
    );
    if (seeded) {
      console.log("Shortcuts localStorage initialized with seed data");
    } else {
      console.log("Shortcuts localStorage already contains valid data");
    }
  }
  function getShortcutsFromLocalStorage() {
    return getItemSafe(STORAGE_KEY2, validateShortcutsSchema, []);
  }
  function saveShortcutsToLocalStorage(shortcuts) {
    return setItemSafe(STORAGE_KEY2, shortcuts, validateShortcutsSchema);
  }

  // src/app/components/templates/preference/shortcuts/preferences-template-shortcuts.js
  function renderPreferencesShortcutsTemplate() {
    const container2 = createElement("div", {
      className: "preferences-shortcuts",
      children: [
        // Действие
        createElement("div", {
          className: ["field", "select"],
          attrs: {
            "data-name": "ACTION"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("select", {
                  attrs: {
                    name: "action"
                  },
                  children: [
                    createElement("option", {
                      attrs: {
                        value: "0",
                        selected: "selected"
                      },
                      text: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "1"
                      },
                      text: "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "2"
                      },
                      text: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "3"
                      },
                      text: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Линия
        createElement("div", {
          className: "field__line"
        }),
        // Название
        createElement("div", {
          className: ["field", "field__input", "field__input--path"],
          attrs: {
            "data-name": "SHORTCUT_PATH"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("input", {
                  attrs: {
                    type: "text"
                  }
                })
              ]
            })
          ]
        }),
        // Тип цели
        createElement("div", {
          className: ["field", "select"],
          attrs: {
            "data-name": "TARGET_TYPE"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u0422\u0438\u043F \u0446\u0435\u043B\u0438:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("select", {
                  attrs: {
                    name: "targetType"
                  },
                  children: [
                    createElement("option", {
                      attrs: {
                        value: "0",
                        selected: "selected"
                      },
                      text: "\u041E\u0431\u044A\u0435\u043A\u0442 \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "1"
                      },
                      text: "URL-\u0430\u0434\u0440\u0435\u0441"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "2"
                      },
                      text: "\u041E\u0431\u044A\u0435\u043A\u0442 \u043E\u0431\u043E\u043B\u043E\u0447\u043A\u0438"
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Место нахождения
        createElement("div", {
          className: ["field", "select"],
          attrs: {
            "data-name": "LOCATION"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u041C\u0435\u0441\u0442\u043E \u043D\u0430\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("select", {
                  children: [
                    createElement("option", {
                      attrs: {
                        value: "0",
                        selected: "selected"
                      },
                      text: "[\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0443\u0442\u044C]"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "1"
                      },
                      text: "\u0420\u0430\u0431\u043E\u0447\u0438\u0439 \u0441\u0442\u043E\u043B"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "2"
                      },
                      text: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0435 \u043C\u0435\u043D\u044E"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "3"
                      },
                      text: "\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "4"
                      },
                      text: "\u0417\u0430\u043F\u0443\u0441\u043A"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "5"
                      },
                      text: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "6"
                      },
                      text: "\u0421\u0441\u044B\u043B\u043A\u0438"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "7"
                      },
                      text: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "8"
                      },
                      text: "\u041D\u0435\u0434\u0430\u0432\u043D\u0438\u0435"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "9"
                      },
                      text: "\u041F\u0430\u043D\u0435\u043B\u044C \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0430"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "10"
                      },
                      text: "\u041C\u043E\u0438 \u043C\u0435\u0441\u0442\u0430 \u0432 \u0421\u0435\u0442\u0438"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "11"
                      },
                      text: "\u041E\u0431\u0449\u0438\u0439 \u0420\u0430\u0431\u043E\u0447\u0438\u0439 \u0441\u0442\u043E\u043B"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "12"
                      },
                      text: "\u041E\u0431\u0449\u0435\u0435 \u0421\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0435 \u043C\u0435\u043D\u044E"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "13"
                      },
                      text: "\u041E\u0431\u0449\u0438\u0435 \u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "14"
                      },
                      text: "\u041E\u0431\u0449\u0438\u0439 \u0417\u0430\u043F\u0443\u0441\u043A"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "15"
                      },
                      text: "\u041E\u0431\u0449\u0438\u0435 \u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435"
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Линия
        createElement("div", {
          className: "field__line"
        }),
        // Целевой путь
        createElement("div", {
          className: ["field", "field__input", "field__input--path"],
          attrs: {
            "data-name": "TARGET_PATH"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u043F\u0443\u0442\u044C:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("input", {
                  attrs: {
                    type: "text"
                  }
                })
              ]
            })
          ]
        }),
        // Аргументы
        createElement("div", {
          className: ["field", "field__input"],
          attrs: {
            "data-name": "ARGUMENTS"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u0410\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("input", {
                  attrs: {
                    type: "text"
                  }
                })
              ]
            })
          ]
        }),
        // Линия
        createElement("div", {
          className: "field__line"
        }),
        // Путь к файлу значка
        createElement("div", {
          className: ["field", "field__input", "field__input--path"],
          attrs: {
            "data-name": "ICON_PATH"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u041F\u0443\u0442\u044C \u043A \u0444\u0430\u0439\u043B\u0443 \u0437\u043D\u0430\u0447\u043A\u0430:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("input", {
                  attrs: {
                    type: "text"
                  }
                })
              ]
            })
          ]
        }),
        // Индекс значка
        createElement("div", {
          className: ["field", "select"],
          attrs: {
            "data-name": "ICON_INDEX"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u0418\u043D\u0434\u0435\u043A\u0441 \u0437\u043D\u0430\u0447\u043A\u0430:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("input", {
                  attrs: {
                    type: "number",
                    disabled: "disabled",
                    value: "0"
                  }
                })
              ]
            })
          ]
        }),
        // Линия
        createElement("div", {
          className: "field__line"
        }),
        // Начинать
        createElement("div", {
          className: ["field", "field__input", "field__input--path"],
          attrs: {
            "data-name": "START_IN"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u041D\u0430\u0447\u0438\u043D\u0430\u0442\u044C:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("input", {
                  attrs: {
                    type: "text"
                  }
                })
              ]
            })
          ]
        }),
        // Быстрая клавиша
        createElement("div", {
          className: ["field", "field__input", "field__input--hotkey"],
          attrs: {
            "data-name": "SHORTCUT_KEY"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u0411\u044B\u0441\u0442\u0440\u0430\u044F \u043A\u043B\u0430\u0432\u0438\u0448\u0430:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("input", {
                  attrs: {
                    type: "text",
                    placeholder: "\u0412\u0432\u0435\u0434\u0438 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044E \u043A\u043B\u0430\u0432\u0438\u0448"
                  }
                })
              ]
            })
          ]
        }),
        // Запуск
        createElement("div", {
          className: ["field", "select"],
          attrs: {
            "data-name": "WINDOW"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u0417\u0430\u043F\u0443\u0441\u043A:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("select", {
                  attrs: {
                    name: "runMode"
                  },
                  children: [
                    createElement("option", {
                      attrs: {
                        value: "0",
                        selected: "selected"
                      },
                      text: "\u041E\u0431\u044B\u0447\u043D\u043E\u0435 \u043E\u043A\u043D\u043E"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "1"
                      },
                      text: "\u0421\u0432\u0451\u0440\u043D\u0443\u0442\u043E\u0435"
                    }),
                    createElement("option", {
                      attrs: {
                        value: "2"
                      },
                      text: "\u0423\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u043D\u043E\u0435"
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Комментарий
        createElement("div", {
          className: ["field", "field__comment"],
          attrs: {
            "data-name": "COMMENT"
          },
          children: [
            createElement("div", {
              className: "field__label",
              text: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439:"
            }),
            createElement("div", {
              className: "field__element",
              children: [
                createElement("textarea", {
                  attrs: {
                    name: "comment"
                  }
                })
              ]
            })
          ]
        })
      ]
    });
    return container2;
  }

  // src/app/util/form-utils.js
  function getValueElement(fieldEl) {
    return fieldEl.querySelector(".field__element input, .field__element select, .field__element textarea") || fieldEl.querySelector('input[type="checkbox"], input[type="radio"]');
  }
  function getFieldValue(fieldEl) {
    const element = getValueElement(fieldEl);
    if (!element) return "";
    const tagName = element.tagName.toLowerCase();
    const type = (element.type || "").toLowerCase();
    if (tagName === "select") {
      return element.value;
    }
    if (tagName === "input" && (type === "checkbox" || type === "radio")) {
      return element.checked;
    }
    if (tagName === "input" && type === "number") {
      const v = element.value;
      return v === "" ? "" : Number(v);
    }
    return element.value;
  }

  // src/app/components/templates/preference/create-preference.js
  var SHORTCUT_NUMBER_KEYS = ["ACTION", "TARGET_TYPE", "LOCATION", "WINDOW", "ICON_INDEX"];
  function collectPreferencesFromTabBasic(tabBasicEl) {
    if (!tabBasicEl) return {};
    const data = {};
    const fields = tabBasicEl.querySelectorAll("[data-name]");
    fields.forEach((fieldEl) => {
      const name = fieldEl.getAttribute("data-name");
      if (!name) return;
      const valueEl = getValueElement(fieldEl);
      if (!valueEl) return;
      data[name] = getFieldValue(fieldEl);
    });
    return data;
  }
  function setModalCreateMode(modalEl) {
    if (!modalEl) return;
    modalEl.setAttribute("data-preferences-mode", "create");
  }
  function resetActiveTabToBasic(modalEl) {
    if (!modalEl) return;
    const basicBtn = modalEl.querySelector('.preference__tab-button[data-tab="tab-basic"]');
    const generalBtn = modalEl.querySelector('.preference__tab-button[data-tab="tab-general"]');
    const basicContent = modalEl.querySelector("#tab-basic");
    const generalContent = modalEl.querySelector("#tab-general");
    if (basicBtn) basicBtn.classList.add("active");
    if (generalBtn) generalBtn.classList.remove("active");
    if (basicContent) basicContent.classList.add("active");
    if (generalContent) generalContent.classList.remove("active");
  }
  function resetModalFormToDefaults(modalEl) {
    if (!modalEl) return;
    resetActiveTabToBasic(modalEl);
    const preferencesName = modalEl.getAttribute("data-preferences-name");
    const tabBasic = modalEl.querySelector("#tab-basic");
    if (tabBasic && preferencesName === "shortcuts") {
      tabBasic.innerHTML = "";
      const tpl = renderPreferencesShortcutsTemplate();
      if (tpl?.getElement) tabBasic.appendChild(tpl.getElement());
    }
    const tabGeneral = modalEl.querySelector("#tab-general");
    if (tabGeneral) {
      tabGeneral.innerHTML = "";
      const tpl = renderPreferencesCommonTemplate();
      if (tpl?.getElement) tabGeneral.appendChild(tpl.getElement());
    }
  }
  function savePreferencesFromModal(modalEl) {
    if (!modalEl) return;
    const storageKey = modalEl.getAttribute("data-preferences-name");
    if (!storageKey) return;
    const tabBasic = modalEl.querySelector("#tab-basic");
    const tabGeneral = modalEl.querySelector("#tab-general");
    const basicData = collectPreferencesFromTabBasic(tabBasic);
    const commonData = collectPreferencesFromTabBasic(tabGeneral);
    if (Object.keys(basicData).length === 0) return;
    if (storageKey === "shortcuts") {
      const normalizedBasic = { ...basicData };
      SHORTCUT_NUMBER_KEYS.forEach((key) => {
        if (key in normalizedBasic && normalizedBasic[key] !== "") {
          const n = Number(normalizedBasic[key]);
          normalizedBasic[key] = Number.isNaN(n) ? normalizedBasic[key] : n;
        }
      });
      if ("TARGET_TYPE" in normalizedBasic) {
        const v = normalizedBasic.TARGET_TYPE;
        if (typeof v !== "number" || !VALID_TARGET_TYPES.has(v)) {
          console.warn(
            `[shortcuts] TARGET_TYPE has unexpected value: ${v}.`,
            "Legacy data may need explicit migration."
          );
        }
      }
      const normalizedCommon = { ...commonData };
      const list = getShortcutsFromLocalStorage();
      const indexAttr = modalEl.getAttribute("data-preferences-index");
      const index = indexAttr !== null && indexAttr !== "" ? parseInt(indexAttr, 10) : -1;
      const entry = { basic: normalizedBasic, common: normalizedCommon };
      if (index >= 0 && index < list.length) {
        list[index] = entry;
      } else {
        list.push(entry);
      }
      saveShortcutsToLocalStorage(list);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(basicData));
    }
  }

  // src/app/components/templates/preference/shortcuts/preferences-table-shortcuts.js
  var ACTION_LABELS = { 0: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C", 1: "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C", 2: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C", 3: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" };
  function renderSettingsItems(common) {
    const bool = (val) => val ? "\u0414\u0430" : "\u041D\u0435\u0442";
    const item = (label, value, empty = false) => createElement("div", {
      className: empty ? ["preference__settings-item", "empty"] : "preference__settings-item",
      children: [
        createElement("div", { text: label }),
        createElement("div", { text: value })
      ]
    }).getElement();
    return [
      item("\u041D\u0435 \u043E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0442\u044C \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B \u0432 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0438 \u043F\u0440\u0438 \u043E\u0448\u0438\u0431\u043A\u0435:", bool(common.stopOnErrorCheckBox)),
      item("\u0417\u0430\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u0432 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", bool(common.userContextCheckBox)),
      item("\u0423\u0434\u0430\u043B\u0438\u0442\u044C, \u0435\u0441\u043B\u0438 \u043D\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E:", bool(common.removeThisCheckBox)),
      item("\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u043E\u0434\u0438\u043D \u0440\u0430\u0437:", "\u041D\u0435\u0442", true),
      item("\u041E\u0442\u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432\u0430\u043D\u043E:", "\u041D\u0435\u0442", true),
      item("\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E:", "\u041D\u0435\u0442", true),
      item("\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0443\u0440\u043E\u0432\u043D\u0435\u043C \u0432\u044B\u0448\u0435:", "\u041D\u0435\u0442", true)
    ];
  }
  function updatePreferenceInfo(preferenceRoot, index) {
    if (!preferenceRoot) return;
    const shortcuts = getShortcutsFromLocalStorage();
    if (index == null || !shortcuts[index]) return;
    const common = shortcuts[index].common;
    const descriptionEl = preferenceRoot.querySelector(".preference__description-data");
    if (descriptionEl) {
      descriptionEl.textContent = common.description ?? "";
    }
    const settingsEl = preferenceRoot.querySelector(".preference__settings-data");
    if (settingsEl) {
      settingsEl.innerHTML = "";
      renderSettingsItems(common).forEach((el) => settingsEl.appendChild(el));
    }
  }
  function createTableRow(row, active = false, namePreference = "shortcuts") {
    const name = row.SHORTCUT_PATH ?? row.name ?? "";
    const order = row.order ?? "";
    const actionText = row.ACTION != null ? typeof row.ACTION === "number" ? ACTION_LABELS[row.ACTION] : row.ACTION : row.action ?? "";
    const target = row.TARGET_PATH ?? row.value ?? "";
    return createElement("tr", {
      className: active ? "active" : void 0,
      events: {
        click: (event) => {
          const tbody = event.currentTarget.closest("tbody");
          if (tbody) {
            tbody.querySelectorAll("tr").forEach((tr) => tr.classList.remove("active"));
            event.currentTarget.classList.add("active");
          }
          const orderIndex = row.order;
          const preferenceRoot = event.currentTarget.closest(".gp__preference");
          updatePreferenceInfo(preferenceRoot, orderIndex);
          document.dispatchEvent(new CustomEvent("preferences-row-select", { detail: { index: row.order } }));
        }
      },
      children: [
        createElement("td", { text: String(name) }),
        createElement("td", { text: String(order) }),
        createElement("td", { text: String(actionText) }),
        createElement("td", { text: String(target) })
      ]
    });
  }
  function renderPreferencesTableShortcuts(rows = [], activeIndex = 0, namePreference = "shortcuts") {
    const shortcuts = getShortcutsFromLocalStorage();
    const basic = (item) => item.basic ?? item;
    const defaultRows = shortcuts.map((item, index) => ({
      SHORTCUT_PATH: basic(item).SHORTCUT_PATH ?? "",
      order: index,
      ACTION: basic(item).ACTION,
      TARGET_PATH: basic(item).TARGET_PATH ?? ""
    }));
    const dataRows = rows.length > 0 ? rows : defaultRows;
    if (dataRows.length === 0) {
      return createElement("div", {
        className: "preference__data-table",
        children: [
          createElement("div", {
            className: "preference__data-empty",
            children: [
              createElement("div", {
                className: "preference__data-message",
                text: "\u0412 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u043F\u043E\u043B\u0438\u0442\u0438\u043A \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E"
              })
            ]
          })
        ]
      });
    }
    const safeActiveIndex = Math.max(0, Math.min(activeIndex, dataRows.length - 1));
    const tbodyRows = dataRows.map(
      (row, index) => createTableRow(row, index === safeActiveIndex, namePreference)
    );
    const table = createElement("table", {
      className: "preference__table",
      children: [
        createElement("thead", {
          children: [
            createElement("tr", {
              children: [
                createElement("th", { text: "\u0418\u043C\u044F" }),
                createElement("th", { text: "\u041E\u0447\u0435\u0440\u0451\u0434\u043D\u043E\u0441\u0442\u044C" }),
                createElement("th", { text: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435" }),
                createElement("th", { text: "\u0426\u0435\u043B\u044C" })
              ]
            })
          ]
        }),
        createElement("tbody", {
          children: tbodyRows
        })
      ]
    });
    document.dispatchEvent(new CustomEvent("preferences-row-select", { detail: { index: safeActiveIndex } }));
    setTimeout(() => {
      const preferenceRoot = table.getElement()?.closest(".gp__preference");
      if (preferenceRoot && dataRows.length > 0) {
        updatePreferenceInfo(preferenceRoot, safeActiveIndex);
      }
    }, 0);
    return table;
  }

  // src/app/components/templates/preference/delete-preference.js
  function handleDeletePreference(buttonEl, workspaceEl) {
    if (!buttonEl) return;
    const preferencesName = buttonEl.getAttribute("data-preferences-name");
    const indexAttr = buttonEl.getAttribute("data-preferences-index");
    if (!preferencesName || indexAttr === null || indexAttr === "") return;
    const index = parseInt(indexAttr, 10);
    if (Number.isNaN(index) || index < 0) return;
    if (preferencesName === "shortcuts") {
      const list = getShortcutsFromLocalStorage();
      if (index >= list.length) return;
      list.splice(index, 1);
      saveShortcutsToLocalStorage(list);
    } else {
      return;
    }
    refreshPreferencesTable(workspaceEl);
    if (preferencesName === "shortcuts" && getShortcutsFromLocalStorage().length === 0) {
      buttonEl.classList.remove("active");
      buttonEl.removeAttribute("data-preferences-index");
    }
  }
  function refreshPreferencesTable(workspaceEl) {
    const workspace = workspaceEl?.getElement ? workspaceEl.getElement() : workspaceEl;
    const container2 = workspace ? workspace.querySelector(".preference__data-table") : document.querySelector(".workspace .preference__data-table");
    if (!container2) return;
    container2.innerHTML = "";
    const table = renderPreferencesTableShortcuts();
    container2.appendChild(table.getElement ? table.getElement() : table);
  }

  // src/app/components/templates/preference/edit-preference.js
  function setFieldValue(fieldEl, value) {
    const element = getValueElement(fieldEl);
    if (!element) return;
    const tagName = element.tagName.toLowerCase();
    const type = (element.type || "").toLowerCase();
    if (tagName === "select") {
      element.value = String(value);
      return;
    }
    if (tagName === "input" && (type === "checkbox" || type === "radio")) {
      element.checked = Boolean(value);
      return;
    }
    if (tagName === "input" || tagName === "textarea") {
      element.value = value === void 0 || value === null ? "" : String(value);
    }
  }
  function getStoredPreferenceData(modalEl) {
    if (!modalEl) return null;
    const storageKey = modalEl.getAttribute("data-preferences-name");
    if (!storageKey) return null;
    if (storageKey === "shortcuts") {
      const list = getShortcutsFromLocalStorage();
      const indexAttr = modalEl.getAttribute("data-preferences-index");
      const index = indexAttr !== null && indexAttr !== "" ? parseInt(indexAttr, 10) : -1;
      if (index >= 0 && index < list.length) return list[index];
      return null;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  function syncModalFromStoredData(modalEl) {
    if (!modalEl) return;
    const stored = getStoredPreferenceData(modalEl);
    if (!stored || typeof stored !== "object") return;
    const basicData = stored.basic ?? stored;
    const commonData = stored.common ?? stored;
    const tabBasic = modalEl.querySelector("#tab-basic");
    if (tabBasic) {
      tabBasic.querySelectorAll("[data-name]").forEach((fieldEl) => {
        const name = fieldEl.getAttribute("data-name");
        if (!name || !(name in basicData)) return;
        const valueEl = getValueElement(fieldEl);
        if (!valueEl) return;
        const current = getFieldValue(fieldEl);
        const needed = basicData[name];
        const currentNorm = typeof current === "boolean" ? current : current === void 0 || current === null ? "" : String(current);
        const neededNorm = typeof needed === "boolean" ? needed : needed === void 0 || needed === null ? "" : String(needed);
        if (currentNorm !== neededNorm) {
          setFieldValue(fieldEl, needed);
        }
      });
    }
    const tabGeneral = modalEl.querySelector("#tab-general");
    if (tabGeneral) {
      tabGeneral.querySelectorAll("[data-name]").forEach((fieldEl) => {
        const name = fieldEl.getAttribute("data-name");
        if (!name || !(name in commonData)) return;
        const valueEl = getValueElement(fieldEl);
        if (!valueEl) return;
        const current = getFieldValue(fieldEl);
        const needed = commonData[name];
        const currentNorm = typeof current === "boolean" ? current : current === void 0 || current === null ? "" : String(current);
        const neededNorm = typeof needed === "boolean" ? needed : needed === void 0 || needed === null ? "" : String(needed);
        if (currentNorm !== neededNorm) {
          setFieldValue(fieldEl, needed);
        }
      });
    }
  }
  function openModalForEdit(btnEdit, modalEl) {
    if (!btnEdit || !modalEl) return;
    const name = btnEdit.getAttribute("data-preferences-name");
    const index = btnEdit.getAttribute("data-preferences-index");
    if (name != null) modalEl.setAttribute("data-preferences-name", name);
    if (index != null) modalEl.setAttribute("data-preferences-index", index);
    else modalEl.removeAttribute("data-preferences-index");
    modalEl.setAttribute("data-preferences-mode", "edit");
    resetActiveTabToBasic(modalEl);
    syncModalFromStoredData(modalEl);
    modalEl.classList.add("active");
  }

  // src/app/components/templates/preference/preferences-view-template.js
  function addManagedEventListener2(cleanups, target, eventName, handler, options) {
    if (!target || typeof target.addEventListener !== "function" || typeof handler !== "function") {
      return;
    }
    target.addEventListener(eventName, handler, options);
    cleanups.push(() => target.removeEventListener(eventName, handler, options));
  }
  function clearHeaderButtonState({ btnCreate, btnEdit, btnDelete, btnApply, btnCancel, btnInformation } = {}) {
    [btnCreate, btnEdit, btnDelete, btnApply, btnCancel, btnInformation].filter(Boolean).forEach((buttonEl) => buttonEl.classList.remove("active"));
    [btnCreate, btnEdit, btnDelete].filter(Boolean).forEach((buttonEl) => {
      buttonEl.removeAttribute("data-preferences-name");
      buttonEl.removeAttribute("data-preferences-index");
    });
  }
  function initHeaderButtons(header) {
    const headerEl = header?.getElement();
    const control = headerEl?.querySelector(".gp__control");
    const btnCreate = control?.querySelector(".preferences__btn-create");
    const btnEdit = control?.querySelector(".preferences__btn-edit");
    const btnDelete = control?.querySelector(".preferences__btn-delete");
    if (btnCreate && !btnCreate.classList.contains("active")) {
      btnCreate.classList.add("active");
    }
    if (btnEdit) btnEdit.classList.remove("active");
    if (btnDelete) btnDelete.classList.remove("active");
    const controlAdmx = headerEl?.querySelector(".gp__control-admx");
    const btnApply = controlAdmx?.querySelector(".admx__btn-apply");
    const btnCancel = controlAdmx?.querySelector(".admx__btn-cancel");
    if (btnApply) btnApply.classList.remove("active");
    if (btnCancel) btnCancel.classList.remove("active");
    const controlHelp = headerEl?.querySelector(".gp__control-help");
    const btnInformation = controlHelp?.querySelector(".btn-information");
    if (btnInformation) btnInformation.classList.remove("active");
    return { btnCreate, btnEdit, btnDelete, btnApply, btnCancel, btnInformation };
  }
  function initButtonHandlers({
    btnCreate,
    btnEdit,
    btnDelete,
    preferenceModal,
    rootEl,
    name,
    renderTable,
    getDataFromStorage,
    cleanups
  }) {
    const handleRowSelect = (e) => {
      const index = e.detail.index;
      [btnEdit, btnDelete].forEach((btn) => {
        if (!btn) return;
        btn.setAttribute("data-preferences-index", String(index));
        if (name != null) {
          btn.setAttribute("data-preferences-name", name);
        }
      });
      if (btnEdit) btnEdit.classList.add("active");
      if (btnDelete) btnDelete.classList.add("active");
    };
    addManagedEventListener2(cleanups, document, "preferences-row-select", handleRowSelect);
    if (btnDelete) {
      const handleDelete = () => {
        if (!btnDelete.classList.contains("active")) {
          return;
        }
        handleDeletePreference(btnDelete, rootEl);
        const list = getDataFromStorage ? getDataFromStorage() : [];
        if (list.length === 0) {
          if (btnEdit) {
            btnEdit.classList.remove("active");
            btnEdit.removeAttribute("data-preferences-index");
          }
          btnDelete.classList.remove("active");
          btnDelete.removeAttribute("data-preferences-index");
        }
      };
      addManagedEventListener2(cleanups, btnDelete, "click", handleDelete);
    }
    if (btnEdit && preferenceModal) {
      const handleEdit = () => {
        if (!btnEdit.classList.contains("active")) {
          return;
        }
        if (name != null) {
          preferenceModal.setAttribute("data-preferences-name", name);
        }
        resetModalFormToDefaults(preferenceModal);
        openModalForEdit(btnEdit, preferenceModal);
      };
      addManagedEventListener2(cleanups, btnEdit, "click", handleEdit);
    }
    if (btnCreate && preferenceModal) {
      const handleCreate = () => {
        if (!btnCreate.classList.contains("active")) {
          return;
        }
        if (name != null) {
          preferenceModal.setAttribute("data-preferences-name", name);
        }
        resetModalFormToDefaults(preferenceModal);
        preferenceModal.removeAttribute("data-preferences-index");
        setModalCreateMode(preferenceModal);
        preferenceModal.classList.add("active");
      };
      addManagedEventListener2(cleanups, btnCreate, "click", handleCreate);
    }
  }
  function renderPreferencesTemplate({ renderTable, getDataFromStorage, header, name } = {}) {
    const headerButtons = initHeaderButtons(header);
    const { btnCreate, btnEdit, btnDelete } = headerButtons;
    const cleanups = [];
    if (name && btnCreate) {
      btnCreate.setAttribute("data-preferences-name", name);
    }
    const list = getDataFromStorage ? getDataFromStorage() : [];
    if (list.length > 0) {
      if (btnEdit) {
        btnEdit.classList.add("active");
        if (name) btnEdit.setAttribute("data-preferences-name", name);
        btnEdit.setAttribute("data-preferences-index", "0");
      }
      if (btnDelete) {
        btnDelete.classList.add("active");
        if (name) btnDelete.setAttribute("data-preferences-name", name);
        btnDelete.setAttribute("data-preferences-index", "0");
      }
    }
    const preference = createElement("div", {
      className: "gp__preference",
      children: [
        createElement("div", {
          className: "preference__info",
          children: [
            createElement("div", {
              className: "preference__settings",
              children: [
                createElement("div", {
                  className: "preference__settings-title",
                  text: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438:"
                }),
                createElement("div", {
                  className: "preference__settings-data"
                })
              ]
            }),
            createElement("div", {
              className: "preference__description",
              children: [
                createElement("div", {
                  className: "preference__description-title",
                  text: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:"
                }),
                createElement("div", {
                  className: ["preference__description-data", "disable"]
                })
              ]
            })
          ]
        }),
        createElement("div", {
          className: "preference__divider",
          children: [
            createElement("div", {
              className: "divider__line"
            })
          ]
        }),
        createElement("div", {
          className: "preference__data-table",
          children: [
            renderTable ? renderTable() : null
          ]
        }),
        createElement("div", {
          className: "preference__modal",
          children: [
            createElement("div", {
              className: "preference__modal-wrapper",
              children: [
                createElement("div", {
                  className: "preference__modal-header",
                  children: [
                    createElement("div", {
                      className: "title",
                      text: "\u0414\u0438\u0430\u043B\u043E\u0433 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"
                    }),
                    createElement("div", {
                      className: "close",
                      events: {
                        click: (event) => {
                          const modal = event.target.closest(".preference__modal");
                          if (modal) {
                            resetModalFormToDefaults(modal);
                            modal.classList.remove("active");
                          }
                        }
                      }
                    })
                  ]
                }),
                createElement("div", {
                  className: "preference__modal-content",
                  children: [
                    createElement("div", {
                      className: "preference__modal-tabs",
                      children: [
                        createElement("div", {
                          className: "tab-buttons",
                          children: [
                            createElement("div", {
                              className: ["preference__tab-button", "active"],
                              attrs: {
                                "data-tab": "tab-basic"
                              },
                              text: "\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"
                            }),
                            createElement("div", {
                              className: ["preference__tab-button"],
                              attrs: {
                                "data-tab": "tab-general"
                              },
                              text: "\u041E\u0431\u0449\u0438\u0435"
                            })
                          ]
                        }),
                        createElement("div", {
                          id: "tab-basic",
                          className: ["tab-content", "active"]
                        }),
                        createElement("div", {
                          id: "tab-general",
                          className: ["tab-content"],
                          children: [
                            renderPreferencesCommonTemplate()
                          ]
                        })
                      ]
                    })
                  ]
                }),
                createElement("div", {
                  className: "preference__modal-footer",
                  children: [
                    createElement("div", {
                      className: ["btn", "btn-cancel"],
                      text: "\u041E\u0442\u043C\u0435\u043D\u0430",
                      events: {
                        click: (event) => {
                          const modal = event.target.closest(".preference__modal");
                          if (modal) {
                            resetModalFormToDefaults(modal);
                            modal.classList.remove("active");
                          }
                        }
                      }
                    }),
                    createElement("div", {
                      className: ["btn", "btn-ok"],
                      text: "\u041E\u043A",
                      events: {
                        click: (event) => {
                          const modal = event.target.closest(".preference__modal");
                          if (!modal) return;
                          const mode = modal.getAttribute("data-preferences-mode");
                          if (mode !== "create" && mode !== "edit") {
                            return;
                          }
                          savePreferencesFromModal(modal);
                          if (renderTable && getDataFromStorage) {
                            const preferenceRoot = modal.closest(".gp__preference");
                            const tableContainer = preferenceRoot?.querySelector(".preference__data-table");
                            if (tableContainer) {
                              const indexAttr = modal.getAttribute("data-preferences-index");
                              const currentList = getDataFromStorage();
                              const activeIndex = indexAttr !== null && indexAttr !== "" ? Math.min(parseInt(indexAttr, 10), currentList.length - 1) : currentList.length - 1;
                              tableContainer.innerHTML = "";
                              tableContainer.appendChild(renderTable([], activeIndex).getElement());
                            }
                          }
                          modal.classList.remove("active");
                        }
                      }
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
    const rootEl = preference.getElement();
    const basicTabButton = rootEl.querySelector('.preference__tab-button[data-tab="tab-basic"]');
    const generalTabButton = rootEl.querySelector('.preference__tab-button[data-tab="tab-general"]');
    const basicTabContent = rootEl.querySelector("#tab-basic");
    const generalTabContent = rootEl.querySelector("#tab-general");
    if (basicTabButton && generalTabButton && basicTabContent && generalTabContent) {
      const activateBasicTab = () => {
        if (basicTabButton.classList.contains("active")) {
          return;
        }
        basicTabButton.classList.add("active");
        basicTabContent.classList.add("active");
        generalTabButton.classList.remove("active");
        generalTabContent.classList.remove("active");
      };
      const activateGeneralTab = () => {
        if (generalTabButton.classList.contains("active")) {
          return;
        }
        generalTabButton.classList.add("active");
        generalTabContent.classList.add("active");
        basicTabButton.classList.remove("active");
        basicTabContent.classList.remove("active");
      };
      addManagedEventListener2(cleanups, basicTabButton, "click", activateBasicTab);
      addManagedEventListener2(cleanups, generalTabButton, "click", activateGeneralTab);
    }
    const dividerElement = rootEl.querySelector(".preference__divider");
    const infoElement = rootEl.querySelector(".preference__info");
    let cleanupPreferenceResizable = null;
    const frameId = requestAnimationFrame(() => {
      if (dividerElement && infoElement && rootEl) {
        cleanupPreferenceResizable = resizable(dividerElement, infoElement, rootEl, { minWidth: 100 });
      }
    });
    cleanups.push(() => {
      cancelAnimationFrame(frameId);
      if (typeof cleanupPreferenceResizable === "function") {
        cleanupPreferenceResizable();
        cleanupPreferenceResizable = null;
      }
    });
    const preferenceModal = rootEl.querySelector(".preference__modal");
    initButtonHandlers({
      btnCreate,
      btnEdit,
      btnDelete,
      preferenceModal,
      rootEl,
      name,
      renderTable,
      getDataFromStorage,
      cleanups
    });
    let cleanedUp = false;
    preference.cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      while (cleanups.length > 0) {
        const cleanup = cleanups.pop();
        if (typeof cleanup === "function") {
          cleanup();
        }
      }
      clearHeaderButtonState(headerButtons);
    };
    return preference;
  }

  // src/app/components/templates/preference/templates-shortcuts.js
  function renderShortcutsTemplate({ header } = {}) {
    return renderPreferencesTemplate({
      renderTable: renderPreferencesTableShortcuts,
      getDataFromStorage: getShortcutsFromLocalStorage,
      header,
      name: "shortcuts"
    });
  }

  // src/app/components/templates/preference/templates-environment.js
  function renderEnvironmentTemplate() {
    const environmentTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D environment \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438"
        })
      ]
    });
    return environmentTemplate;
  }

  // src/app/components/templates/preference/templates-folders.js
  function renderFoldersTemplate() {
    const foldersTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D folders \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438"
        })
      ]
    });
    return foldersTemplate;
  }

  // src/app/components/templates/preference/templates-registry.js
  function renderRegistryTemplate() {
    const registryTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D registry \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438"
        })
      ]
    });
    return registryTemplate;
  }

  // src/app/components/templates/preference/templates-driveMaps.js
  function renderDriveMapsTemplate() {
    const driveMapsTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D driveMaps \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438"
        })
      ]
    });
    return driveMapsTemplate;
  }

  // src/app/components/templates/preference/templates-networkShares.js
  function renderNetworkSharesTemplate() {
    const networkSharesTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D networkShares \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438"
        })
      ]
    });
    return networkSharesTemplate;
  }

  // src/app/components/templates/preference/templates-files.js
  function renderFilesTemplate() {
    const filesTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D files \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438"
        })
      ]
    });
    return filesTemplate;
  }

  // src/app/components/templates/preference/templates-iniFiles.js
  function renderIniFilesTemplate() {
    const iniFilesTemplate = createElement("div", {
      className: "gp__default-template",
      children: [
        createElement("div", {
          className: "default-template__message",
          text: "\u0428\u0430\u0431\u043B\u043E\u043D iniFiles \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438"
        })
      ]
    });
    return iniFilesTemplate;
  }

  // src/app/app.js
  var mainPolicy = null;
  var policyLoaded = false;
  var policyLoadCallbacks = [];
  
  // Функция-обёртка для require_policy_ru
  function require_policy_ru() {
    return mainPolicy;
  }
  
  // Функция для ожидания загрузки политики
  function waitForPolicy(callback, timeout) {
    if (policyLoaded && mainPolicy) {
      callback(mainPolicy);
      return Promise.resolve(mainPolicy);
    }
    
    return new Promise(function(resolve, reject) {
      var timer = null;
      
      var callbackWrapper = function(policy) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        callback(policy);
        resolve(policy);
      };
      
      policyLoadCallbacks.push(callbackWrapper);
      
      // Таймаут ожидания
      timer = setTimeout(function() {
        var index = policyLoadCallbacks.indexOf(callbackWrapper);
        if (index > -1) {
          policyLoadCallbacks.splice(index, 1);
        }
        reject(new Error("Policy load timeout after " + (timeout || 30000) + "ms"));
      }, timeout || 30000);
    });
  }
  
  function getPolicy(path, onSuccess, onError) {
    var policyPath = path || "/";
    if (typeof rpc === "undefined" || !rpc || typeof rpc.command !== "function") {
      var rpcError = new Error("Global rpc is not available.");
      console.error("[policy] Failed to execute getPolicy.", rpcError);
      if (typeof onError === "function") {
        onError(null, "rpc_unavailable", rpcError);
      }
      return;
    }
    if (typeof IPA === "undefined" || !IPA) {
      var ipaError = new Error("Global IPA is not available.");
      console.error("[policy] Failed to execute getPolicy.", ipaError);
      if (typeof onError === "function") {
        onError(null, "ipa_unavailable", ipaError);
      }
      return;
    }
    var command = rpc.command({
      entity: "gpo",
      method: "get_policy",
      args: [policyPath],
      options: {
        version: IPA.api_version
      },
      on_success: function(data) {
        var result = data && data.result ? data.result.result || {} : {};
        if (typeof onSuccess === "function") {
          onSuccess(result);
        }
      },
      on_error: function(xhr, text_status, error_thrown) {
        console.error("[policy] Failed to load policy.", error_thrown || text_status || xhr);
        if (typeof onError === "function") {
          onError(xhr, text_status, error_thrown);
        }
      }
    });
    command.execute();
  }
  function loadMainPolicy(path) {
    // Stage 1: load policy and store it separately without changing static UI data.
    getPolicy(path || "/", function(policy) {
      console.log('[loadMainPolicy] Policy loaded:', policy ? 'OK' : 'null');
      mainPolicy = policy;
      policyLoaded = true;
      
      // Вызываем все коллбеки ожидания
      console.log('[loadMainPolicy] Calling', policyLoadCallbacks.length, 'callbacks');
      policyLoadCallbacks.forEach(function(cb) {
        try {
          cb(mainPolicy);
        } catch (e) {
          console.error("Error in policy load callback:", e);
        }
      });
      policyLoadCallbacks = [];
      console.log('[loadMainPolicy] All callbacks executed');
    }, function(xhr, text_status, error_thrown) {
      console.error("[mainPolicy] Failed to initialize policy loading.", error_thrown || text_status || xhr);
    });
  }
  
  var treeViewState = {
    selectedItem: null,
    selectedPath: [],
    workspace: null,
    header: null,
    isHelpOpen: false,
    currentViewCleanup: null,
    treeData: [],
    treeItemElements: /* @__PURE__ */ new WeakMap(),
    treeListItemElements: /* @__PURE__ */ new WeakMap(),
    parentItems: /* @__PURE__ */ new WeakMap(),
    setWorkspace(workspace) {
      this.workspace = workspace;
    },
    setTreeData(treeData) {
      this.treeData = Array.isArray(treeData) ? treeData : [];
    },
    setHeader(header) {
      this.header = header;
    },
    initHelpControls() {
      const btnInformation = this.header?.getElement?.()?.querySelector(".gp__control-help .btn-information");
      if (!btnInformation) {
        return;
      }
      btnInformation.addEventListener("click", () => {
        this.toggleHelp();
      });
      this.syncHelpButtonState();
    },
    registerTreeNode(item, { treeItemElement = null, listItemElement = null, parentItem = null } = {}) {
      if (!item) {
        return;
      }
      if (treeItemElement instanceof Element) {
        this.treeItemElements.set(item, treeItemElement);
      }
      if (listItemElement instanceof Element) {
        this.treeListItemElements.set(item, listItemElement);
      }
      if (parentItem) {
        this.parentItems.set(item, parentItem);
        return;
      }
      this.parentItems.delete(item);
    },
    getPathToItem(item) {
      if (!item) {
        return [];
      }
      const path = [];
      let currentItem = item;
      while (currentItem) {
        path.unshift(currentItem);
        currentItem = this.parentItems.get(currentItem) ?? null;
      }
      return path;
    },
    setFolderOpened(item, opened) {
      if (item?.type !== "folder") {
        return Boolean(item?.opened);
      }
      const listItemElement = this.treeListItemElements.get(item) ?? null;
      return setFolderOpenedState(listItemElement, item, opened);
    },
    toggleFolder(item) {
      if (item?.type !== "folder" || !Array.isArray(item.children) || item.children.length === 0) {
        return Boolean(item?.opened);
      }
      return this.setFolderOpened(item, !item.opened);
    },
    openPathToItem(item) {
      const path = this.getPathToItem(item);
      path.slice(0, -1).forEach((pathItem) => {
        if (pathItem?.type === "folder") {
          this.setFolderOpened(pathItem, true);
        }
      });
      return path;
    },
    activateTreeItem(item, treeItemElement = null) {
      const nextTreeItemElement = treeItemElement ?? this.treeItemElements.get(item) ?? null;
      if (!nextTreeItemElement) {
        return null;
      }
      const treeContainer = nextTreeItemElement.closest(".tree-view") ?? document;
      return setTreeItemActive(nextTreeItemElement, treeContainer);
    },
    cleanupCurrentView() {
      if (typeof this.currentViewCleanup === "function") {
        this.currentViewCleanup();
      }
      this.currentViewCleanup = null;
    },
    setCurrentView(view) {
      this.currentViewCleanup = typeof view?.cleanup === "function" ? view.cleanup : null;
    },
    isFolderItemSelected() {
      return this.selectedItem?.item?.type === "folder";
    },
    isAdmxItemSelected() {
      return this.selectedItem?.item?.type === "file" && this.selectedItem?.item?.template === "admx";
    },
    isHelpToggleAvailable() {
      return this.isFolderItemSelected() || this.isAdmxItemSelected();
    },
    getCurrentHelpSourceItem() {
      if (this.isFolderItemSelected()) {
        return this.selectedItem?.item ?? null;
      }
      return [...this.selectedPath].reverse().find((pathItem) => pathItem?.type === "folder") ?? null;
    },
    buildViewWithPersistentHelp(view) {
      if (!this.isHelpOpen) {
        return view;
      }
      const helpSourceItem = this.getCurrentHelpSourceItem();
      const helpBlock = renderHelpBlock({
        help: helpSourceItem?.help,
        isOpen: this.isHelpOpen
      });
      if (!helpBlock) {
        return view;
      }
      return createElement("div", {
        className: "gp__list-children-wrapper",
        children: [view, helpBlock]
      });
    },
    syncHelpButtonState() {
      const btnInformation = this.header?.getElement?.()?.querySelector(".gp__control-help .btn-information");
      if (!btnInformation) {
        return;
      }
      btnInformation.classList.toggle("active", this.isHelpToggleAvailable());
    },
    syncHelpBlockState() {
      const workspaceEl = this.workspace?.getElement?.();
      const helpBlocks = workspaceEl?.querySelectorAll(".gp__list-children-help, .gp__admx-help");
      if (!helpBlocks || helpBlocks.length === 0) {
        return;
      }
      helpBlocks.forEach((helpBlock) => {
        helpBlock.classList.toggle("is-open", this.isHelpOpen);
      });
    },
    setHelpOpen(opened) {
      this.isHelpOpen = Boolean(opened);
      this.syncHelpBlockState();
      return this.isHelpOpen;
    },
    toggleHelp() {
      if (!this.isHelpToggleAvailable()) {
        return this.isHelpOpen;
      }
      return this.setHelpOpen(!this.isHelpOpen);
    },
    renderSelectedItem(item, element = null) {
      this.cleanupCurrentView();
      if (this.workspace) {
        this.workspace.clear();
      }
      this.setCurrentView(null);
      this.selectedPath = this.getPathToItem(item);
      this.selectedItem = { item, element };
      let templateResult = null;
      let renderedWorkspaceView = null;
      console.log("item)", item);
      if (item?.type === "folder") {
        templateResult = renderFolderTemplate({
          children: item.children ?? [],
          help: item.help,
          isHelpOpen: this.isHelpOpen,
          onItemClick: (childItem) => {
            this.navigateToNode(childItem, {
              openPath: true,
              openCurrentFolder: childItem?.type === "folder" ? true : void 0
            });
          }
        });
        renderedWorkspaceView = templateResult;
      } else if (item?.type === "file") {
        if (item.template === "scripts") {
          const headerClass = item.header?.class;
          if (headerClass === "Machine") {
            templateResult = renderScriptsTemplate();
          } else {
            templateResult = renderDefaultTemplate();
          }
        } else if (item.template === "admx") {
          templateResult = renderAdmxTemplate({
            isHelpOpen: this.isHelpOpen,
            header: this.header,
            item,
            admxTreePath: item?.admxTreePath
          });
        } else if (item.template !== "preferences") {
          templateResult = renderDefaultTemplate();
        } else {
          const headerClass = item.header?.class;
          if (headerClass !== "Machine") {
            templateResult = renderDefaultTemplate();
          } else {
            const preferenceTemplateMap = {
              shortcuts: renderShortcutsTemplate,
              environment: renderEnvironmentTemplate,
              folders: renderFoldersTemplate,
              registry: renderRegistryTemplate,
              driveMaps: renderDriveMapsTemplate,
              networkShares: renderNetworkSharesTemplate,
              files: renderFilesTemplate,
              iniFiles: renderIniFilesTemplate
            };
            const renderTemplate = preferenceTemplateMap[item.name] || renderDefaultTemplate;
            templateResult = renderTemplate({ header: this.header });
          }
        }
        renderedWorkspaceView = templateResult;
      }
      if (this.workspace && renderedWorkspaceView) {
        this.workspace.append(renderedWorkspaceView);
        this.setCurrentView(templateResult);
      }
      this.syncHelpButtonState();
      this.syncHelpBlockState();
    },
    navigateToNode(item, { treeItemElement = null, openPath = true, openCurrentFolder = void 0 } = {}) {
      if (!item) {
        return;
      }
      if (openPath) {
        this.openPathToItem(item);
      }
      if (item.type === "folder" && openCurrentFolder !== void 0) {
        this.setFolderOpened(item, openCurrentFolder);
      }
      const activeTreeItemElement = this.activateTreeItem(item, treeItemElement);
      this.renderSelectedItem(item, activeTreeItemElement);
    },
    initializeSelection() {
      if (this.selectedItem?.item) {
        return;
      }
      const firstRootItem = this.treeData[0] ?? null;
      if (!firstRootItem) {
        return;
      }
      this.navigateToNode(firstRootItem, {
        openPath: true,
        openCurrentFolder: firstRootItem.type === "folder" ? true : void 0
      });
    }
  };
    options = options || {};
    initShortcutsStorage();
    initAdmxStorage();
    loadMainPolicy(options.path || "/");
    var container = document.getElementById(options.containerId || "gp__container");
    if (container) {
      const header = renderHeader(container);
      treeViewState.setHeader(header);
      treeViewState.initHelpControls();
      const { main, treeView, divider } = renderMain(container, treeViewState);
      renderFooter(container);
      const dividerElement = divider.getElement();
      const treeViewElement = treeView.getElement();
      const mainElement = main.getElement();
      resizable(dividerElement, treeViewElement, mainElement);
    }
  }
  return {
    init: init
  };
});
