import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const checkQuotationPdfErrors = new Rate('check_quotation_pdf_errors');
const checkQuotationPdfResponseTime = new Trend('check_quotation_pdf_response_time');
const checkQuotationPdfRequests = new Counter('check_quotation_pdf_requests');

export function testCheckQuotationPdf(baseUrl, headers, quotationId) {
  if (!quotationId) {
    checkQuotationPdfErrors.add(1);
    checkQuotationPdfRequests.add(1);
    return { success: false, response: null, duration: 0 };
  }

  const response = http.get(
    `${baseUrl}/quotation/quotation-version-quote-files?keyword=${quotationId}`,
    { headers }
  );

  const success = check(response, {
    'quotation PDF status is 200': r => r.status === 200,
    'quotation PDF response time < 10s': r => r.timings.duration < 10000,
    'quotation PDF has body': r => r.body && r.body.length > 0,
    'quotation PDF valid JSON': r => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object' && !data.error;
      } catch (e) {
        return false;
      }
    },
    'quotation PDF has file data': r => {
      try {
        const data = JSON.parse(r.body);
        return data.data && Array.isArray(data.data) && data.data.length > 0;
      } catch (e) {
        return false;
      }
    },
    'quotation PDF file info complete': r => {
      try {
        const data = JSON.parse(r.body);
        if (data.data && data.data.length > 0) {
          const file = data.data[0];
          return (
            file.fileName &&
            file.mimeType === 'application/pdf' &&
            file.quotationVersionID === quotationId
          );
        }
        return false;
      } catch (e) {
        return false;
      }
    }
  });

  checkQuotationPdfErrors.add(!success);
  checkQuotationPdfResponseTime.add(response.timings.duration);
  checkQuotationPdfRequests.add(1);

  return { success, response, duration: response.timings.duration };
}