define([
    '../../../util/API',
    '../../../util/mainLocalStorage/admx',
    './admx-constants',
    './admx-policy-normalizers',
    './admx-value-parser',
    './admx-form-state',
    './admx-storage-state'
], function(__dep0, __dep1, __dep2, __dep3, __dep4, __dep5, __dep6) {
var API = __dep0;
var { upsertAdmxEntries, removeAdmxEntriesByPaths } = __dep1;
var { ADMX_DEFAULT_STATE } = __dep2;
var { normalizeAdmxState, getDefaultControlValue } = __dep3;
var { parseAdmxCurrentValue, buildAdmxSetValue } = __dep4;
var {
    syncControlsWithPolicyState,
    getControlElementByStoragePath,
    readControlValue,
    applyControlValue,
    buildAdmxFormSnapshot,
    applyAdmxFormSnapshot,
    applyDefaultValuesToAdmxForm,
    setSelectedAdmxState,
    getSelectedAdmxState,
} = __dep5;
var {
    restorePersistedAdmxValues,
    buildPersistedAdmxEntries,
} = __dep6;

function addManagedEventListener(cleanups, target, eventName, handler, options) {
    if (!target || typeof target.addEventListener !== 'function' || typeof handler !== 'function') {
        return;
    }

    target.addEventListener(eventName, handler, options);
    cleanups.push(() => target.removeEventListener(eventName, handler, options));
}

function setupAdmxTemplateController({
    admxTemplate,
    admxTemplateElement,
    statePolicyElement,
    header = null,
    item = {},
    effectiveTarget = '',
    effectiveAdmxTreePath = null,
    controlEntries = [],
    policyValueEntry = null,
    persistedEntries = {},
    hasPersistedEntries = false,
} = {}) {
    const headerEl = header?.getElement?.();
    const btnApply = headerEl?.querySelector('.admx__btn-apply') ?? null;
    const btnCancel = headerEl?.querySelector('.admx__btn-cancel') ?? null;
    const cleanups = [];
    const policyStoragePaths = [
        policyValueEntry?.storagePath ?? null,
        ...controlEntries.map(({ storagePath }) => storagePath),
    ].filter(Boolean);

    let initialFormSnapshot = null;
    let isLoading = true;
    let isSaving = false;
    let currentPersistedEntries = persistedEntries;
    let hasLocalPersistedEntries = hasPersistedEntries;

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
            persistedEntries: currentPersistedEntries,
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
            const selectedState = getSelectedAdmxState(admxTemplateElement);

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

                if (selectedState === ADMX_DEFAULT_STATE) {
                    console.log('[ADMX] API.deletePolicy payload:', {
                        nameGpt: currentNameGpt,
                        target: effectiveTarget,
                        path: controlPath,
                    });

                    const deleteResult = await API.deletePolicy(currentNameGpt, effectiveTarget, controlPath);
                    console.log('[ADMX] API.deletePolicy response:', deleteResult);
                    return;
                }

                const controlElement = getControlElementByStoragePath(admxTemplateElement, controlEntry.storagePath);
                const controlValue = readControlValue(controlElement, controlEntry.metadata);
                const setValue = buildAdmxSetValue(selectedState, controlValue);

                console.log('[ADMX] API.set payload:', {
                    nameGpt: currentNameGpt,
                    target: effectiveTarget,
                    path: controlPath,
                    value: setValue,
                    controlValue: controlValue,
                    controlElement: controlElement,
                });

                const setResult = await API.set(currentNameGpt, effectiveTarget, controlPath, setValue);
                console.log('[ADMX] API.set response:', setResult);
            }));

            if (selectedState === ADMX_DEFAULT_STATE) {
                const didRemovePersistedEntries = removeAdmxEntriesByPaths(policyStoragePaths);

                if (!didRemovePersistedEntries) {
                    throw new Error('Failed to remove persisted ADMX entries.');
                }

                currentPersistedEntries = {};
                hasLocalPersistedEntries = false;

                applyDefaultValuesToAdmxForm({
                    rootElement: admxTemplateElement,
                    controlEntries,
                });

                initialFormSnapshot = buildAdmxFormSnapshot({
                    rootElement: admxTemplateElement,
                    controlEntries,
                });
                return;
            }

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
                if (hasLocalPersistedEntries) {
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

    addManagedEventListener(cleanups, statePolicyElement, 'change', handleStatePolicyChange);
    addManagedEventListener(cleanups, admxTemplateElement, 'change', handleControlsChange);
    addManagedEventListener(cleanups, admxTemplateElement, 'input', handleControlsChange);
    addManagedEventListener(cleanups, btnCancel, 'click', handleCancel);
    addManagedEventListener(cleanups, btnApply, 'click', handleApply);

    loadCurrentAdmxValues();

    let cleanedUp = false;
    admxTemplate.cleanup = () => {
        if (cleanedUp) {
            return;
        }

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

    return { setupAdmxTemplateController };
});
