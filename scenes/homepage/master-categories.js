import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const masterCategoriesErrors = new Rate('master_categories_errors');
const masterCategoriesResponseTime = new Trend('master_categories_response_time');
const masterCategoriesRequests = new Counter('master_categories_requests');

export function testMasterCategories(baseUrl, headers) {
  const response = http.get(`${baseUrl}/master/categories`, { headers });

  const success = check(response, {
    'master/categories status is 200': r => r.status === 200,
    'master/categories response time < 2s': r => r.timings.duration < 2000,
    'master/categories has body': r => r.body && r.body.length > 0,
    'master/categories valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data) || typeof data === 'object';
      } catch (e) {
        return false;
      }
    }
  });

  masterCategoriesErrors.add(!success);
  masterCategoriesResponseTime.add(response.timings.duration);
  masterCategoriesRequests.add(1);

  return { success, response, duration: response.timings.duration };
}
