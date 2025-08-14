import { testAuthLogin } from '../scenes/homepage/01-auth-login.js';
import { testAuthMe } from '../scenes/homepage/02-auth-me.js';
import { testAuthFeatures } from '../scenes/homepage/03-auth-features.js';
import { testMasterCategories } from '../scenes/homepage/04-master-categories.js';
import { testListQuotations } from '../scenes/quotation/01-list-quotations.js';
import { testGetQuotationDetail } from '../scenes/quotation/02-get-quotation-detail.js';
import { testCreateQuotation } from '../scenes/quotation/03-create-quotation.js';
import { testSubmitQuotationRequest } from '../scenes/quotation/04-submit-quotation.js';

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
      // Handle login test specially to get auth token
      if (testFile === '01-auth-login.js') {
        const result = testFunction(this.config.baseUrl);
        if (result.success && result.accessToken && !result.skipped) {
          this.authToken = result.accessToken;
        }
        return result;
      } else {
        // For other tests, use authenticated headers if we have a token
        const headers = this.getAuthenticatedHeaders();
        return testFunction(this.config.baseUrl, headers);
      }
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
    const testFiles = {
      homepage: [
        { file: '01-auth-login.js', name: 'auth-login' },
        { file: '02-auth-me.js', name: 'auth-me' },
        { file: '03-auth-features.js', name: 'auth-features' },
        { file: '04-master-categories.js', name: 'master-categories' }
      ],
      quotation: [
        { file: '01-list-quotations.js', name: 'list-quotations' },
        { file: '02-get-quotation-detail.js', name: 'get-quotation-detail' },
        { file: '03-create-quotation.js', name: 'create-quotation' },
        { file: '04-submit-quotation.js', name: 'submit-quotation' }
      ]
    };

    return testFiles[sceneName] || [];
  }

  getTestFunction(sceneName, testFile) {
    const testMap = {
      'homepage/01-auth-login.js': testAuthLogin,
      'homepage/02-auth-me.js': testAuthMe,
      'homepage/03-auth-features.js': testAuthFeatures,
      'homepage/04-master-categories.js': testMasterCategories,
      'quotation/01-list-quotations.js': testListQuotations,
      'quotation/02-get-quotation-detail.js': testGetQuotationDetail,
      'quotation/03-create-quotation.js': testCreateQuotation,
      'quotation/04-submit-quotation.js': testSubmitQuotationRequest
    };

    return testMap[`${sceneName}/${testFile}`];
  }
}
