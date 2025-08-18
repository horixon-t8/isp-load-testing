import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { performPrerequisiteChecks } from '../../apis/common-checks.js';

const homepageErrors = new Rate('homepage_errors');
const homepageResponseTime = new Trend('homepage_response_time');
const homepageRequests = new Counter('homepage_requests');

export function testHomepageScene(baseUrl, headers) {
  const startTime = new Date().getTime();

  const overallSuccess = performPrerequisiteChecks(baseUrl, headers, 'homepage');

  if (!overallSuccess) {
    homepageErrors.add(1);
    return { success: false, results: {}, duration: 0, totalDuration: 0 };
  }

  const endTime = new Date().getTime();
  const totalDuration = endTime - startTime;

  const homepageSuccess = check(
    { totalDuration, overallSuccess },
    {
      'homepage all APIs successful': () => overallSuccess,
      'homepage total load time < 5s': () => totalDuration < 5000,
      'homepage total load time < 3s': () => totalDuration < 3000
    }
  );

  homepageErrors.add(!homepageSuccess);
  homepageResponseTime.add(totalDuration);
  homepageRequests.add(1);

  return {
    success: homepageSuccess && overallSuccess,
    results: {},
    duration: totalDuration,
    totalDuration
  };
}
