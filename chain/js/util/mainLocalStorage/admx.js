define(['../safe-storage'], function(__dep0) {
var { ensureInitialized, getItemSafe, setItemSafe } = __dep0;

/**
 * ADMX localStorage module.
 *
 * Creates and manages the 'admx' key in localStorage.
 * Storage is a flat object keyed by policy path:
 * {
 *   "Software\\BaseALT\\Policies\\...": {
 *     path: "Software\\BaseALT\\Policies\\...",
 *     state: "enabled" | "disabled" | "not-configured",
 *     type: "enum" | "boolean" | "decimal" | "text" | "policyValue",
 *     value: <JSON-serializable>,
 *     policyKey: string|null,
 *     policyTitle: string|null,
 *     admxTreePath: string|null,
 *     updatedAt: string
 *   }
 * }
 *
 * IMPORTANT: This module does NOT auto-initialize on import.
 * Call {@link initAdmxStorage} explicitly at app startup.
 */


const STORAGE_KEY = 'admx';
const VALID_STATES = new Set(['not-configured', 'enabled', 'disabled']);

function isPlainObject(value) {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value);
}

function validateAdmxEntry(entry, key) {
    if (!isPlainObject(entry)) {
        return false;
    }

    if (entry.path !== key) {
        return false;
    }

    if (typeof entry.type !== 'string' || entry.type.length === 0) {
        return false;
    }

    if (!VALID_STATES.has(entry.state)) {
        return false;
    }

    return Object.prototype.hasOwnProperty.call(entry, 'value');
}

function validateAdmxSchema(data) {
    if (!isPlainObject(data)) {
        return false;
    }

    return Object.entries(data).every(([key, value]) => validateAdmxEntry(value, key));
}

/**
 * Initializes ADMX storage entry in localStorage.
 * Writes seed only if the key is missing or contains invalid/corrupt JSON.
 *
 * @returns {boolean} true if seed was written
 */
function initAdmxStorage() {
    return ensureInitialized(STORAGE_KEY, {}, validateAdmxSchema);
}

/**
 * Reads ADMX storage from localStorage.
 *
 * @returns {Record<string, object>}
 */
function getAdmxFromLocalStorage() {
    return getItemSafe(STORAGE_KEY, validateAdmxSchema, {});
}

/**
 * Saves the whole ADMX storage object.
 *
 * @param {Record<string, object>} admxData
 * @returns {boolean}
 */
function saveAdmxToLocalStorage(admxData) {
    return setItemSafe(STORAGE_KEY, admxData, validateAdmxSchema);
}

/**
 * Returns saved ADMX entries for the requested policy paths.
 *
 * @param {string[]} paths
 * @returns {Record<string, object>}
 */
function getAdmxEntriesByPaths(paths = []) {
    const admx = getAdmxFromLocalStorage();

    return paths.reduce((accumulator, path) => {
        if (typeof path !== 'string' || path.length === 0) {
            return accumulator;
        }

        if (Object.prototype.hasOwnProperty.call(admx, path)) {
            accumulator[path] = admx[path];
        }

        return accumulator;
    }, {});
}

/**
 * Creates or overwrites ADMX entries by policy path.
 *
 * @param {object[]} entries
 * @returns {boolean}
 */
function upsertAdmxEntries(entries = []) {
    if (!Array.isArray(entries)) {
        return false;
    }

    const admx = getAdmxFromLocalStorage();

    entries.forEach((entry) => {
        if (!isPlainObject(entry) || typeof entry.path !== 'string' || entry.path.length === 0) {
            return;
        }

        admx[entry.path] = entry;
    });

    return saveAdmxToLocalStorage(admx);
}
    return { initAdmxStorage, getAdmxFromLocalStorage, saveAdmxToLocalStorage, getAdmxEntriesByPaths, upsertAdmxEntries };
});
