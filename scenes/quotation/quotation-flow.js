import { group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

import { testListQuotations } from './list-quotations.js';
import { testCreateQuotation } from './create-quotation.js';

const quotationFlowErrors = new Rate('quotation_flow_errors');

export function runQuotationFlow(baseUrl, headers) {
  let flowSuccess = true;
  const results = [];

  group('Quotation Flow - Complete Workflow', function () {
    const listResult = testListQuotations(baseUrl, headers);
    results.push(listResult);
    if (!listResult.success) {
      flowSuccess = false;
    }

    sleep(1);

    if (Math.random() < 0.3) {
      const createResult = testCreateQuotation(baseUrl, headers);
      results.push(createResult);
      if (!createResult.success) {
        flowSuccess = false;
      }

      sleep(2);

      const listAfterCreateResult = testListQuotations(baseUrl, headers);
      results.push(listAfterCreateResult);
      if (!listAfterCreateResult.success) {
        flowSuccess = false;
      }
    }

    sleep(Math.random() * 3 + 1);
  });

  quotationFlowErrors.add(!flowSuccess);

  return {
    success: flowSuccess,
    results: results,
    totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
  };
}
