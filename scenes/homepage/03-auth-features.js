import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const authFeaturesErrors = new Rate('auth_features_errors');
const authFeaturesResponseTime = new Trend('auth_features_response_time');
const authFeaturesRequests = new Counter('auth_features_requests');

export function testAuthFeatures(baseUrl, headers) {
  const response = http.get(`${baseUrl}/auth/features`, { headers });

  const success = check(response, {
    'auth/features status is 200': r => r.status === 200,
    'auth/features response time < 2s': r => r.timings.duration < 2000,
    'auth/features has body': r => r.body && r.body.length > 0,
    'auth/features valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data) || typeof data === 'object';
      } catch (e) {
        return false;
      }
    }
  });

  authFeaturesErrors.add(!success);
  authFeaturesResponseTime.add(response.timings.duration);
  authFeaturesRequests.add(1);

  return { success, response, duration: response.timings.duration };
}
