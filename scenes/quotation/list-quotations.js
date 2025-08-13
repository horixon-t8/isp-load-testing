import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const listQuotationsErrors = new Rate('list_quotations_errors');
const listQuotationsResponseTime = new Trend('list_quotations_response_time');
const listQuotationsRequests = new Counter('list_quotations_requests');

export function testListQuotations(baseUrl, headers) {
  const response = http.get(`${baseUrl}/quotations/my-list`, { headers });

  const success = check(response, {
    'quotations/my-list status is 200': r => r.status === 200,
    'quotations/my-list response time < 3s': r => r.timings.duration < 3000,
    'quotations/my-list has body': r => r.body && r.body.length > 0,
    'quotations/my-list valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data) || (data && typeof data === 'object');
      } catch (e) {
        return false;
      }
    }
  });

  listQuotationsErrors.add(!success);
  listQuotationsResponseTime.add(response.timings.duration);
  listQuotationsRequests.add(1);

  return { success, response, duration: response.timings.duration };
}
