import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import testCredentials from '../../config/test-credentials.js';

const authLoginErrors = new Rate('auth_login_errors');
const authLoginResponseTime = new Trend('auth_login_response_time');
const authLoginRequests = new Counter('auth_login_requests');

export function testAuthLogin(baseUrl) {
  // Skip login test if using placeholder password
  if (testCredentials.testUser.password === 'PLACEHOLDER_PASSWORD') {
    console.log('Skipping login test - placeholder password detected. Set TEST_PASSWORD environment variable with real password.');
    return { 
      success: false, 
      response: { status: 200, timings: { duration: 0 }, body: '{"skipped": true}' }, 
      duration: 0,
      accessToken: null,
      skipped: true
    };
  }

  const loginPayload = {
    username: testCredentials.testUser.username,
    password: testCredentials.testUser.password
  };

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = http.post(`${baseUrl}/auth/login`, JSON.stringify(loginPayload), params);

  const success = check(response, {
    'login status is 200': r => r.status === 200,
    'login response time < 3s': r => r.timings.duration < 3000,
    'login has body': r => r.body && r.body.length > 0,
    'login valid JSON': r => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'login response has access_token': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && data.data.access_token;
      } catch (e) {
        return false;
      }
    },
    'login response error is false': r => {
      try {
        const data = JSON.parse(r.body);
        return data.error === false;
      } catch (e) {
        return false;
      }
    },
    'login response has user_info': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && data.data.user_info;
      } catch (e) {
        return false;
      }
    }
  });

  authLoginErrors.add(!success);
  authLoginResponseTime.add(response.timings.duration);
  authLoginRequests.add(1);

  let accessToken = null;
  try {
    const responseData = JSON.parse(response.body);
    if (responseData.data && responseData.data.access_token) {
      accessToken = responseData.data.access_token;
    }
  } catch (e) {
    console.error('Failed to parse login response:', e.message);
  }

  return { 
    success, 
    response, 
    duration: response.timings.duration,
    accessToken 
  };
}