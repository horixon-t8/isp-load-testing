import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testAuthMe } from '../homepage/02-auth-me.js';
import { testAuthFeatures } from '../homepage/03-auth-features.js';
import { testMasterCategories } from '../homepage/04-master-categories.js';

const quotationMyWorkListErrors = new Rate('quotation_mywork_list_errors');
const quotationMyWorkListResponseTime = new Trend('quotation_mywork_list_response_time');
const quotationMyWorkListRequests = new Counter('quotation_mywork_list_requests');

function performPrerequisiteChecks(baseUrl, headers, testType) {
  const authMeResult = testAuthMe(baseUrl, headers);
  if (!authMeResult.success) {
    console.error(`Auth me test failed, skipping quotation ${testType} list test`);
    return false;
  }

  const authFeaturesResult = testAuthFeatures(baseUrl, headers);
  if (!authFeaturesResult.success) {
    console.error(`Auth features test failed, skipping quotation ${testType} list test`);
    return false;
  }

  const masterCategoriesResult = testMasterCategories(baseUrl, headers);
  if (!masterCategoriesResult.success) {
    console.error(`Master categories test failed, skipping quotation ${testType} list test`);
    return false;
  }

  return true;
}

export function testQuotationMyWorkList(baseUrl, headers) {
  if (!performPrerequisiteChecks(baseUrl, headers, 'mywork')) {
    quotationMyWorkListErrors.add(1);
    return { success: false, response: null, duration: 0 };
  }

  const payload = {
    type: 'MyWork',
    status: [
      'Draft',
      'SubmitToSSP',
      'SubmitToUW',
      'NeedMoreInformation',
      'DiscountApprovalSubmitted',
      'DiscountApprovalApproved',
      'DiscountApprovalRejected',
      'PendingPolicyIssue',
      'AppFormSubmitted',
      'SubmitToDP'
    ],
    createDate: {},
    updateDate: {},
    page: 1,
    pageSize: 20,
    sort: {}
  };

  const requestHeaders = {
    ...headers,
    'Content-Type': 'application/json'
  };

  const response = http.post(`${baseUrl}/quotation/requests/list`, JSON.stringify(payload), {
    headers: requestHeaders
  });

  const success = check(response, {
    'quotation mywork list status is 200': r => r.status === 200,
    'quotation mywork list response time < 5s': r => r.timings.duration < 5000,
    'quotation mywork list has body': r => r.body && r.body.length > 0,
    'quotation mywork list valid JSON': r => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'quotation mywork list has data structure': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && Array.isArray(data.data.data);
      } catch (e) {
        return false;
      }
    },
    'quotation mywork list error is false': r => {
      try {
        const data = JSON.parse(r.body);
        return data.error === false;
      } catch (e) {
        return false;
      }
    }
  });

  quotationMyWorkListErrors.add(!success);
  quotationMyWorkListResponseTime.add(response.timings.duration);
  quotationMyWorkListRequests.add(1);

  return { success, response, duration: response.timings.duration };
}
