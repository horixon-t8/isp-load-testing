import http from 'k6/http';
import { group, sleep, check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { testAuthLogin } from './auth-login.js';

const homepageFlowErrors = new Rate('homepage_flow_errors');
const homepageLoadTime = new Trend('homepage_load_time');
const homepageRequests = new Counter('homepage_requests');

export function runHomepageFlow(baseUrl, headers) {
  let flowSuccess = true;
  const results = [];
  let authToken = null;

  group('User Login', function () {
    const loginResult = testAuthLogin(baseUrl);
    
    if (loginResult.skipped) {
      console.log('Login test skipped - using existing token configuration');
    } else if (loginResult.success && loginResult.accessToken) {
      authToken = loginResult.accessToken;
      headers = {
        ...headers,
        'Authorization': `Bearer ${authToken}`
      };
      console.log('Login successful - using new token');
    } else {
      flowSuccess = false;
      console.error('Login failed, proceeding with existing token');
    }
    
    results.push({
      api: 'auth/login',
      success: loginResult.skipped ? true : loginResult.success,
      duration: loginResult.duration,
      status: loginResult.response.status
    });
  });

  group('Homepage Flow - Parallel API Loading', function () {
    const startTime = Date.now();

    const responses = http.batch([
      {
        method: 'GET',
        url: `${baseUrl}/auth/me`,
        params: { headers }
      },
      {
        method: 'GET',
        url: `${baseUrl}/auth/features`,
        params: { headers }
      },
      {
        method: 'GET',
        url: `${baseUrl}/master/categories`,
        params: { headers }
      }
    ]);

    const endTime = Date.now();
    const totalLoadTime = endTime - startTime;

    // Check all three API responses
    const apiNames = ['auth/me', 'auth/features', 'master/categories'];
    let allApisSuccessful = true;

    responses.forEach((response, index) => {
      const apiName = apiNames[index];
      const success = check(response, {
        [`${apiName} status is 200`]: r => r.status === 200,
        [`${apiName} response time < 2s`]: r => r.timings.duration < 2000,
        [`${apiName} has body`]: r => r.body && r.body.length > 0,
        [`${apiName} valid JSON`]: r => {
          try {
            JSON.parse(r.body);
            return true;
          } catch (e) {
            return false;
          }
        }
      });

      if (!success) {
        allApisSuccessful = false;
        flowSuccess = false;
      }

      results.push({
        api: apiName,
        success: success,
        duration: response.timings.duration,
        status: response.status
      });

      homepageRequests.add(1);
    });

    // Record overall homepage load metrics
    homepageLoadTime.add(totalLoadTime);
    homepageFlowErrors.add(!allApisSuccessful);

    // Simulate user reading homepage content after all APIs load
    sleep(Math.random() * 2 + 1);
  });

  return {
    success: flowSuccess,
    results: results,
    totalDuration: results.reduce((sum, result) => sum + result.duration, 0),
    parallelLoadTime: homepageLoadTime
  };
}
