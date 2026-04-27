define(['../../util/element-creator'], function(__dep0) {
var { createElement } = __dep0;


const HELP_PLACEHOLDER = [
    'какой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, больше',
    'какой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, больше',
    'какой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, больше',
    'какой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, большекакой-то рандомный текст, не знаю о чем)  текста больше, больше',
].join('\n');

function renderChildRow(item, onItemClick) {
    const row = createElement('span', {
        className: 'workspace-list-item',
        attrs: typeof onItemClick === 'function'
            ? {
                role: 'button',
                tabindex: '0',
            }
            : {},
        children: [
            createElement('span', { className: ['icon', item.icon] }),
            createElement('span', {
                className: 'gp__list-children__item__title',
                text: item.title,
            }),
        ],
    });

    if (typeof onItemClick === 'function') {
        row.on('click', () => onItemClick(item));
        row.on('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onItemClick(item);
            }
        });
    }

    return createElement('li', {
        className: ['gp__list-children__item', item.type],
        children: [row],
    });
}

function renderHelpBlock({ help = undefined, isOpen = false } = {}) {
    if (help === '') {
        return null;
    }

    const helpText = help === undefined
        ? HELP_PLACEHOLDER
        : help;

    return createElement('div', {
        className: ['gp__list-children-help', isOpen ? 'is-open' : null],
        children: [
            createElement('div', {
                className: 'title',
                text: 'Помощь:',
            }),
            createElement('div', {
                className: 'content',
                text: helpText,
            }),
        ],
    });
}

function renderFolderTemplate({
    children = [],
    help = undefined,
    onItemClick = null,
    isHelpOpen = false,
} = {}) {
    const folderChildren = Array.isArray(children)
        ? children
        : [];
    const helpBlock = renderHelpBlock({
        help,
        isOpen: isHelpOpen,
    });

    return createElement('div', {
        className: 'gp__list-children-wrapper',
        children: [
            createElement('div', {
                className: 'gp__list-children',
                children: [
                    createElement('ul', {
                        className: 'gp__list-children__list',
                        children: folderChildren.map((child) => renderChildRow(child, onItemClick)),
                    }),
                ],
            }),
            helpBlock,
        ],
    });
}
    return { renderHelpBlock, renderFolderTemplate };
});
