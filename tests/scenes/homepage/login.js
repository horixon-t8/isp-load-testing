import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import testCredentials from '../../../config/test-credentials.js';

const authLoginErrors = new Rate('auth_login_errors');
const authLoginResponseTime = new Trend('auth_login_response_time');
const authLoginRequests = new Counter('auth_login_requests');

let loginSkipMessageShown = false;
let loginAttempted = false;
let storedLoginResult = null;

export function testLoginScene(baseUrl) {
  // Return cached result if login already attempted
  if (loginAttempted) {
    return storedLoginResult;
  }

  // Skip login test if using placeholder credentials
  const isPlaceholderCredentials =
    testCredentials.testUser.username === 'PLACEHOLDER_USERNAME' ||
    testCredentials.testUser.password === 'PLACEHOLDER_PASSWORD' ||
    !testCredentials.testUser.username ||
    !testCredentials.testUser.password;

  if (isPlaceholderCredentials) {
    if (!loginSkipMessageShown) {
      console.log(
        `⚠️  Skipping login test - using default credentials for ${__ENV.ENVIRONMENT || 'development'} environment.`
      );
      console.log('   Set environment-specific credential variables:');
      console.log(
        '   DEV_TEST_USERNAME=your_username DEV_TEST_PASSWORD=your_password (for development)'
      );
      console.log(
        '   STAGING_TEST_USERNAME=your_username STAGING_TEST_PASSWORD=your_password (for staging)'
      );
      console.log(
        '   PROD_TEST_USERNAME=your_username PROD_TEST_PASSWORD=your_password (for production)'
      );
      loginSkipMessageShown = true;
    }
    storedLoginResult = {
      success: true,
      response: { status: 200, timings: { duration: 0 }, body: '{"skipped": true}' },
      duration: 0,
      accessToken: null,
      skipped: true
    };
    loginAttempted = true;
    return storedLoginResult;
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

  storedLoginResult = {
    success,
    response,
    duration: response.timings.duration,
    accessToken
  };

  loginAttempted = true;
  return storedLoginResult;
}
