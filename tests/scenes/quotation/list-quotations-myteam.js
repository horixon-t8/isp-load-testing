import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testQuotationMyTeamList } from '../../apis/quotation/quotation-requests-list.js';

const myTeamErrors = new Rate('myteam_quotation_errors');
const myTeamResponseTime = new Trend('myteam_quotation_response_time');
const myTeamRequests = new Counter('myteam_quotation_requests');

export function testMyTeamQuotationScene(baseUrl, headers) {
  const startTime = new Date().getTime();

  const result = testQuotationMyTeamList(baseUrl, headers);

  const endTime = new Date().getTime();
  const totalDuration = endTime - startTime;

  const success = check(
    { totalDuration, result },
    {
      'my team quotation API successful': () => result.success
    }
  );

  myTeamErrors.add(!success);
  myTeamResponseTime.add(totalDuration);
  myTeamRequests.add(1);

  return {
    success: success && result.success,
    results: result,
    duration: totalDuration,
    totalDuration
  };
}
