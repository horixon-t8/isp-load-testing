import { getAvailableScenes, getTestsForScene } from './test-config.js';

export class TestSelector {
  static getAvailableScenes() {
    return getAvailableScenes();
  }

  static getTestsForScene(sceneName) {
    return getTestsForScene(sceneName);
  }

  static parseTestSelection(selection, availableTests) {
    if (selection === 'all') {
      return availableTests;
    }

    const selectedTests = [];
    const parts = selection.split(',').map(s => s.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        // Range selection (e.g., "1-3")
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          const test = availableTests[i - 1]; // Use array index (1-based to 0-based)
          if (test && !selectedTests.includes(test)) {
            selectedTests.push(test);
          }
        }
      } else {
        // Single test selection
        const testIndex = parseInt(part) - 1; // Convert 1-based to 0-based
        const test = availableTests[testIndex];
        if (test && !selectedTests.includes(test)) {
          selectedTests.push(test);
        }
      }
    }

    return selectedTests; // Return in order of selection, not sorted
  }
}
