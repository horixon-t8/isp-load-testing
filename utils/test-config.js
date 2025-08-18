// Central configuration for all test scenes and their mappings
// This is the single source of truth - CLI-first approach
export const TEST_CONFIG = {
  // Available scenes
  scenes: ['homepage', 'quotation'],

  // Test files for each scene
  testFiles: {
    homepage: [
      { file: 'login.js', name: 'login' },
      { file: 'homepage.js', name: 'homepage' }
    ],
    quotation: [
      { file: '01-list-quotations-mywork.js', name: 'list-quotations-mywork' },
      { file: '02-list-quotations-myteam.js', name: 'list-quotations-myteam' },
      { file: '03-get-quotation-detail.js', name: 'get-quotation-detail' },
      { file: '04-create-quotation.js', name: 'create-quotation' },
      { file: '05-submit-quotation.js', name: 'submit-quotation' }
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
