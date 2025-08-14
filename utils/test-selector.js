export class TestSelector {
  static getAvailableScenes() {
    // Hardcoded for now, can be made dynamic later
    return ['homepage', 'quotation'];
  }

  static getTestsForScene(sceneName) {
    const testFiles = {
      homepage: [
        { file: '01-auth-login.js', name: 'auth-login', number: '01' },
        { file: '02-auth-me.js', name: 'auth-me', number: '02' },
        { file: '03-auth-features.js', name: 'auth-features', number: '03' },
        { file: '04-master-categories.js', name: 'master-categories', number: '04' }
      ],
      quotation: [
        { file: '01-list-quotations.js', name: 'list-quotations', number: '01' },
        { file: '02-get-quotation-detail.js', name: 'get-quotation-detail', number: '02' },
        { file: '03-create-quotation.js', name: 'create-quotation', number: '03' },
        { file: '04-submit-quotation.js', name: 'submit-quotation', number: '04' }
      ]
    };

    return testFiles[sceneName] || [];
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