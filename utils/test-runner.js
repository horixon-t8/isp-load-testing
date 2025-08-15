import { sleep } from 'k6';

import { getTestsForScene } from './test-config.js';
import { getTestFunction } from './test-functions.js';

// Global tracking to prevent repetitive logging across k6 iterations
const globalLoggedTests = new Set();

export class TestRunner {
  constructor(config) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    this.authToken = null;
  }

  getAuthenticatedHeaders() {
    if (this.authToken) {
      return {
        ...this.headers,
        Authorization: `Bearer ${this.authToken}`
      };
    }
    return this.headers;
  }

  runScene(sceneName) {
    const testFile = __ENV.TEST_FILE;

    if (testFile) {
      return this.runSingleTest(sceneName, testFile);
    } else {
      return this.runAllTestsForScene(sceneName);
    }
  }

  runSingleTest(sceneName, testFile) {
    const testKey = `${sceneName}/${testFile}`;

    // Only log once per test, not on every k6 iteration
    if (!globalLoggedTests.has(testKey)) {
      console.log(`🧪 Running single test: ${testKey}`);
      globalLoggedTests.add(testKey);
    }

    const testFunction = this.getTestFunction(sceneName, testFile);
    if (!testFunction) {
      console.error(`❌ Test function not found for: ${testFile}`);
      return { success: false, error: 'Test function not found' };
    }

    try {
      let result;
      // Handle login test specially to get auth token
      if (testFile === '01-auth-login.js') {
        result = testFunction(this.config.baseUrl);
        if (result.success && result.accessToken && !result.skipped) {
          this.authToken = result.accessToken;
        }
      } else {
        // For other tests, use authenticated headers if we have a token
        const headers = this.getAuthenticatedHeaders();
        result = testFunction(this.config.baseUrl, headers);
      }

      // Add sleep after test execution
      if (this.config.sleepDuration > 0) {
        sleep(this.config.sleepDuration);
      }

      return result;
    } catch (error) {
      console.error(`💥 Error running test ${testFile}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  runAllTestsForScene(sceneName) {
    const tests = this.getTestsForScene(sceneName);
    const results = [];
    let overallSuccess = true;

    // Run login test first if it exists to get auth token
    const loginTest = tests.find(test => test.file === '01-auth-login.js');
    if (loginTest) {
      const loginResult = this.runSingleTest(sceneName, loginTest.file);
      results.push({
        testName: loginTest.name,
        testFile: loginTest.file,
        ...loginResult
      });

      if (!loginResult.success) {
        overallSuccess = false;
      }
    }

    // Run remaining tests with potential auth token
    for (const test of tests) {
      if (test.file === '01-auth-login.js') {
        continue;
      } // Already ran above

      const result = this.runSingleTest(sceneName, test.file);
      results.push({
        testName: test.name,
        testFile: test.file,
        ...result
      });

      if (!result.success) {
        overallSuccess = false;
      }
    }

    return {
      success: overallSuccess,
      results: results,
      totalDuration: results.reduce((sum, result) => sum + (result.duration || 0), 0)
    };
  }

  getTestsForScene(sceneName) {
    return getTestsForScene(sceneName);
  }

  getTestFunction(sceneName, testFile) {
    return getTestFunction(sceneName, testFile);
  }
}
