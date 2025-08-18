import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const createQuotationErrors = new Rate('create_quotation_errors');
const createQuotationResponseTime = new Trend('create_quotation_response_time');
const createQuotationRequests = new Counter('create_quotation_requests');

export function testCreateQuotation(baseUrl, headers, quotationData = null) {
  const defaultQuotationData = {
    title: `Test Quotation ${Date.now()}`,
    description: 'Load test quotation',
    items: [
      {
        name: 'Test Item 1',
        quantity: 2,
        price: 100.0
      },
      {
        name: 'Test Item 2',
        quantity: 1,
        price: 250.5
      }
    ]
  };

  const payload = JSON.stringify(quotationData || defaultQuotationData);

  const response = http.post(`${baseUrl}/quotation/save`, payload, {
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    }
  });

  const success = check(response, {
    'create quotation status is 201 or 200': r => r.status === 201 || r.status === 200,
    'create quotation response time < 5s': r => r.timings.duration < 5000,
    'create quotation has body': r => r.body && r.body.length > 0,
    'create quotation valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object';
      } catch (e) {
        return false;
      }
    }
  });

  createQuotationErrors.add(!success);
  createQuotationResponseTime.add(response.timings.duration);
  createQuotationRequests.add(1);

  return { success, response, duration: response.timings.duration };
}