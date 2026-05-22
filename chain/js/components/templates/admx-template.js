/**
 * admx-template.js — модуль рендеринга и управления ADMX-шаблоном групповой политики.
 *
 * Публичный API:
 *   - renderAdmxTemplate({ isHelpOpen, item, admxTreePath, header }) — главная точка входа.
 */
define([
    '../../util/element-creator',
    '../../util/mainLocalStorage/admx',
    './admx/admx-policy-normalizers',
    './admx/admx-controls-renderer',
    './admx/admx-storage-state',
    './admx/admx-template-controller',
], function(__dep0, __dep1, __dep2, __dep3, __dep4, __dep5) {
var { createElement } = __dep0;
var { getAdmxEntriesByPaths } = __dep1;
var { normalizePolicyEntries } = __dep2;
var { formatExplainText, renderAdmxControlRow } = __dep3;
var { hasPersistedAdmxData } = __dep4;
var { setupAdmxTemplateController } = __dep5;

function renderAdmxTemplate({ isHelpOpen = false, item = {}, admxTreePath = null, header = null } = {}) {
    const effectiveAdmxTreePath = admxTreePath ?? item?.admxTreePath ?? null;
    const effectiveTarget = item?.target ?? item?.policyData?.header?.class ?? item?.header?.class ?? '';

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
                                    'Политика: ',
                                    createElement('span', {
                                        className: 'title__name',
                                        text: policyHeader.displayName ?? ''
                                    })
                                ]
                            }),
                            createElement('div', {
                                className: 'gp__admx-state-policy-title',
                                text: 'Состояние политики:'
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
                                                text: 'Не сконфигурировано'
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
                                                text: 'Включено'
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
                                                text: 'Отключено'
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
                                        text: 'Описание'
                                    }),
                                    createElement('div', {
                                        className: 'gp__admx-options',
                                        text: 'Опции'
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
                                text: 'Поддерживается на:'
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
                                text: 'Комментарий:'
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
                                text: 'Помощь:'
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

    setupAdmxTemplateController({
        admxTemplate,
        admxTemplateElement,
        statePolicyElement,
        header,
        item,
        effectiveTarget,
        effectiveAdmxTreePath,
        controlEntries,
        policyValueEntry,
        persistedEntries,
        hasPersistedEntries,
    });

    return admxTemplate;
}

    return { renderAdmxTemplate };
});
