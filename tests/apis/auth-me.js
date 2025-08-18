import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const authMeErrors = new Rate('auth_me_errors');
const authMeResponseTime = new Trend('auth_me_response_time');
const authMeRequests = new Counter('auth_me_requests');

export function testAuthMe(baseUrl, headers) {
  const response = http.get(`${baseUrl}/auth/me`, { headers });

  const success = check(response, {
    'auth/me status is 200': r => r.status === 200,
    'auth/me response time < 2s': r => r.timings.duration < 2000,
    'auth/me has body': r => r.body && r.body.length > 0,
    'auth/me valid JSON': r => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    }
  });

  authMeErrors.add(!success);
  authMeResponseTime.add(response.timings.duration);
  authMeRequests.add(1);

  return { success, response, duration: response.timings.duration };
}