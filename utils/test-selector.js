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
          const test = availableTests.find(t => parseInt(t.number) === i);
          if (test && !selectedTests.includes(test)) {
            selectedTests.push(test);
          }
        }
      } else {
        // Single test selection
        const testNum = parseInt(part);
        const test = availableTests.find(t => parseInt(t.number) === testNum);
        if (test && !selectedTests.includes(test)) {
          selectedTests.push(test);
        }
      }
    }

    return selectedTests.sort((a, b) => a.number.localeCompare(b.number));
  }

  static displayScenes(scenes) {
    console.log('\n📁 Available Scenes:');
    scenes.forEach((scene, index) => {
      console.log(`  ${index + 1}. ${scene}`);
    });
  }

  static displayTests(tests, sceneName) {
    console.log(`\n🧪 Available Tests for ${sceneName}:`);
    tests.forEach(test => {
      console.log(`  ${test.number}. ${test.name}`);
    });
    console.log('\n💡 Selection options:');
    console.log('  • Single test: "1"');
    console.log('  • Multiple tests: "1,3,5"');
    console.log('  • Range: "1-4"');
    console.log('  • All tests: "all"');
  }
}
