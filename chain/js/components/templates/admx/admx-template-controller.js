define([
    '../../../util/API',
    './admx-constants',
    './admx-policy-normalizers',
    './admx-value-parser',
    './admx-form-state'
], function(__dep0, __dep1, __dep2, __dep3, __dep4) {
var API = __dep0;
var { ADMX_DEFAULT_STATE } = __dep1;
var { normalizeAdmxState, getDefaultControlValue } = __dep2;
var { parseAdmxCurrentValue, buildAdmxSetValue } = __dep3;
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
} = __dep4;

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
    effectiveTarget = '',
    controlEntries = [],
} = {}) {
    const headerEl = header?.getElement?.();
    const btnApply = headerEl?.querySelector('.admx__btn-apply') ?? null;
    const btnCancel = headerEl?.querySelector('.admx__btn-cancel') ?? null;
    const cleanups = [];

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

            if (selectedState === 'disabled') {
                setSelectedAdmxState(admxTemplateElement, selectedState);

                controlEntries.forEach(({ storagePath, metadata }) => {
                    const controlElement = getControlElementByStoragePath(admxTemplateElement, storagePath);
                    applyControlValue(controlElement, metadata, getDefaultControlValue(metadata));
                });

                syncControlsWithPolicyState(admxTemplateElement);
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

            const hasAnyData = results.some(({ parsedValue }) => parsedValue?.hasData);

            if (!hasAnyData) {
                applyDefaultValuesToAdmxForm({
                    rootElement: admxTemplateElement,
                    controlEntries,
                });
                return;
            }

            const firstValueWithData = results.find(({ parsedValue }) => parsedValue?.hasData)?.parsedValue ?? null;
            setSelectedAdmxState(admxTemplateElement, normalizeAdmxState(firstValueWithData?.state));
            const loadedState = getSelectedAdmxState(admxTemplateElement);

            results.forEach(({ controlEntry, parsedValue }) => {
                const controlElement = getControlElementByStoragePath(admxTemplateElement, controlEntry.storagePath);
                const nextValue = loadedState === 'disabled'
                    ? getDefaultControlValue(controlEntry.metadata)
                    : (
                        parsedValue?.hasData
                            ? parsedValue.value
                            : getDefaultControlValue(controlEntry.metadata)
                    );

                applyControlValue(controlElement, controlEntry.metadata, nextValue);
            });

            syncControlsWithPolicyState(admxTemplateElement);
        } catch (error) {
            console.error('[ADMX] Failed to load current values.', error);
            applyDefaultValuesToAdmxForm({
                rootElement: admxTemplateElement,
                controlEntries,
            });
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
