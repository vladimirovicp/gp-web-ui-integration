define(['../../util/element-creator', '../../util/mainLocalStorage/admx', '../../util/API'], function(__dep0, __dep1, API) {
var { createElement } = __dep0;
var { getAdmxEntriesByPaths, upsertAdmxEntries } = __dep1;


const ADMX_DEFAULT_STATE = 'not-configured';
const VALID_ADMX_STATES = new Set(['not-configured', 'enabled', 'disabled']);

function addManagedEventListener(cleanups, target, eventName, handler, options) {
    if (!target || typeof target.addEventListener !== 'function' || typeof handler !== 'function') {
        return;
    }

    target.addEventListener(eventName, handler, options);
    cleanups.push(() => target.removeEventListener(eventName, handler, options));
}

function formatExplainText(explainText = '') {
    return explainText
        .split(/\r?\n/)
        .flatMap((line, index, lines) => (index < lines.length - 1 ? [line, createElement('br')] : [line]));
}

function extractStoragePathFromData(data = '') {
    if (typeof data !== 'string') {
        return '';
    }

    const match = data.match(/Read_Path_GPT\((['"])(.*?)\1\)/);
    return match?.[2] ?? '';
}

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

function isPlainObject(value) {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value);
}

function normalizeAdmxState(state) {
    return VALID_ADMX_STATES.has(state)
        ? state
        : ADMX_DEFAULT_STATE;
}

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

function parseAdmxCurrentValue(rawValue) {
    const normalizedRawValue = unwrapCurrentValue(rawValue);

    if (isPlainObject(normalizedRawValue) && Object.prototype.hasOwnProperty.call(normalizedRawValue, 'state')) {
        return {
            hasData: true,
            state: normalizeAdmxState(normalizedRawValue.state),
            value: Object.prototype.hasOwnProperty.call(normalizedRawValue, 'value')
                ? normalizedRawValue.value
                : '',
        };
    }

    if (normalizedRawValue === null || normalizedRawValue === undefined || normalizedRawValue === '') {
        return {
            hasData: false,
            state: ADMX_DEFAULT_STATE,
            value: null,
        };
    }

    const stringValue = String(normalizedRawValue);
    const delimiterIndex = stringValue.indexOf(';');

    if (delimiterIndex === -1) {
        return {
            hasData: true,
            state: normalizeAdmxState(stringValue),
            value: '',
        };
    }

    return {
        hasData: true,
        state: normalizeAdmxState(stringValue.slice(0, delimiterIndex)),
        value: stringValue.slice(delimiterIndex + 1),
    };
}

function buildAdmxMetadataPath({ item = {}, admxTreePath = null } = {}) {
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;
    const policyKey = item?.policyKey ?? '';

    if (effectiveAdmxTreePath && policyKey) {
        return `${effectiveAdmxTreePath}/${policyKey}`;
    }

    return effectiveAdmxTreePath ?? '';
}

function buildAdmxSetValue(state, fieldValue) {
    const normalizedState = normalizeAdmxState(state);
    const normalizedValue = fieldValue === null || fieldValue === undefined
        ? ''
        : String(fieldValue);

    return `${normalizedState};${normalizedValue}`;
}

function createCommonControlAttrs({ metadata = {}, policyPath = '', storagePath = '', type = '', isDisabled = true } = {}) {
    return {
        name: metadata.id ?? metadata.valueName ?? 'admx-control',
        disabled: isDisabled ? 'disabled' : null,
        'data-policy-path': policyPath,
        'data-storage-path': storagePath || policyPath,
        'data-policy-type': type,
    };
}

function renderUnsupportedControl() {
    return createElement('div', {
        className: 'field__element',
        text: '\u0412 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u043a\u0435'
    });
}

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

function setControlsDisabledState(rootElement, shouldDisable) {
    if (!rootElement) {
        return;
    }

    const controls = rootElement.querySelectorAll('.gp__admx-options input, .gp__admx-options select, .gp__admx-options textarea');

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

    const normalizedState = typeof state === 'string' && state.length > 0
        ? state
        : ADMX_DEFAULT_STATE;

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
    setControlsDisabledState(rootElement, currentState !== 'enabled');
}

function getControlElementByStoragePath(rootElement, storagePath = '') {
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

function hasPersistedAdmxData({ persistedEntries = {}, policyValueEntry = null, controlEntries = [] } = {}) {
    const candidatePaths = [
        policyValueEntry?.storagePath ?? null,
        ...controlEntries.map(({ storagePath }) => storagePath),
    ].filter(Boolean);

    return candidatePaths.some((path) => Object.prototype.hasOwnProperty.call(persistedEntries, path));
}

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

/**
 * Renders the main workspace for an ADMX policy.
 * @returns {ElementCreator}
 */
function renderAdmxTemplate({ isHelpOpen = false, item = {}, admxTreePath = null, header = null } = {}) {
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;
    const effectiveTarget = item?.target ?? item?.policyData?.header?.class ?? item?.header?.class ?? '';
    const metadataPath = buildAdmxMetadataPath({ item, admxTreePath: effectiveAdmxTreePath });
    const headerEl = header?.getElement?.();
    const btnApply = headerEl?.querySelector('.admx__btn-apply') ?? null;
    const btnCancel = headerEl?.querySelector('.admx__btn-cancel') ?? null;
    const cleanups = [];

    const policyData = item.policyData ?? {};
    const policyHeader = policyData.header ?? {};
    const { controlEntries, policyValueEntry } = normalizePolicyEntries(policyData, policyHeader);
    const persistedEntries = getAdmxEntriesByPaths([
        policyValueEntry?.storagePath ?? null,
        ...controlEntries.map(({ storagePath }) => storagePath),
    ].filter(Boolean));
    const hasPersistedEntries = hasPersistedAdmxData({
        persistedEntries,
        policyValueEntry,
        controlEntries,
    });
    const controlRows = controlEntries.map(({ metadata, policyPath, storagePath }) => renderAdmxControlRow({
        metadata,
        policyPath,
        storagePath,
        isDisabled: true
    }));

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

    const admxTemplateElement = admxTemplate.getElement();
    const statePolicyElement = admxTemplateElement.querySelector('.gp__admx-state-policy');
    let initialFormSnapshot = null;
    let isLoading = true;
    let isSaving = false;

    const setHeaderAdmxButtonsActive = (active) => {
        const canUseButtons = !isLoading && !isSaving && initialFormSnapshot !== null;

        if (btnApply) {
            btnApply.classList.toggle('active', canUseButtons && active);
        }

        if (btnCancel) {
            btnCancel.classList.toggle('active', canUseButtons && active);
        }
    };

    const restorePersistedState = () => {
        restorePersistedAdmxValues({
            rootElement: admxTemplateElement,
            persistedEntries,
            policyValueEntry,
            controlEntries,
        });
    };

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

    setHeaderAdmxButtonsActive(false);

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

    addManagedEventListener(cleanups, statePolicyElement, 'change', handleStatePolicyChange);
    addManagedEventListener(cleanups, admxTemplateElement, 'change', handleControlsChange);
    addManagedEventListener(cleanups, admxTemplateElement, 'input', handleControlsChange);

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

    addManagedEventListener(cleanups, btnCancel, 'click', handleCancel);
    addManagedEventListener(cleanups, btnApply, 'click', handleApply);

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

            const firstValue = results[0]?.parsedValue ?? null;
            const hasAnyData = results.some(({ parsedValue }) => parsedValue?.hasData);

            if (!hasAnyData) {
                if (hasPersistedEntries) {
                    console.log('[ADMX] API returned empty values. Restoring persisted local state.');
                    restorePersistedState();
                    return;
                }

                applyDefaultValuesToAdmxForm({
                    rootElement: admxTemplateElement,
                    controlEntries,
                });
                return;
            }

            setSelectedAdmxState(admxTemplateElement, normalizeAdmxState(firstValue?.state));

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
            isLoading = false;
            initialFormSnapshot = buildAdmxFormSnapshot({
                rootElement: admxTemplateElement,
                controlEntries,
            });
            setHeaderAdmxButtonsActive(false);
        }
    };

    loadCurrentAdmxValues();

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
