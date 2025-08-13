import { runHomepageFlow } from '../scenes/homepage/homepage-flow.js';
import { runQuotationFlow } from '../scenes/quotation/quotation-flow.js';
import { runUserFlow } from '../scenes/user-management/user-flow.js';
import { testAuthMe } from '../scenes/homepage/auth-me.js';
import { testAuthFeatures } from '../scenes/homepage/auth-features.js';
import { testMasterCategories } from '../scenes/homepage/master-categories.js';
import { testListQuotations } from '../scenes/quotation/list-quotations.js';
import { testCreateQuotation } from '../scenes/quotation/create-quotation.js';
import { testLogin } from '../scenes/user-management/login.js';
import { testProfile } from '../scenes/user-management/profile.js';

export class TestRunner {
  constructor(config) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.authToken}`
    };
  }

  runScene(sceneName) {
    const scene = sceneName.toLowerCase();

    switch (scene) {
      case 'homepage':
        return this.runHomepageTests();
      case 'quotation':
        return this.runQuotationTests();
      case 'user-management':
      case 'user':
        return this.runUserTests();
      default:
        console.warn(`Unknown scene: ${sceneName}, running homepage`);
        return this.runHomepageTests();
    }
  }

  runHomepageTests() {
    if (__ENV.RUN_ALL === 'true') {
      return this.runAllHomepageTests();
    } else {
      return runHomepageFlow(this.config.baseUrl, this.headers);
    }
  }

  runAllHomepageTests() {
    const results = [];

    results.push(testAuthMe(this.config.baseUrl, this.headers));
    results.push(testAuthFeatures(this.config.baseUrl, this.headers));
    results.push(testMasterCategories(this.config.baseUrl, this.headers));

    const overallSuccess = results.every(result => result.success);

    return {
      success: overallSuccess,
      results: results,
      totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
    };
  }

  runQuotationTests() {
    if (__ENV.RUN_ALL === 'true') {
      return this.runAllQuotationTests();
    } else {
      return runQuotationFlow(this.config.baseUrl, this.headers);
    }
  }

  runAllQuotationTests() {
    const results = [];

    results.push(testListQuotations(this.config.baseUrl, this.headers));
    results.push(testCreateQuotation(this.config.baseUrl, this.headers));

    const overallSuccess = results.every(result => result.success);

    return {
      success: overallSuccess,
      results: results,
      totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
    };
  }

  runUserTests() {
    if (__ENV.RUN_ALL === 'true') {
      return this.runAllUserTests();
    } else {
      return runUserFlow(this.config.baseUrl);
    }
  }

  runAllUserTests() {
    const results = [];

    const loginResult = testLogin(this.config.baseUrl);
    results.push(loginResult);

    if (loginResult.token && loginResult.success) {
      const authHeaders = {
        ...this.headers,
        Authorization: `Bearer ${loginResult.token}`
      };
      results.push(testProfile(this.config.baseUrl, authHeaders));
    }

    const overallSuccess = results.every(result => result.success);

    return {
      success: overallSuccess,
      results: results,
      totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
    };
  }
}
