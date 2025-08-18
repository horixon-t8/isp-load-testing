import { sleep } from 'k6';

import { getTestsForScene } from './test-config.js';
import { getTestFunction } from './test-functions.js';

// Global tracking to prevent repetitive logging across k6 iterations
const globalLoggedTests = new Set();
const errorLogs = [];

export class TestRunner {
  static getErrorLogs() {
    return errorLogs;
  }

  static clearErrorLogs() {
    errorLogs.length = 0;
  }
  constructor(config) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    this.authToken = null;
    this.authFailureCount = 0;
    this.maxAuthFailures = 3;
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

  handleAuthFailure() {
    console.log('🔄 Handling 401 - clearing auth token and retrying authentication...');
    this.authToken = null;
    this.ensureAuthentication();
    return this.getAuthenticatedHeaders();
  }

  ensureAuthentication() {
    // Check if we've exceeded max auth failures
    if (this.authFailureCount >= this.maxAuthFailures) {
      throw new Error(`❌ Authentication failed ${this.maxAuthFailures} times. Stopping tests.`);
    }

    // Skip if already authenticated
    if (this.authToken) {
      return;
    }

    // Try to get and run the login test function
    const loginFunction = this.getTestFunction('homepage', 'login.js');
    if (loginFunction) {
      // Only log once per test session
      const vuLogKey = `login-attempt-vu-${__VU}`;
      if (!globalLoggedTests.has(vuLogKey)) {
        console.log(`🔐 VU${__VU}: Running login to obtain authentication token...`);
        globalLoggedTests.add(vuLogKey);
      }

      try {
        const loginResult = loginFunction(this.config.baseUrl);

        if (loginResult.success && loginResult.accessToken && !loginResult.skipped) {
          this.authToken = loginResult.accessToken;
          this.authFailureCount = 0; // Reset failure count on success
          const vuSuccessKey = `login-success-vu-${__VU}`;
          if (!globalLoggedTests.has(vuSuccessKey)) {
            console.log(`✅ VU${__VU}: Authentication successful`);
            globalLoggedTests.add(vuSuccessKey);
          }
        } else if (loginResult.skipped) {
          if (!globalLoggedTests.has('login-skipped')) {
            console.log('⚠️  Login skipped - using unauthenticated requests');
            globalLoggedTests.add('login-skipped');
          }
        } else {
          this.authFailureCount++;
          if (!globalLoggedTests.has('login-failed')) {
            console.log(
              `❌ Login failed (${this.authFailureCount}/${this.maxAuthFailures}) - continuing with unauthenticated requests`
            );
            globalLoggedTests.add('login-failed');
          }
        }
      } catch (error) {
        this.authFailureCount++;
        if (!globalLoggedTests.has('login-error')) {
          console.error(
            `💥 Login error (${this.authFailureCount}/${this.maxAuthFailures}): ${error.message}`
          );
          globalLoggedTests.add('login-error');
        }
        // Login attempt failed or errored - continue without auth
      }
    }
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
      if (testFile === 'login.js') {
        result = testFunction(this.config.baseUrl);

        if (result.success && result.accessToken && !result.skipped) {
          this.authToken = result.accessToken;
        }
      } else {
        // For other tests, ensure authentication first, then use authenticated headers
        this.ensureAuthentication();
        let headers = this.getAuthenticatedHeaders();
        result = testFunction(this.config.baseUrl, headers);

        // Check for 401 and retry with re-authentication
        if (result.response && result.response.status === 401 && this.authToken) {
          console.log(`🔄 Received 401 for ${testFile}, attempting re-authentication...`);
          headers = this.handleAuthFailure();
          if (this.authToken) {
            result = testFunction(this.config.baseUrl, headers);
          }
        }

        // Log detailed information if test failed, but distinguish between check failures and real errors
        if (!result.success) {
          const errorDetails = {
            timestamp: new Date().toISOString(),
            testFile: testFile,
            scene: sceneName,
            error: result.error || 'Check assertions failed',
            response: result.response
              ? {
                  status: result.response.status,
                  statusText: result.response.statusText || result.response.status_text,
                  body: result.response.body ? result.response.body.substring(0, 1000) : null,
                  headers: result.response.headers
                }
              : null,
            testResult: result,
            vu: __VU,
            iteration: __ITER || 0,
            type: result.error ? 'error' : 'check_failure'
          };

          errorLogs.push(errorDetails);

          // Only log to console if there's an actual error, not just check failures
          if (result.error) {
            console.error(`❌ Test Error [${sceneName}/${testFile}]: ${result.error}`);
            if (result.response && result.response.status) {
              console.error(
                `   HTTP ${result.response.status}: ${result.response.statusText || result.response.status_text}`
              );
            }
          } else {
            // For check failures, provide a less alarming info message once per test
            const checkFailureKey = `${sceneName}/${testFile}-check-failure`;
            if (!globalLoggedTests.has(checkFailureKey)) {
              console.log(
                `ℹ️  [${sceneName}/${testFile}] Some checks failed (likely performance or validation checks)`
              );
              globalLoggedTests.add(checkFailureKey);
            }
          }
        }
      }

      // Add sleep after test execution
      if (this.config.sleepDuration > 0) {
        sleep(this.config.sleepDuration);
      }

      return result;
    } catch (error) {
      const errorDetails = {
        timestamp: new Date().toISOString(),
        testFile: testFile,
        scene: sceneName,
        error: error.message,
        stack: error.stack,
        vu: __VU,
        iteration: __ITER
      };

      errorLogs.push(errorDetails);
      console.error(`💥 Test Exception [${sceneName}/${testFile}]: ${error.message}`);

      // Also push to global for handleSummary
      if (global.testErrorLogs) {
        global.testErrorLogs.push(errorDetails);
      }

      return {
        success: false,
        error: error.message,
        errorDetails: errorDetails
      };
    }
  }

  runAllTestsForScene(sceneName) {
    const tests = this.getTestsForScene(sceneName);
    const results = [];
    let overallSuccess = true;

    // Run login test first if it exists to get auth token
    const loginTest = tests.find(test => test.file === 'login.js');
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

      // Login completed for this scenario
    }

    // Run remaining tests with potential auth token
    for (const test of tests) {
      if (test.file === 'login.js') {
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

    // Print logs summary if any issues occurred
    if (errorLogs.length > 0) {
      const realErrors = errorLogs.filter(log => log.type === 'error');
      const checkFailures = errorLogs.filter(log => log.type === 'check_failure');

      if (realErrors.length > 0) {
        console.error(`\n🔴 ${realErrors.length} actual error(s) occurred during test execution`);
      }
      if (checkFailures.length > 0) {
        console.log(
          `\n⚠️  ${checkFailures.length} check assertion(s) failed (not necessarily errors)`
        );
      }
      console.log('   Check the generated log files for detailed information');
    }

    return {
      success: overallSuccess,
      results: results,
      totalDuration: results.reduce((sum, result) => sum + (result.duration || 0), 0),
      errorLogs: errorLogs
    };
  }

  getTestsForScene(sceneName) {
    return getTestsForScene(sceneName);
  }

  getTestFunction(sceneName, testFile) {
    return getTestFunction(sceneName, testFile);
  }
}
