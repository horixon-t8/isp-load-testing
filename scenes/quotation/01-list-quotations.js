import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const listQuotationsErrors = new Rate('list_quotations_errors');
const listQuotationsResponseTime = new Trend('list_quotations_response_time');
const listQuotationsRequests = new Counter('list_quotations_requests');

export function testListQuotations(baseUrl, headers) {
  const payload = {
    'type': 'MyWork',
    'status': [
      'Draft',
      'SubmitToSSP',
      'SubmitToUW',
      'NeedMoreInformation',
      'DiscountApprovalSubmitted',
      'DiscountApprovalApproved',
      'DiscountApprovalRejected',
      'PendingPolicyIssue',
      'AppFormSubmitted'
    ],
    'createDate': {},
    'updateDate': {},
    'page': 1,
    'pageSize': 20,
    'sort': {}
  };

  const response = http.post(`${baseUrl}/quotation/requests/list`, JSON.stringify(payload), { headers });

  const success = check(response, {
    'quotation/requests/list status is 200': r => r.status === 200,
    'quotation/requests/list response time < 3s': r => r.timings.duration < 3000,
    'quotation/requests/list has body': r => r.body && r.body.length > 0,
    'quotation/requests/list valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object' && !data.error;
      } catch (e) {
        return false;
      }
    },
    'quotation/requests/list has data array': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && Array.isArray(data.data.data);
      } catch (e) {
        return false;
      }
    },
    'quotation/requests/list data contains quotations': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && data.data.data && data.data.data.length > 0;
      } catch (e) {
        return false;
      }
    }
  });

  listQuotationsErrors.add(!success);
  listQuotationsResponseTime.add(response.timings.duration);
  listQuotationsRequests.add(1);

  return { success, response, duration: response.timings.duration };
}
