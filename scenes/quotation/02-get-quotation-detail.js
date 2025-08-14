import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const quotationDetailErrors = new Rate('quotation_detail_errors');
const quotationDetailResponseTime = new Trend('quotation_detail_response_time');
const quotationDetailRequests = new Counter('quotation_detail_requests');

export function testGetQuotationDetail(baseUrl, headers, quotationId) {
  if (!quotationId) {
    quotationDetailErrors.add(1);
    quotationDetailRequests.add(1);
    return { success: false, response: null, duration: 0 };
  }

  const response = http.get(`${baseUrl}/quotation/detail/${quotationId}`, { headers });

  const success = check(response, {
    'quotation detail status is 200': r => r.status === 200,
    'quotation detail response time < 3s': r => r.timings.duration < 3000,
    'quotation detail has body': r => r.body && r.body.length > 0,
    'quotation detail valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object' && !data.error;
      } catch (e) {
        return false;
      }
    },
    'quotation detail has quotation data': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && data.data.id === quotationId;
      } catch (e) {
        return false;
      }
    }
  });

  quotationDetailErrors.add(!success);
  quotationDetailResponseTime.add(response.timings.duration);
  quotationDetailRequests.add(1);

  return { success, response, duration: response.timings.duration };
}