define(['../../util/element-creator'], function(__dep0) {
var { createElement } = __dep0;


function renderHeader(container) {
    const element = createElement('div', {
        className: 'gp__header',
        children: [
            createElement('div', {
                className: 'gp__search'
            }),
            createElement('div', {
                className: 'gp__nav'
            }),
            createElement('div', {
                className: 'gp__control',
                children: [
                    createElement('button', {
                        className: ['button', 'preferences__btn-create'],
                        text: 'Создать'
                    }),
                    createElement('button', {
                        className: ['button', 'preferences__btn-edit'],
                        text: 'Изменить'
                    }),
                    createElement('button', {
                        className: ['button','preferences__btn-delete'],
                        text: 'Удалить'
                    })
                ]
            }),
            createElement('div', {
                className: 'gp__control-admx',
                children: [
                    createElement('button', {
                        className: ['button', 'admx__btn-apply'],
                        text: 'Применить'
                    }),
                    createElement('button', {
                        className: ['button', 'admx__btn-cancel'],
                        text: 'Отмена'
                    })
                ]
            }),
            createElement('div', {
                className: 'gp__control-help',
                children: [
                    createElement('button', {
                        className: ['button', 'btn-information'],
                        text: 'Сведения'
                    })
                ]
            })
        ]
    });
    container.appendChild(element.getElement());
    return element; // Возвращаем экземпляр ElementCreator для возможности использования его методов
}
    return { renderHeader };
});
