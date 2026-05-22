define(function() {
const ADMX_DEFAULT_STATE = 'not-configured';
const VALID_ADMX_STATES = new Set(['not-configured', 'enabled', 'disabled']);

    return {
        ADMX_DEFAULT_STATE,
        VALID_ADMX_STATES,
    };
});
