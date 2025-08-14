import { runHomepageFlow } from '../scenes/homepage/homepage-flow.js';
import {
  runQuotationListFlow,
  runQuotationDetailFlow,
  runQuotationCreateFlow,
  runQuotationCompleteFlow
} from '../scenes/quotation/quotation-flow.js';
import { testAuthMe } from '../scenes/homepage/auth-me.js';
import { testAuthFeatures } from '../scenes/homepage/auth-features.js';
import { testMasterCategories } from '../scenes/homepage/master-categories.js';
import { testListQuotations } from '../scenes/quotation/01-list-quotations.js';
import { testCreateQuotation } from '../scenes/quotation/03-create-quotation.js';

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
    }

    const quotationFlow = __ENV.QUOTATION_FLOW?.toLowerCase();

    switch (quotationFlow) {
      case 'list':
        return runQuotationListFlow(this.config.baseUrl, this.headers);
      case 'detail':
        return runQuotationDetailFlow(this.config.baseUrl, this.headers);
      case 'create':
        return runQuotationCreateFlow(this.config.baseUrl, this.headers);
      case 'complete':
        return runQuotationCompleteFlow(this.config.baseUrl, this.headers);
      default:
        console.warn(`Unknown quotation flow: ${quotationFlow}, running complete flow`);
        return runQuotationCompleteFlow(this.config.baseUrl, this.headers);
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
}
