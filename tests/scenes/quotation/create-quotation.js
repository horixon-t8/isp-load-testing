import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testCreateQuotation } from '../../apis/quotation/quotation-save.js';

const createQuotationErrors = new Rate('create_quotation_errors');
const createQuotationResponseTime = new Trend('create_quotation_response_time');
const createQuotationRequests = new Counter('create_quotation_requests');

export function testCreateQuotationScene(baseUrl, headers) {
  const startTime = new Date().getTime();

  const result = testCreateQuotation(baseUrl, headers);

  const endTime = new Date().getTime();
  const totalDuration = endTime - startTime;

  const success = check(
    { totalDuration, result },
    {
      'create quotation API successful': () => result.success,
      'create quotation load time < 3s': () => totalDuration < 3000,
      'create quotation load time < 2s': () => totalDuration < 2000
    }
  );

  createQuotationErrors.add(!success);
  createQuotationResponseTime.add(totalDuration);
  createQuotationRequests.add(1);

  return {
    success: success && result.success,
    results: result,
    duration: totalDuration,
    totalDuration
  };
}
