import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testSubmitQuotationRequest } from '../../apis/quotation/quotation-submit-request.js';
import { testCheckQuotationPdf } from '../../apis/quotation/quotation-files.js';

const submitQuotationErrors = new Rate('submit_quotation_errors');
const submitQuotationResponseTime = new Trend('submit_quotation_response_time');
const submitQuotationRequests = new Counter('submit_quotation_requests');

export function testSubmitQuotationScene(baseUrl, headers, quotationId) {
  const startTime = new Date().getTime();
  let overallSuccess = true;
  const results = {};

  // Test Submit Quotation Request
  const submitResult = testSubmitQuotationRequest(baseUrl, headers, quotationId);
  results.submit = submitResult;
  overallSuccess = overallSuccess && submitResult.success;

  // Test Check Quotation PDF (if submit was successful)
  if (submitResult.success) {
    const pdfResult = testCheckQuotationPdf(baseUrl, headers, quotationId);
    results.pdf = pdfResult;
    overallSuccess = overallSuccess && pdfResult.success;
  }

  const endTime = new Date().getTime();
  const totalDuration = endTime - startTime;

  const success = check(
    { totalDuration, overallSuccess },
    {
      'submit quotation all APIs successful': () => overallSuccess,
      'submit quotation load time < 5s': () => totalDuration < 5000,
      'submit quotation load time < 3s': () => totalDuration < 3000
    }
  );

  submitQuotationErrors.add(!success);
  submitQuotationResponseTime.add(totalDuration);
  submitQuotationRequests.add(1);

  return {
    success: success && overallSuccess,
    results,
    duration: totalDuration,
    totalDuration
  };
}
