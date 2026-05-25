define([], function() {
  return {
    // Политики
    policies: {
      localGroupPolicy: '[Local Group Policy]',
      machine: 'Machine',
      machineLevelPolicies: 'Machine level policies',
      user: 'User',
      userLevelPolicies: 'User level policies',
      adminTemplates: 'Administrative Templates',
      machineAdminTemplates: 'Machine administrative templates',
      localGroupPolicies: 'Local group policies templates',
    },

    // Настройки (Preferences)
    preferences: {
      title: 'Preferences',
      description: 'Preferences policies.',
      systemSettings: 'System settings',
      systemSettingsDesc: 'Policies that set system settings.',
      shortcuts: 'Shortcuts',
      environment: 'Environment',
      folders: 'Folders',
      registry: 'Registry',
      driveMaps: 'Drive Maps',
      networkShares: 'Network Shares',
      files: 'Files',
      iniFiles: 'Ini File'
    },

    treeView: {
      loadingPolicies: 'Loading policies...',
      unableToLoadPolicies: 'Unable to load policies.'
    }
  };
});
