import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for detailed reporting
const homepageErrors = new Rate('homepage_errors');
const quotationErrors = new Rate('quotation_errors');
const apiResponseTime = new Trend('api_response_time');
const totalRequests = new Counter('total_requests');

// Test configuration
export const options = {
  scenarios: {
    // Ramp up scenario - gradually increase load
    ramp_up: {
      executor: 'ramping-vus',
      // startVUs: 0,
      startVUs: 1,
      stages: [
        { duration: '30s', target: 1 },
        // { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
        // { duration: '3m', target: 100 },  // Ramp up to 100 users over 3 minutes
        // { duration: '5m', target: 200 },  // Ramp up to 200 users over 5 minutes
        // { duration: '10m', target: 200 }, // Stay at 200 users for 10 minutes
        // { duration: '3m', target: 0 },    // Ramp down over 3 minutes
      ],
    },
    // Constant load scenario (alternative)
    // constant_load: {
    //   executor: 'constant-vus',
    //   vus: 200,
    //   duration: '15m',
    // },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // Error rate should be less than 5%
    homepage_errors: ['rate<0.02'],    // Homepage errors should be less than 2%
    quotation_errors: ['rate<0.02'],   // Quotation errors should be less than 2%
  },
};

// Base configuration
// const BASE_URL = 'https://isp-api.com';
const BASE_URL = 'https://isp-api-uat.horixon-t8.com';
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  // Add your authentication headers here if needed
  'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1RHdsWnZHNGRvb09pRHI3VXZNck8tWXRLdjFPdGUxRHVKTVNaSVAxSzdZIn0.eyJleHAiOjE3NTUwNjI0MTcsImlhdCI6MTc1NTA1ODgxNywiYXV0aF90aW1lIjoxNzU1MDU4ODE0LCJqdGkiOiJhMzU4NzdiNi1lZGMyLTQzMmYtODQzZC03ZTM3NTNjMjU0NjgiLCJpc3MiOiJodHRwczovL2lzcC1rYy11YXQuaG9yaXhvbi10OC5jb20vcmVhbG1zL2lzcCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1NWEwM2FmZi0zNjEzLTRjZDgtYWMxMi00NGZkZTU0MWE0OWUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJpc3AtYXV0aC1hcHAiLCJzaWQiOiIyNTc1MDhlZC1mNDZhLTQzZjMtYmQxOS1kYWM5MDM5YjEyYWEiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtaXNwIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFF4Lia4Lit4LiiIOC4quC4uOC4p-C4o-C4o-C4k-C4o-C4seC4leC4meC5jCIsInByZWZlcnJlZF91c2VybmFtZSI6ImlzcC5xYWFlZnJAaG9yaXhvbi10OC50ZWNoIiwiZ2l2ZW5fbmFtZSI6IkFF4Lia4Lit4LiiIiwiZmFtaWx5X25hbWUiOiLguKrguLjguKfguKPguKPguJPguKPguLHguJXguJnguYwiLCJlbWFpbCI6ImlzcC5xYSthZWZyQGJlcnlsOC5jb20ifQ.aVw7eBp33jYGKIFGm6AOSEWjuSgheV_7NPfadGAHni0-rxb8vRRNx3Sx3jhVxEPNqo4apgdeEhpXW5uZYd2iIpdU337JO57EpqMty_PuIHkaNFgFWDkeQgRrGX581FRa--NR5TDHzhOB6aZndyBvKVOlVKKsnrvDwHmdqDa1xP_uU3Tsf0wsj4oem19cawyOPfroWuv-522QCH1TDlQ3LY99-80HYiM1D3JOdrLC51Gpy26MYuNbJz1_ZASwOP0ngCvTMRsco9VRxO9HRBmPrr_RvmQe8fym3RkuYbgO0jHCB7VOe2tqmquMT_l45lw7Z6f1PckBdm9-BgI9vlkj-g`,
};

export function setup() {
  console.log('Starting load test...');
  console.log('Base URL:', BASE_URL);
  console.log('Target concurrent users: 200');
  return {};
}

export default function () {
  // Test Case 1: Homepage API calls
  group('Homepage - Master Data Loading', function () {
    const responses = http.batch([
      {
        method: 'GET',
        url: `${BASE_URL}/auth/me`,
        params: { headers },
      },
      {
        method: 'GET',
        url: `${BASE_URL}/auth/features`,
        params: { headers },
      },
      {
        method: 'GET',
        url: `${BASE_URL}/master/categories`,
        params: { headers },
      },
    ]);

    // Check all three API responses
    let homepageSuccess = true;

    responses.forEach((response, index) => {
      const apiNames = ['auth/me', 'auth/features', 'master/categories'];
      const success = check(response, {
        [`${apiNames[index]} status is 200`]: (r) => r.status === 200,
        [`${apiNames[index]} response time < 2s`]: (r) => r.timings.duration < 2000,
        [`${apiNames[index]} has body`]: (r) => r.body && r.body.length > 0,
      });

      if (!success) homepageSuccess = false;

      // Record metrics
      apiResponseTime.add(response.timings.duration, { api: apiNames[index] });
      totalRequests.add(1);
    });

    // Record homepage error rate
    homepageErrors.add(!homepageSuccess);

    // Simulate user reading homepage content
    sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
  });

  // // Test Case 2: My Quotation List (placeholder for when you define the API)
  // group('My Quotation List', function () {
  //   // TODO: Replace with actual quotation API endpoint when available
  //   const quotationResponse = http.get(`${BASE_URL}/quotations/my-list`, {
  //     headers,
  //   });

  //   const quotationSuccess = check(quotationResponse, {
  //     'quotation list status is 200': (r) => r.status === 200,
  //     'quotation list response time < 3s': (r) => r.timings.duration < 3000,
  //     'quotation list has data': (r) => {
  //       try {
  //         const data = JSON.parse(r.body);
  //         return Array.isArray(data) || (data && typeof data === 'object');
  //       } catch (e) {
  //         return false;
  //       }
  //     },
  //   });

  //   // Record metrics
  //   quotationErrors.add(!quotationSuccess);
  //   apiResponseTime.add(quotationResponse.timings.duration, { api: 'quotations' });
  //   totalRequests.add(1);

  //   // Simulate user reviewing quotation list
  //   sleep(Math.random() * 3 + 2); // Random sleep between 2-5 seconds
  // });

  // Random user behavior - some users might navigate between pages
  if (Math.random() < 0.3) {
    sleep(Math.random() * 2 + 1); // 30% of users take a longer pause
  }
}

export function teardown(data) {
  console.log('Load test completed');
}

// Custom summary for detailed reporting
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Helper function for text summary (basic implementation)
function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n' + indent + '=== LOAD TEST SUMMARY ===\n\n';

  // Test duration and VUs
  summary += indent + `Test Duration: ${data.state.testRunDurationMs / 1000}s\n`;
  summary += indent + `Max VUs: ${data.metrics.vus_max.values.max}\n\n`;

  // HTTP metrics
  summary += indent + '=== HTTP METRICS ===\n';
  summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += indent + `Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n\n`;

  // Custom metrics
  if (data.metrics.homepage_errors) {
    summary += indent + '=== CUSTOM METRICS ===\n';
    summary += indent + `Homepage Error Rate: ${(data.metrics.homepage_errors.values.rate * 100).toFixed(2)}%\n`;
  }
  if (data.metrics.quotation_errors) {
    summary += indent + `Quotation Error Rate: ${(data.metrics.quotation_errors.values.rate * 100).toFixed(2)}%\n`;
  }

  summary += '\n';
  return summary;
}
