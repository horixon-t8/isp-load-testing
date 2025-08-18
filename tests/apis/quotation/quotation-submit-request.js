import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const submitQuotationErrors = new Rate('submit_quotation_errors');
const submitQuotationResponseTime = new Trend('submit_quotation_response_time');
const submitQuotationRequests = new Counter('submit_quotation_requests');

export function testSubmitQuotationRequest(baseUrl, headers, quotationId, additionalData = null) {
  if (!quotationId) {
    submitQuotationErrors.add(1);
    submitQuotationRequests.add(1);
    return { success: false, response: null, duration: 0 };
  }

  const defaultAdditionalData = {
    notes: 'Load test submission',
    urgency: 'normal',
    submittedAt: new Date().toISOString()
  };

  const payload = JSON.stringify({
    quotationId: quotationId,
    ...defaultAdditionalData,
    ...additionalData
  });

  const response = http.post(`${baseUrl}/quotation/submit-request`, payload, {
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    }
  });

  const success = check(response, {
    'submit quotation status is 200': r => r.status === 200,
    'submit quotation response time < 5s': r => r.timings.duration < 5000,
    'submit quotation has body': r => r.body && r.body.length > 0,
    'submit quotation valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object' && !data.error;
      } catch (e) {
        return false;
      }
    },
    'submit quotation success message': r => {
      try {
        const data = JSON.parse(r.body);
        return data.message && data.message.toLowerCase().includes('success');
      } catch (e) {
        return false;
      }
    }
  });

  submitQuotationErrors.add(!success);
  submitQuotationResponseTime.add(response.timings.duration);
  submitQuotationRequests.add(1);

  return { success, response, duration: response.timings.duration };
}