import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testAuthMe } from '../homepage/02-auth-me.js';
import { testAuthFeatures } from '../homepage/03-auth-features.js';
import { testMasterCategories } from '../homepage/04-master-categories.js';

const quotationMyTeamListErrors = new Rate('quotation_myteam_list_errors');
const quotationMyTeamListResponseTime = new Trend('quotation_myteam_list_response_time');
const quotationMyTeamListRequests = new Counter('quotation_myteam_list_requests');

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

export function testQuotationMyTeamList(baseUrl, headers) {
  if (!performPrerequisiteChecks(baseUrl, headers, 'myteam')) {
    quotationMyTeamListErrors.add(1);
    return { success: false, response: null, duration: 0 };
  }

  const payload = {
    type: 'MyTeam',
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
    'quotation myteam list status is 200': r => r.status === 200,
    'quotation myteam list response time < 5s': r => r.timings.duration < 5000,
    'quotation myteam list has body': r => r.body && r.body.length > 0,
    'quotation myteam list valid JSON': r => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'quotation myteam list has data structure': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && Array.isArray(data.data.data);
      } catch (e) {
        return false;
      }
    },
    'quotation myteam list error is false': r => {
      try {
        const data = JSON.parse(r.body);
        return data.error === false;
      } catch (e) {
        return false;
      }
    }
  });

  quotationMyTeamListErrors.add(!success);
  quotationMyTeamListResponseTime.add(response.timings.duration);
  quotationMyTeamListRequests.add(1);

  return { success, response, duration: response.timings.duration };
}
