import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testQuotationMyWorkList } from '../../apis/quotation/quotation-requests-list.js';

const myWorkErrors = new Rate('mywork_quotation_errors');
const myWorkResponseTime = new Trend('mywork_quotation_response_time');
const myWorkRequests = new Counter('mywork_quotation_requests');

export function testMyWorkQuotationScene(baseUrl, headers) {
  const startTime = new Date().getTime();

  const result = testQuotationMyWorkList(baseUrl, headers);

  const endTime = new Date().getTime();
  const totalDuration = endTime - startTime;

  // Only check API success, not arbitrary time limits since API can be slow under load
  const success = check(
    { totalDuration, result },
    {
      'my work quotation API successful': () => result.success
    }
  );

  myWorkErrors.add(!success);
  myWorkResponseTime.add(totalDuration);
  myWorkRequests.add(1);

  return {
    success: success && result.success,
    results: result,
    duration: totalDuration,
    totalDuration
  };
}
