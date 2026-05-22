define(['./admx-constants', './admx-form-state'], function(__dep0, __dep1) {
var { ADMX_DEFAULT_STATE } = __dep0;
var {
    getSelectedAdmxState,
    setSelectedAdmxState,
    syncControlsWithPolicyState,
    getControlElementByStoragePath,
    readControlValue,
    applyControlValue,
} = __dep1;

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

    return {
        resolveStoredState,
        restorePersistedAdmxValues,
        hasPersistedAdmxData,
        resolvePolicyValueForState,
        buildPersistedAdmxEntries,
    };
});
