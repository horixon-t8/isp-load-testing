import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const profileErrors = new Rate('profile_errors');
const profileResponseTime = new Trend('profile_response_time');
const profileRequests = new Counter('profile_requests');

export function testProfile(baseUrl, headers) {
  const response = http.get(`${baseUrl}/user/profile`, { headers });

  const success = check(response, {
    'user/profile status is 200': r => r.status === 200,
    'user/profile response time < 2s': r => r.timings.duration < 2000,
    'user/profile has body': r => r.body && r.body.length > 0,
    'user/profile valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object';
      } catch (e) {
        return false;
      }
    },
    'user/profile has user data': r => {
      try {
        const data = JSON.parse(r.body);
        return data.id || data.userId || data.email || data.username;
      } catch (e) {
        return false;
      }
    }
  });

  profileErrors.add(!success);
  profileResponseTime.add(response.timings.duration);
  profileRequests.add(1);

  return { success, response, duration: response.timings.duration };
}
