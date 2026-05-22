define(['../../util/element-creator', '../../util/API'], function(__dep0, API) {
var { createElement } = __dep0;


// const NAME_GPT = '\\example.test\SysVol\example.test\Policies\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}';
const NAME_GPT = String.raw`\\example.test\SysVol\example.test\Policies\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}`;
const TARGET = 'Machine';
// const PATH = 'Software\\BaseALT\\Policies\\Laps\\PostAuthenticationResetDelay';
const PATH = String.raw`Software\\BaseALT\\Policies\\Laps\\PostAuthenticationResetDelay`;
const VALUE = 'test-10';
function handleGetCurrentValue() {
    API.get_current_value(NAME_GPT, TARGET, PATH)
        .then(function(result) {
            console.log(result);
        })
        .catch(function(error) {
            console.error(error);
        });
}

function handleSet() {
    API.set(NAME_GPT, TARGET, PATH, VALUE)
        .then(function(result) {
            console.log(result);
        })
        .catch(function(error) {
            console.error(error);
        });
}

function handleDeletePolicy() {
    API.deletePolicy(NAME_GPT, TARGET, PATH)
        .then(function(result) {
            console.log(result);
        })
        .catch(function(error) {
            console.error(error);
        });
}

function renderFooter(container) {
    const element = createElement('div', {
        className: 'gp__footer',
        children: [
            createElement('button', {
                className: ['button', 'active','gp__footer-btn-get-current-value'],
                text: 'get_current_value',
                events: {
                    click: handleGetCurrentValue,
                },
            }),
            createElement('button', {
                className: ['button', 'active', 'gp__footer-btn-set'],
                text: 'set',
                events: {
                    click: handleSet,
                },
            }),
            createElement('button', {
                className: ['button', 'active', 'gp__footer-btn-delete-policy'],
                text: 'deletePolicy',
                events: {
                    click: handleDeletePolicy,
                },
            }),
        ],
    });
    container.appendChild(element.getElement());
    return element.getElement();
}
    return { renderFooter };
});
