import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const loginErrors = new Rate('login_errors');
const loginResponseTime = new Trend('login_response_time');
const loginRequests = new Counter('login_requests');

export function testLogin(baseUrl, credentials = null) {
  const defaultCredentials = {
    username: 'test@example.com',
    password: 'testpassword123'
  };

  const payload = JSON.stringify(credentials || defaultCredentials);

  const response = http.post(`${baseUrl}/auth/login`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });

  const success = check(response, {
    'login status is 200 or 201': r => r.status === 200 || r.status === 201,
    'login response time < 3s': r => r.timings.duration < 3000,
    'login has body': r => r.body && r.body.length > 0,
    'login valid JSON response': r => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object';
      } catch (e) {
        return false;
      }
    },
    'login returns token': r => {
      try {
        const data = JSON.parse(r.body);
        return data.token || data.access_token || data.accessToken;
      } catch (e) {
        return false;
      }
    }
  });

  loginErrors.add(!success);
  loginResponseTime.add(response.timings.duration);
  loginRequests.add(1);

  let token = null;
  try {
    const data = JSON.parse(response.body);
    token = data.token || data.access_token || data.accessToken;
  } catch (e) {
    // Token extraction failed
  }

  return { success, response, duration: response.timings.duration, token };
}
