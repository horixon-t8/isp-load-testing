// Central configuration for all test scenes and their mappings
// This is the single source of truth - CLI-first approach
export const TEST_CONFIG = {
  // Available scenes
  scenes: ['homepage', 'quotation'],

  // Test files for each scene
  testFiles: {
    homepage: [
      { file: '01-login.js', name: 'login', number: '01' },
      { file: '02-auth-me.js', name: 'auth-me', number: '02' },
      { file: '03-auth-features.js', name: 'auth-features', number: '03' },
      { file: '04-master-categories.js', name: 'master-categories', number: '04' }
    ],
    quotation: [
      { file: '01-list-quotations-mywork.js', name: 'list-quotations-mywork', number: '01' },
      { file: '02-list-quotations-myteam.js', name: 'list-quotations-myteam', number: '02' },
      { file: '03-get-quotation-detail.js', name: 'get-quotation-detail', number: '03' },
      { file: '04-create-quotation.js', name: 'create-quotation', number: '04' },
      { file: '05-submit-quotation.js', name: 'submit-quotation', number: '05' }
    ]
  }
};

// Helper functions to access the configuration (CLI-safe)
export function getAvailableScenes() {
  return TEST_CONFIG.scenes;
}

export function getTestsForScene(sceneName) {
  return TEST_CONFIG.testFiles[sceneName] || [];
}
