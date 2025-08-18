import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testGetQuotationDetail } from '../../apis/quotation/quotation-detail.js';

const quotationDetailErrors = new Rate('quotation_detail_errors');
const quotationDetailResponseTime = new Trend('quotation_detail_response_time');
const quotationDetailRequests = new Counter('quotation_detail_requests');

export function testQuotationDetailScene(baseUrl, headers, quotationId) {
  const startTime = new Date().getTime();

  const result = testGetQuotationDetail(baseUrl, headers, quotationId);

  const endTime = new Date().getTime();
  const totalDuration = endTime - startTime;

  const success = check(
    { totalDuration, result },
    {
      'quotation detail API successful': () => result.success,
      'quotation detail load time < 2s': () => totalDuration < 2000,
      'quotation detail load time < 1s': () => totalDuration < 1000
    }
  );

  quotationDetailErrors.add(!success);
  quotationDetailResponseTime.add(totalDuration);
  quotationDetailRequests.add(1);

  return {
    success: success && result.success,
    results: result,
    duration: totalDuration,
    totalDuration
  };
}
