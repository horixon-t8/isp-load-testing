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

  const success = check(
    { totalDuration, result },
    {
      'my work quotation API successful': () => result.success,
      'my work quotation load time < 3s': () => totalDuration < 3000,
      'my work quotation load time < 2s': () => totalDuration < 2000
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
