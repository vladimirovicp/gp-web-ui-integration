define(['../../util/element-creator', '../../util/API'], function(__dep0, API) {
var { createElement } = __dep0;

// const NAME_GPT = '\\\\example.test\\SysVol\\example.test\\Policies\\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}';
// const TARGET = 'Machine';
// const PATH = 'Software\\BaseALT\\Policies\\Laps\\PostAuthenticationResetDelay';
// const VALUE = 'enabled;18';
// const METADATA = 'Machine/categories/Система ALT/inherited/LAPS/policies/ALT_LAPS:LAPS_PostAuthenticationActions';


// const NAME_GPT = '\\\\example.test\\SysVol\\example.test\\Policies\\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}';
// const TARGET = 'Machine';
// const PATH = 'Software\\\\BaseALT\\\\Policies\\\\Laps\\\\AdministratorAccountName';
// const VALUE = 'enabled;18';
// const METADATA = 'Machine/categories/ALT System/inherited/LAPS/policies/ALT_LAPS:Administrator Account Name';

const NAME_GPT = '\\\\example.test\\SysVol\\example.test\\Policies\\{16D7EE44-417B-4A76-BE92-B0C5C1030A82}';
const TARGET = 'Machine';
const PATH = 'Software\\\\BaseALT\\\\Policies\\\\Laps\\\\PostAuthenticationResetDelay';
const VALUE = 'enabled;111';
const METADATA = 'Machine/categories/Система ALT/inherited/LAPS/policies/ALT_LAPS:LAPS_PostAuthenticationActions';


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
    API.set(NAME_GPT, TARGET, PATH, VALUE, METADATA)
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
                className: ['button', 'gp__footer-btn-get-current-value'],
                text: 'get_current_value',
                events: {
                    click: handleGetCurrentValue,
                },
            }),
            createElement('button', {
                className: ['button', 'gp__footer-btn-set'],
                text: 'set',
                events: {
                    click: handleSet,
                },
            }),
        ],
    });
    container.appendChild(element.getElement());
    return element.getElement();
}
    return { renderFooter };
});
