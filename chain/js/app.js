(() => {
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
        })
      ]
    });
    container2.appendChild(element.getElement());
    return element;
  }

  // src/app/locales/en.js
  var en_default = {
    // Общие тексты
    common: {
      form: "Form",
      dialog: "Dialog",
      help: "Help:",
      description: "Description:",
      options: "Options:",
      edit: "Edit",
      yes: "Yes",
      no: "No",
      name: "Name",
      path: "path",
      level: "level",
      default: "Default",
      cancel: "Cancel",
      ok: "OK",
      open: "Open",
      save: "Save",
      delete: "Delete",
      add: "Add",
      new: "New",
      allFiles: "All files (*.*)",
      fileName: "File name",
      fileType: "File type",
      lookIn: "Look in",
      openFile: "Open File",
      openDirectory: "Open Directory",
      information: "Information message",
      value: "Value:",
      valueGreaterThanMax: " is greater than maximum allowed value of:",
      valueLessThanMin: " is less than minimum allowed value of:",
      maxSet: ". Maximum allowed value has been set.",
      minSet: ". Minimum allowed value has been set."
    },
    // О приложении
    about: {
      title: "About GPUI",
      copyright: "Copyright (C) 2022-2023 BaseALT Ltd.",
      version: "Version "
    },
    // Главное окно
    mainWindow: {
      title: "GPUI",
      search: "Search...",
      file: "&File",
      view: "&View",
      help: "&Help",
      goBack: "Go &Back",
      goBackTooltip: "Go Back",
      goForward: "Go &Forward",
      goForwardTooltip: "Go Forward",
      goUp: "Go &Up",
      goUpTooltip: "Go Up",
      reload: "&Reload",
      reloadTooltip: "Reload",
      smallIcons: "&Small Icon View",
      smallIconsTooltip: "Small Icon View",
      largeIcons: "&Large Icon View",
      largeIconsTooltip: "Large Icon View",
      compactList: "&Compact List View",
      compactListTooltip: "Compact List View",
      detailedList: "&Detailed List View",
      detailedListTooltip: "Detailed List View",
      options: "&Options",
      optionsTooltip: "Options",
      exit: "&Exit",
      exitTooltip: "Exit",
      addRemoveColumns: "&Add/Remove Columns",
      addRemoveColumnsTooltip: "Add/Remove Columns",
      selectDC: "&Select DC",
      selectDomainController: "Select Domain Controller",
      customize: "&Customize",
      customizeTooltip: "Customize",
      openPolicyDirectory: "Open &Policy Directory",
      openUserRegistry: "Open &User Registry Source",
      saveRegistry: "&Save Registry Source",
      openMachineRegistry: "Open &Machine Registry Source",
      language: "&Language",
      about: "&About",
      manual: "&Manual",
      shortcuts: {
        altLeft: "Alt+Left",
        altRight: "Alt+Right",
        altUp: "Alt+Up",
        ctrlR: "Ctrl+R",
        ctrlA: "Ctrl+A",
        ctrlO: "Ctrl+O",
        ctrlS: "Ctrl+S"
      }
    },
    // Политики
    policies: {
      domainGroupPolicy: "[Domain Group Policy]",
      localGroupPolicy: "[Local Group Policy]",
      localGroupPolicies: "Local group policies templates",
      machine: "Machine",
      machineLevelPolicies: "Machine level policies",
      user: "User",
      userLevelPolicies: "User level policies",
      adminTemplates: "Administrative Templates",
      machineAdminTemplates: "Machine administrative templates",
      userAdminTemplates: "User administrative templates",
      policyState: "Policy State",
      notConfigured: "Not Configured",
      enabled: "Enabled",
      disabled: "Disabled",
      supportedOn: "Supported on:"
    },
    // Языки
    languages: {
      english: "English",
      russian: "Russian"
    },
    // Диалоги
    dialogs: {
      listBoxDialog: "List Dialog",
      saveSettingsTitle: "Save settings dialog",
      saveSettingsMessage: "Policy settings were modified do you want to save them?"
    },
    // Командная строка
    cli: {
      policyPath: "The full path of policy to edit.",
      policyBundlePath: "The full path of policy bundle to load.",
      compatibilityNote: "This options left for compatibility with ADMC. Currently it does nothing.",
      policyName: "The name of a policy to display.",
      help: "Displays help on commandline options.",
      consoleLogLevel: "Set log level for console.",
      syslogLogLevel: "Set log level for syslog.",
      fileLogLevel: "Set log level for file in ~/.local/share/gpui/.",
      badPolicyPath: "Bad policy path:",
      badLogLevel: "Bad log level:",
      badPolicyName: "Bad policy name:"
    },
    // Настройки (Preferences)
    preferences: {
      environment: "Environment",
      files: "Files",
      folders: "Folders",
      registry: "Registry",
      networkShares: "Network Shares",
      driveMaps: "Drive Maps",
      iniFiles: "Ini File",
      shortcut: "Shortcut",
      shortcuts: "Shortcuts"
    },
    // Сообщения
    messages: {
      appliedChanges: "Applied changes for policy:",
      error: "Error",
      errorWritingFile: "Error writing file:",
      errorReadingFile: "Error reading file:"
    },
    // Drives Widget
    drives: {
      form: "Form",
      hideShowDrive: "Hide/Show this drive",
      noChange: "No change",
      hideThisDrive: "Hide this drive",
      showThisDrive: "Show this drive",
      hideShowAllDrives: "Hide/Show all drive",
      hideAllDrives: "Hide all drive",
      showAllDrives: "Show all drive",
      action: "Action:",
      create: "Create",
      update: "Update",
      delete: "Delete",
      reconnect: "Reconnect:",
      location: "Location:",
      labelAs: "Label as:",
      ellipsis: "...",
      driveLetter: "Drive letter",
      existing: "Existing:",
      useFirstAvailable: "Use first available, starting at:"
    },
    // Files Widget
    files: {
      form: "Form",
      action: "Action:",
      create: "Create",
      update: "Update",
      delete: "Delete",
      sourceFiles: "Source file(s):",
      placeholder: "Placeholder",
      ellipsis: "...",
      destination: "Destination:",
      suppressErrors: "Supress errors on individual file actions",
      attributes: "Attributes",
      readOnly: "Read-only",
      hidden: "Hidden",
      archive: "Archive"
    },
    // Folders Widget
    folders: {
      form: "Form",
      action: "Action:",
      create: "Create",
      update: "Update",
      delete: "Delete",
      path: "Path:",
      placeholder: "Placeholder",
      attributes: "Attributes",
      readOnly: "Read-only",
      hidden: "Hidden",
      archive: "Archive",
      deleteIfEmptied: "Delete this folder (if emptied)",
      recursivelyDelete: "Recrusively delete subfolders (if emptied)",
      deleteAllFiles: "Delete all files in the filder(s)",
      allowReadOnlyDeletion: "Allow deletion of read-only files/folders",
      ignoreErrors: "Ignore errors for files/folders cannot be deleted",
      ellipsis: "..."
    },
    // INI Widget
    ini: {
      form: "Form",
      action: "Action:",
      create: "Create",
      update: "Update",
      delete: "Delete",
      filePath: "File path",
      sectionName: "Section Name",
      propertyName: "Property Name",
      propertyValue: "Property Value",
      ellipsis: "..."
    },
    // Shares Widget
    shares: {
      form: "Form",
      action: "Action:",
      create: "Create",
      update: "Update",
      delete: "Delete",
      shareName: "Share name:",
      folderPath: "Folder path:",
      comment: "Comment:",
      ellipsis: "...",
      actionModifiers: "Action\nModifiers:",
      updateAllRegular: "Update all regular shares",
      updateAllHidden: "Update all hidden non-administrative\nshares",
      updateAllAdmin: "Update all administrative\ndrive-letter shares",
      userLimit: "User limit:",
      noChange: "No change",
      maximumAllowed: "Maximum allowed",
      allowUsers: "Alow this number of users:",
      accessBasedEnum: "Access-based\nEnumeration:",
      enable: "Enable",
      disable: "Disable"
    },
    // Shortcuts Widget
    shortcuts: {
      form: "Form",
      action: "Action:",
      create: "Create",
      replace: "Replace",
      update: "Update",
      delete: "Delete",
      ellipsis: "...",
      targetType: "Target type:",
      filesystem: "FILESYSTEM",
      url: "URL",
      shell: "SHELL",
      location: "Location:",
      specifyFullPath: "<Specify full path>",
      desktop: "Desktop",
      startMenu: "Start Menu",
      programs: "Programs",
      startUp: "StartUp",
      explorerFavorites: "Explorer Favorites",
      explorerLinks: "Explorer Links",
      sendTo: "Send To",
      recent: "Recent",
      quickLaunch: "Quick Launch ToolBar",
      myNetworkPlaces: "My Network Places",
      allUsersDesktop: "All Users Desktop",
      allUsersStartMenu: "All Users Start Menu",
      allUsersPrograms: "All Users Programs",
      allUsersStartUp: "All Users StartUp",
      allUsersExplorerFavorites: "All Users Explorer Favorites",
      name: "Name:",
      targetPath: "Target path:",
      arguments: "Arguments:",
      iconFilePath: "Icon file path:",
      iconIndex: "Icon index:",
      startIn: "Start in:",
      shortcutKey: "Shortcut key:",
      run: "Run:",
      normalWindow: "Normal Window",
      minimized: "Minimized",
      maximized: "Maximized",
      comment: "Comment:"
    },
    // Variables Widget
    variables: {
      form: "Form",
      details: "Details",
      placeholder: "Placeholder",
      value: "Value:",
      name: "Name:",
      or: "or",
      path: "PATH",
      partial: "Partial",
      action: "Action:",
      create: "Create",
      update: "Update",
      delete: "Delete",
      variableType: "Variable Type",
      userVariable: "User Variable",
      systemVariable: "System Variable"
    },
    // Common Widget
    commonWidget: {
      form: "Form",
      options: "Options:",
      stopOnError: "Stop processing items in this extension if an\nerror occurs.",
      runInUserContext: "Run in logged-on user's security\ncontext (user policy option).",
      removeWhenNotApplied: "Remove this item when it is no longer applied.",
      applyOnce: "Apply once and do not reapply.",
      itemLevelTargeting: "Item-level targeting.",
      targeting: "Targetting...",
      description: "Description:"
    },
    // SMB File Browser
    smb: {
      dialog: "Dialog",
      back: "back",
      up: "Up"
    }
  };

  // src/app/locales/ru.js
  var ru_default = {
    // Общие тексты
    common: {
      form: "\u0424\u043E\u0440\u043C\u0430",
      dialog: "\u0414\u0438\u0430\u043B\u043E\u0433",
      help: "\u041F\u043E\u043C\u043E\u0449\u044C:",
      description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:",
      options: "\u041E\u043F\u0446\u0438\u0438:",
      edit: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
      yes: "\u0414\u0430",
      no: "\u041D\u0435\u0442",
      name: "\u0418\u043C\u044F",
      path: "\u043F\u0443\u0442\u044C",
      level: "\u0443\u0440\u043E\u0432\u0435\u043D\u044C",
      default: "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
      cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
      ok: "OK",
      open: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C",
      save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
      delete: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
      add: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
      new: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
      allFiles: "\u0412\u0441\u0435 \u0444\u0430\u0439\u043B\u044B (*.*)",
      fileName: "\u0418\u043C\u044F \u0444\u0430\u0439\u043B\u0430",
      fileType: "\u0422\u0438\u043F \u0444\u0430\u0439\u043B\u043E\u0432",
      lookIn: "\u0418\u0441\u043A\u0430\u0442\u044C \u0432",
      openFile: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0444\u0430\u0439\u043B",
      openDirectory: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u043F\u043A\u0443",
      information: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F",
      value: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435:",
      valueGreaterThanMax: " \u0431\u043E\u043B\u044C\u0448\u0435 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0433\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F:",
      valueLessThanMin: " \u043C\u0435\u043D\u044C\u0448\u0435 \u0447\u0435\u043C \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435:",
      maxSet: ". \u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0431\u044B\u043B\u043E \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E.",
      minSet: ". \u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0431\u044B\u043B\u043E \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E."
    },
    // О приложении
    about: {
      title: "\u041E \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 GPUI",
      copyright: "\u0410\u0432\u0442\u043E\u0440\u0441\u043A\u0438\u0435 \u043F\u0440\u0430\u0432\u0430: \u041E\u041E\u041E \xAB\u0411\u0430\u0437\u0430\u043B\u044C\u0442 \u0421\u041F\u041E\xBB, 2022-2023.",
      version: "\u0412\u0435\u0440\u0441\u0438\u044F "
    },
    // Главное окно
    mainWindow: {
      title: "GPUI",
      search: "\u041F\u043E\u0438\u0441\u043A...",
      file: "\u0424\u0430\u0439\u043B",
      view: "\u0412\u0438\u0434",
      help: "\u041F\u043E\u043C\u043E\u0449\u044C",
      goBack: "\u041D\u0430\u0437\u0430\u0434",
      goForward: "\u0412\u043F\u0435\u0440\u0451\u0434",
      goUp: "\u0412\u0432\u0435\u0440\u0445",
      reload: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
      smallIcons: "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u0438\u043A\u043E\u043D\u043A\u0438",
      largeIcons: "\u0411\u043E\u043B\u044C\u0448\u0438\u0435 \u0438\u043A\u043E\u043D\u043A\u0438",
      compactList: "\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A",
      detailedList: "\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A",
      options: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      exit: "\u0412\u044B\u0445\u043E\u0434",
      addRemoveColumns: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C/\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043A\u043E\u043B\u043E\u043D\u043A\u0438",
      selectDC: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0435\u0440 \u0434\u043E\u043C\u0435\u043D\u0430",
      selectDomainController: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0435\u0440 \u0434\u043E\u043C\u0435\u043D\u0430",
      customize: "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C",
      openPolicyDirectory: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u043F\u043A\u0443 \u0441 ADMX \u0444\u0430\u0439\u043B\u0430\u043C\u0438",
      openUserRegistry: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 POL \u0444\u0430\u0439\u043B",
      saveRegistry: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      openMachineRegistry: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0430\u0448\u0438\u043D\u043D\u044B\u0439 POL \u0444\u0430\u0439\u043B",
      language: "\u042F\u0437\u044B\u043A",
      about: "\u041E \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438",
      manual: "\u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E",
      shortcuts: {
        altLeft: "Alt+Left",
        altRight: "Alt+Right",
        altUp: "Alt+Up",
        ctrlR: "Ctrl+R",
        ctrlA: "Ctrl+A",
        ctrlO: "Ctrl+O",
        ctrlS: "Ctrl+S"
      }
    },
    // Политики
    policies: {
      domainGroupPolicy: "[\u0414\u043E\u043C\u0435\u043D\u043D\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u043E\u0432\u0430\u044F \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0430]",
      localGroupPolicy: "[\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u043E\u0432\u0430\u044F \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0430]",
      localGroupPolicies: "\u0428\u0430\u0431\u043B\u043E\u043D \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0433\u0440\u0443\u043F\u043F\u043E\u0432\u044B\u0445 \u043F\u043E\u043B\u0438\u0442\u0438\u043A",
      machine: "\u041A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440",
      machineLevelPolicies: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0430",
      user: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C",
      userLevelPolicies: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439",
      adminTemplates: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u044B",
      machineAdminTemplates: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u044B \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0430",
      userAdminTemplates: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u044B"
    },
    // Языки
    languages: {
      english: "\u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439",
      russian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439"
    },
    // Диалоги
    dialogs: {
      listBoxDialog: "\u0414\u0438\u0430\u043B\u043E\u0433 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u043F\u0438\u0441\u043A\u0430",
      saveSettingsTitle: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A",
      saveSettingsMessage: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E\u043B\u0438\u0442\u043A\u0438 \u0431\u044B\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u044B, \u0445\u043E\u0442\u0438\u0442\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0445?"
    },
    // Командная строка
    cli: {
      policyPath: "\u041F\u043E\u043B\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u0434\u043B\u044F \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u0435\u043C\u043E\u0439 \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0438.",
      policyBundlePath: "\u041F\u043E\u043B\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043A \u043D\u0430\u0431\u043E\u0440\u0443 ADMX \u0444\u0430\u0439\u043B\u043E\u0432.",
      compatibilityNote: "\u041E\u043F\u0446\u0438\u044F \u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430 \u0434\u043B\u044F \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u0438 \u0441 ADMC. \u041E\u043D\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0434\u0435\u043B\u0430\u0435\u0442.",
      policyName: "\u0418\u043C\u044F \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0438 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F.",
      help: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043E\u043F\u0446\u0438\u0439 \u043A\u043E\u043C\u043C\u0430\u043D\u0434\u043D\u043E\u0439 \u0441\u0442\u0440\u043E\u043A\u0438.",
      consoleLogLevel: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043B\u043E\u0433\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0434\u043B\u044F \u043A\u043E\u043D\u0441\u043E\u043B\u0438.",
      syslogLogLevel: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043B\u043E\u0433\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0434\u043B\u044F syslog.",
      fileLogLevel: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043B\u043E\u0433\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0434\u043B\u044F \u0444\u0430\u0439\u043B\u0430 \u0432 ~/.local/share/gpui/.",
      badPolicyPath: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043A \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0435:",
      badLogLevel: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043B\u043E\u0433\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F:",
      badPolicyName: "\u041E\u0448\u0438\u0431\u043E\u0447\u043D\u043E\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0438:"
    },
    // Настройки (Preferences)
    preferences: {
      title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      description: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A.",
      systemSettings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0421\u0438\u0441\u0442\u0435\u043C\u044B",
      systemSettingsDesc: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0438 \u0443\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u044E\u0449\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B.",
      environment: "\u041E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u0435",
      environmentDesc: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u043E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u044F.",
      files: "\u0424\u0430\u0439\u043B\u044B",
      filesDesc: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0444\u0430\u0439\u043B\u043E\u0432.",
      folders: "\u041F\u0430\u043F\u043A\u0438",
      foldersDesc: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0430\u043F\u043E\u043A.",
      iniFiles: "Ini \u0444\u0430\u0439\u043B\u044B",
      iniFilesDesc: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Ini \u0444\u0430\u0439\u043B\u043E\u0432.",
      registry: "\u0420\u0435\u0435\u0441\u0442\u0440",
      registryDesc: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E\u043B\u0438\u0442\u0438\u043A \u0440\u0435\u0435\u0441\u0442\u0440\u0430.",
      networkShares: "\u0421\u0435\u0442\u0435\u0432\u044B\u0435 \u043F\u0430\u043F\u043A\u0438",
      networkSharesDesc: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0435\u0442\u0435\u0432\u044B\u0445 \u043F\u0430\u043F\u043E\u043A.",
      shortcuts: "\u0417\u043D\u0430\u0447\u043A\u0438",
      shortcutsDesc: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0437\u043D\u0430\u0447\u043A\u043E\u0432.",
      driveMaps: "\u0421\u0435\u0442\u0435\u0432\u044B\u0435 \u0434\u0438\u0441\u043A\u0438",
      driveMapsDesc: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0435\u0442\u0435\u0432\u044B\u0445 \u0434\u0438\u0441\u043A\u043E\u0432.",
      // Типы политик
      mappedDrive: "\u0421\u0435\u0442\u0435\u0432\u043E\u0439 \u0434\u0438\u0441\u043A",
      environmentVariable: "\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0435 \u043E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u044F",
      file: "\u0424\u0430\u0439\u043B",
      folder: "\u041F\u0430\u043F\u043A\u0438",
      iniFile: "Ini \u0444\u0430\u0439\u043B",
      registryValue: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0440\u0435\u0435\u0441\u0442\u0440\u0430",
      networkShare: "\u0421\u0435\u0442\u0435\u0432\u0430\u044F \u043F\u0430\u043F\u043A\u0430",
      shortcut: "\u0417\u043D\u0430\u0447\u043E\u043A",
      dataSource: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0434\u0430\u043D\u043D\u044B\u0445",
      device: "\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E",
      localGroup: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430",
      localUser: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C",
      vpnConnection: "VPN \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435",
      dialUpConnection: "Dial-Up \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435",
      powerOptions: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0438\u0442\u0430\u043D\u0438\u0435\u043C",
      powerScheme: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0445\u0435\u043C \u043F\u0438\u0442\u0430\u043D\u0438\u044F",
      sharedPrinter: "\u041E\u0431\u0449\u0438\u0439 \u043F\u0440\u0438\u043D\u0442\u0435\u0440",
      tcpipPrinter: "TCP/IP \u041F\u0440\u0438\u043D\u0442\u0435\u0440",
      localPrinter: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u0438\u043D\u0442\u0435\u0440",
      folderOptions: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0430\u043F\u043E\u043A",
      openWith: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E",
      // Действия
      actions: {
        create: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C",
        replace: "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C",
        update: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
        delete: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"
      }
    },
    // Сообщения
    messages: {
      appliedChanges: "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u044B \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0438:"
    }
  };

  // src/app/locales/translations.js
  var translations = { en: en_default, ru: ru_default };
  var currentLang = "ru";
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
      template: "preferences"
    },
    {
      title: t("preferences.environment"),
      name: "environment",
      type: "file",
      icon: "ico-file",
      template: "preferences"
    },
    {
      title: "\u041F\u0430\u043F\u043A\u0438",
      name: "folders",
      type: "file",
      icon: "ico-file",
      template: "preferences"
    },
    {
      title: "\u0420\u0435\u0435\u0441\u0442\u0440",
      name: "registry",
      type: "file",
      icon: "ico-file",
      template: "preferences"
    },
    {
      title: "\u0421\u0435\u0442\u0435\u0432\u044B\u0435 \u0434\u0438\u0441\u043A\u0438",
      name: "driveMaps",
      type: "file",
      icon: "ico-file",
      template: "preferences"
    },
    {
      title: "\u0421\u0435\u0442\u0435\u0432\u044B\u0435 \u043F\u0430\u043F\u043A\u0438",
      name: "networkShares",
      type: "file",
      icon: "ico-file",
      template: "preferences"
    },
    {
      title: "\u0424\u0430\u0439\u043B\u044B",
      name: "files",
      type: "file",
      icon: "ico-file",
      template: "preferences"
    },
    {
      title: "Ini \u0444\u0430\u0439\u043B\u044B",
      name: "iniFiles",
      type: "file",
      icon: "ico-file",
      template: "preferences"
    }
  ];

  // src/app/components/tree-view/tree-view-list-data.js
  var treeViewList = [
    {
      title: t("policies.localGroupPolicy"),
      type: "folder",
      opened: true,
      icon: null,
      children: [
        {
          title: "\u041A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440",
          type: "folder",
          opened: true,
          icon: "ico-computer",
          children: [
            {
              title: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u044B",
              type: "folder",
              opened: false,
              icon: "ico-folder",
              children: [
                {
                  title: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 Alt",
                  type: "folder",
                  opened: false,
                  icon: "ico-folder",
                  children: [
                    {
                      title: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C",
                      type: "file",
                      icon: "ico-folder"
                    },
                    {
                      title: "\u0412\u0438\u0440\u0442\u0443\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F",
                      type: "file",
                      icon: "ico-folder"
                    },
                    {
                      title: "\u0413\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u043E\u0434\u0441\u0438\u0441\u0442\u0435\u043C\u0430",
                      type: "file",
                      icon: "ico-folder"
                    },
                    {
                      title: "...",
                      type: "file",
                      icon: "ico-folder"
                    }
                  ]
                }
              ]
            },
            {
              title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
              type: "folder",
              opened: true,
              icon: "ico-folder",
              children: [
                {
                  title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B",
                  type: "folder",
                  opened: true,
                  icon: "ico-folder",
                  children: treepreferences
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
                  type: "folder",
                  opened: false,
                  icon: "ico-folder"
                }
              ]
            }
          ]
        },
        {
          title: t("policies.user"),
          type: "folder",
          opened: true,
          icon: "ico-user",
          children: [
            {
              title: t("policies.adminTemplates"),
              type: "folder",
              opened: false,
              icon: "ico-folder"
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

  // src/app/components/tree-view/tree-view-list.js
  function renderTreeItem(item, treeViewState2) {
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
    if (item.children && item.children.length > 0) {
      const nestedList = renderTreeList(item.children, treeViewState2);
      listItem.append(nestedList);
      if (item.type === "folder" && !item.opened) {
        nestedList.setStyle({ display: "none" });
      }
    }
    treeItem.on("click", (e) => {
      e.stopPropagation();
      const clickedElement = e.currentTarget;
      const allTreeItems = document.querySelectorAll(".tree-item");
      allTreeItems.forEach((treeItemEl) => {
        treeItemEl.classList.remove("active");
      });
      clickedElement.classList.add("active");
      if (item.type === "folder" && item.children && item.children.length > 0) {
        toggleFolder(listItem, item);
      }
      if (treeViewState2) {
        treeViewState2.setSelectedItem(item, clickedElement);
      }
    });
    return listItem;
  }
  function renderTreeList(items, treeViewState2) {
    const list = createElement("ul", {
      className: "tree-view__list",
      children: items.map((item) => renderTreeItem(item, treeViewState2))
    });
    return list;
  }
  function toggleFolder(listItem, item) {
    const element = listItem.getElement();
    const nestedList = element.querySelector("ul.tree-view__list");
    if (!nestedList) return;
    const isOpened = element.classList.contains("opened");
    if (isOpened) {
      element.classList.remove("opened");
      element.classList.add("closed");
      nestedList.style.display = "none";
      item.opened = false;
    } else {
      element.classList.remove("closed");
      element.classList.add("opened");
      nestedList.style.display = "";
      item.opened = true;
    }
  }
  function renderTreeViewList(data = treeViewList, workspace = null, treeViewState2 = null) {
    if (workspace && treeViewState2) {
      treeViewState2.setWorkspace(workspace);
    }
    return renderTreeList(data, treeViewState2);
  }

  // src/app/components/tree-view/tree-view.js
  function renderTreeView(workspace = null, treeViewState2 = null) {
    const element = createElement("div", {
      className: "tree-view",
      children: [renderTreeViewList(void 0, workspace, treeViewState2)]
    });
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
    const minWidth = options.minWidth || 50;
    const maxWidth = options.maxWidth || container2.offsetWidth - 50;
    let isResizing = false;
    let startX;
    let startWidth;
    divider.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = panel.offsetWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      const newWidth = startWidth + (e.clientX - startX);
      const calculatedMaxWidth = maxWidth === container2.offsetWidth - 50 ? container2.offsetWidth - 50 : maxWidth;
      if (newWidth >= minWidth && newWidth <= calculatedMaxWidth) {
        panel.style.width = `${newWidth}px`;
      }
    });
    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
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
  var shortcutsData = [
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
        "TARGET_TYPE": 3,
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
  function initShortcutsLocalStorage() {
    if (!localStorage.getItem("shortcuts")) {
      localStorage.setItem("shortcuts", JSON.stringify(shortcutsData));
      console.log("Shortcuts localStorage initialized with 3 entries");
    } else {
      console.log("Shortcuts localStorage already exists");
    }
  }
  initShortcutsLocalStorage();
  function getShortcutsFromLocalStorage() {
    const data = localStorage.getItem("shortcuts");
    return data ? JSON.parse(data) : [];
  }
  function saveShortcutsToLocalStorage(shortcuts) {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
  }

  // src/app/components/workspace/preferences-table-shortcuts.js
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

  // src/app/components/workspace/preferences-template-shortcuts.js
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
                    type: "text",
                    placeholder: "/home/user"
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

  // src/app/components/workspace/create-preference.js
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
        const v = Number(normalizedBasic.TARGET_TYPE);
        normalizedBasic.TARGET_TYPE = Number.isNaN(v) ? 0 : Math.max(0, Math.min(2, Math.floor(v)));
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

  // src/app/components/workspace/preferences-template.js
  function renderPreferencesTemplate() {
    const preference = createElement("div", {
      className: "gp__preference",
      children: [
        // preference__info
        createElement("div", {
          className: "preference__info",
          children: [
            // preference__settings
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
            // preference__description
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
        // preference__divider
        createElement("div", {
          className: "preference__divider",
          children: [
            createElement("div", {
              className: "divider__line"
            })
          ]
        }),
        // preference__data-table
        createElement("div", {
          className: "preference__data-table",
          children: [
            renderPreferencesTableShortcuts()
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
                          if (mode === "create" || mode === "edit") {
                            savePreferencesFromModal(modal);
                            const storageKey = modal.getAttribute("data-preferences-name");
                            if (storageKey === "shortcuts") {
                              const preferenceRoot = modal.closest(".gp__preference");
                              const tableContainer = preferenceRoot?.querySelector(".preference__data-table");
                              if (tableContainer) {
                                const indexAttr = modal.getAttribute("data-preferences-index");
                                const list = getShortcutsFromLocalStorage();
                                const activeIndex = indexAttr !== null && indexAttr !== "" ? Math.min(parseInt(indexAttr, 10), list.length - 1) : list.length - 1;
                                tableContainer.innerHTML = "";
                                tableContainer.appendChild(renderPreferencesTableShortcuts([], activeIndex).getElement());
                              }
                            }
                            modal.classList.remove("active");
                          }
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
      basicTabButton.addEventListener("click", () => {
        if (!basicTabButton.classList.contains("active")) {
          basicTabButton.classList.add("active");
          basicTabContent.classList.add("active");
          generalTabButton.classList.remove("active");
          generalTabContent.classList.remove("active");
        }
      });
      generalTabButton.addEventListener("click", () => {
        if (!generalTabButton.classList.contains("active")) {
          generalTabButton.classList.add("active");
          generalTabContent.classList.add("active");
          basicTabButton.classList.remove("active");
          basicTabContent.classList.remove("active");
        }
      });
    }
    const dividerElement = rootEl.querySelector(".preference__divider");
    const infoElement = rootEl.querySelector(".preference__info");
    const containerElement = rootEl;
    requestAnimationFrame(() => {
      if (dividerElement && infoElement && containerElement) {
        resizable(dividerElement, infoElement, containerElement, { minWidth: 100 });
      }
    });
    return preference;
  }

  // src/app/components/workspace/delete-preference.js
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

  // src/app/components/workspace/edit-preference.js
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

  // src/app/components/tree-view/default-template.js
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

  // src/app/app.js
  var treeViewState = {
    selectedItem: null,
    workspace: null,
    header: null,
    btnCreateHandler: null,
    setWorkspace(workspace) {
      this.workspace = workspace;
    },
    setHeader(header) {
      this.header = header;
    },
    setSelectedItem(item, element) {
      if (this.btnCreateHandler && this.header) {
        const btnCreate = this.header.getElement().querySelector(".preferences__btn-create");
        if (btnCreate) {
          btnCreate.removeEventListener("click", this.btnCreateHandler);
        }
        this.btnCreateHandler = null;
      }
      this.selectedItem = { item, element };
      const template = item.template;
      if (template === "preferences") {
        const namePreference = item.name;
        if (namePreference) {
          if (this.workspace) {
            this.workspace.clear();
            const preferencesTemplate = renderPreferencesTemplate();
            this.workspace.append(preferencesTemplate);
          }
          if (this.header) {
            this.header.addClass("active");
            const headerEl = this.header.getElement();
            const btnCreate = headerEl.querySelector(".preferences__btn-create");
            const btnEdit = headerEl.querySelector(".preferences__btn-edit");
            const btnDelete = headerEl.querySelector(".preferences__btn-delete");
            [btnCreate, btnEdit, btnDelete].forEach((btn) => {
              if (btn) {
                btn.setAttribute("data-preferences-name", namePreference);
                if (btn !== btnCreate) btn.classList.remove("active");
              }
            });
            if (btnCreate) {
              btnCreate.classList.add("active");
              this.btnCreateHandler = (e) => {
                if (btnCreate.classList.contains("active") && this.workspace) {
                  const preferenceModal = this.workspace.getElement().querySelector(".preference__modal");
                  if (preferenceModal) {
                    const name = btnCreate.getAttribute("data-preferences-name");
                    if (name != null) preferenceModal.setAttribute("data-preferences-name", name);
                    resetModalFormToDefaults(preferenceModal);
                    preferenceModal.removeAttribute("data-preferences-index");
                    setModalCreateMode(preferenceModal);
                    preferenceModal.classList.add("active");
                  }
                }
              };
              btnCreate.addEventListener("click", this.btnCreateHandler);
            }
            if (btnEdit) {
              btnEdit.classList.add("active");
            }
            if (btnDelete) {
              btnDelete.classList.add("active");
            }
          }
        }
      } else {
        if (this.workspace) {
          this.workspace.clear();
          const defaultTemplate = renderDefaultTemplate();
          this.workspace.append(defaultTemplate);
        }
        if (this.header) {
          this.header.removeClass("active");
          const headerEl = this.header.getElement();
          [".preferences__btn-create", ".preferences__btn-edit", ".preferences__btn-delete"].forEach((sel) => {
            const btn = headerEl.querySelector(sel);
            if (btn) {
              btn.classList.remove("active");
              btn.removeAttribute("data-preferences-name");
              btn.removeAttribute("data-preferences-index");
            }
          });
        }
      }
    }
  };
  var container = document.getElementById("gp__container");
  if (container) {
    const header = renderHeader(container);
    treeViewState.setHeader(header);
    const { main, treeView, divider, workspace } = renderMain(container, treeViewState);
    renderFooter(container);
    const dividerElement = divider.getElement();
    const treeViewElement = treeView.getElement();
    const mainElement = main.getElement();
    resizable(dividerElement, treeViewElement, mainElement);
    document.addEventListener("preferences-row-select", (e) => {
      const headerEl = header.getElement();
      const btnCreate = headerEl.querySelector(".preferences__btn-create");
      const btnDelete2 = headerEl.querySelector(".preferences__btn-delete");
      const btnEdit2 = headerEl.querySelector(".preferences__btn-edit");
      const index = e.detail.index;
      const name = btnCreate?.getAttribute("data-preferences-name");
      [btnCreate, btnEdit2, btnDelete2].forEach((btn) => {
        if (btn) {
          btn.setAttribute("data-preferences-index", String(index));
          if (name != null) btn.setAttribute("data-preferences-name", name);
        }
      });
      if (btnDelete2) btnDelete2.classList.add("active");
      if (btnEdit2) btnEdit2.classList.add("active");
    });
    const btnDelete = header.getElement().querySelector(".preferences__btn-delete");
    if (btnDelete) {
      btnDelete.addEventListener("click", () => {
        if (btnDelete.classList.contains("active")) {
          handleDeletePreference(btnDelete, workspace);
        }
      });
    }
    const btnEdit = header.getElement().querySelector(".preferences__btn-edit");
    if (btnEdit) {
      btnEdit.addEventListener("click", () => {
        if (btnEdit.classList.contains("active") && workspace) {
          const preferenceModal = workspace.getElement().querySelector(".preference__modal");
          if (preferenceModal) {
            const name = btnEdit.getAttribute("data-preferences-name");
            const tabBasicElement = document.getElementById("tab-basic");
            if (tabBasicElement) {
              tabBasicElement.innerHTML = "";
              if (name === "shortcuts") {
                const shortcutsTemplate = renderPreferencesShortcutsTemplate();
                console.log(shortcutsTemplate);
                if (shortcutsTemplate && typeof shortcutsTemplate.getElement === "function") {
                  tabBasicElement.appendChild(shortcutsTemplate.getElement());
                }
              }
            }
            openModalForEdit(btnEdit, preferenceModal);
          }
        }
      });
    }
    console.log(t("policies.localGroupPolicy"));
  }
})();
