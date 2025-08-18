import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import http from 'k6/http';

import { testGetQuotationDetail } from '../../apis/quotation/quotation-detail.js';

const quotationDetailErrors = new Rate('quotation_detail_errors');
const quotationDetailResponseTime = new Trend('quotation_detail_response_time');
const quotationDetailRequests = new Counter('quotation_detail_requests');

let cachedQuotationId = null;

// Utility function to fetch quotation ID without tracking metrics
function fetchQuotationIdForTesting(baseUrl, headers) {
  const payload = {
    type: 'MyWork',
    status: ['Draft', 'QuotationIssued'],
    createDate: {},
    updateDate: {},
    page: 1,
    pageSize: 20,
    sort: {}
  };

  const requestHeaders = {
    ...headers,
    'Content-Type': 'application/json'
  };

  const response = http.post(`${baseUrl}/quotation/requests/list`, JSON.stringify(payload), {
    headers: requestHeaders
  });

  if (response.status === 200) {
    try {
      const data = JSON.parse(response.body);
      if (data.data && data.data.data && data.data.data.length > 0) {
        return data.data.data[0].id;
      }
    } catch (e) {
      // Silent fail, no metrics tracking
    }
  }

  return null;
}

export function testQuotationDetailScene(baseUrl, headers) {
  const startTime = new Date().getTime();

  if (!cachedQuotationId) {
    cachedQuotationId = fetchQuotationIdForTesting(baseUrl, headers);

    if (!cachedQuotationId) {
      const errorDuration = new Date().getTime() - startTime;
      quotationDetailErrors.add(1);
      quotationDetailResponseTime.add(errorDuration);
      quotationDetailRequests.add(1);

      return {
        success: false,
        results: { success: false, error: 'Failed to get quotation ID from mywork list' },
        duration: errorDuration,
        totalDuration: errorDuration
      };
    }
  }

  console.log(`Using cached quotation ID: ${cachedQuotationId}`);

  const result = testGetQuotationDetail(baseUrl, headers, cachedQuotationId);

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
