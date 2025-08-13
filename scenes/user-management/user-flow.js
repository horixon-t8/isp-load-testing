import { group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

import { testLogin } from './login.js';
import { testProfile } from './profile.js';

const userFlowErrors = new Rate('user_flow_errors');

export function runUserFlow(baseUrl, credentials = null) {
  let flowSuccess = true;
  const results = [];

  group('User Management Flow', function () {
    const loginResult = testLogin(baseUrl, credentials);
    results.push(loginResult);
    if (!loginResult.success) {
      flowSuccess = false;
    }

    if (loginResult.token && loginResult.success) {
      sleep(1);

      const headers = {
        Authorization: `Bearer ${loginResult.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };

      const profileResult = testProfile(baseUrl, headers);
      results.push(profileResult);
      if (!profileResult.success) {
        flowSuccess = false;
      }
    }

    sleep(Math.random() * 2 + 1);
  });

  userFlowErrors.add(!flowSuccess);

  return {
    success: flowSuccess,
    results: results,
    totalDuration: results.reduce((sum, result) => sum + result.duration, 0),
    token: results.length > 0 ? results[0].token : null
  };
}
