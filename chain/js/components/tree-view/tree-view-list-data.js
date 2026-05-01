define(['../../locales/translations', './tree-view-preferences', './policy-converter', './policy-en'], function(__dep0, __dep1, __dep2, __dep3) {
var { t } = __dep0;
var { treepreferences } = __dep1;
var { convertPolicySection } = __dep2;
var policyTreeData = __dep3;


function buildTreeViewList(policyData = {}) {
    const machineCategories = convertPolicySection(policyData.Machine, 'Machine');
    const userCategories = convertPolicySection(policyData.User, 'User');

    return [
        {
            title: t('policies.localGroupPolicy'),
            type: 'folder',
            opened: true,
            icon: null,
            help: 'Local group policies templates',
          
            children: [
                {
                    title: t('policies.machine'),
                    type: 'folder',
                    opened: true,
                    icon: 'ico-computer',
                    help: 'Machine level policies',
                    children: [
                        {
                            title: t('policies.adminTemplates'),
                            type: 'folder',
                            opened: true,
                            icon: 'ico-folder',
                            children: machineCategories,
                            help: 'Machine administrative templates',
                        },
                        {
                            title: t('preferences.title'),
                            type: 'folder',
                            opened: false,
                            icon: 'ico-folder',
                            help: 'Preferences policies.',
                            children: [
                                {
                                    title: t('preferences.systemSettings'), //'Настройки системы',
                                    type: 'folder',
                                    opened: false,
                                    icon: 'ico-folder',
                                    children: treepreferences,
                                    help: 'Policies that set system settings.',
                                }
                            ]
                        },
                        {
                            title: 'Настройки системы',
                            type: 'folder',
                            opened: false,
                            icon: 'ico-folder',
                            children: [
                                {
                                    title: 'Скрипты',
                                    type: 'file',
                                    opened: false,
                                    icon: 'ico-file',
                                    template: 'scripts',
                                    header: {
                                        class: 'Machine'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    title: t('policies.user'),
                    type: 'folder',
                    opened: false,
                    icon: 'ico-user',
                    help: 'User level policies',
                    children: [
                        {
                            title: t('policies.adminTemplates'),
                            type: 'folder',
                            opened: false,
                            icon: 'ico-folder',
                            children: userCategories
                        },
                        {
                            title: 'Настройки',
                            type: 'folder',
                            opened: false,
                            icon: 'ico-folder'
                        },
                        {
                            title: 'Настройки системы',
                            type: 'folder',
                            opened: false,
                            icon: 'ico-folder'
                        }
                    ]
                }
            ]
        }
    ];
}

async function loadTreeViewList() {
    const policyModule = policyTreeData;
    const policyData = policyModule?.default ?? policyModule;

    return buildTreeViewList(policyData);
}
    return { loadTreeViewList };
});