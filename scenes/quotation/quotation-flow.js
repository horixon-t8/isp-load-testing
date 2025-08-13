import { group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

import { testListQuotations } from './list-quotations.js';
import { testCreateQuotation } from './create-quotation.js';
import { testGetQuotationDetail } from './get-quotation-detail.js';
import { testSubmitQuotationRequest, testCheckQuotationPdf } from './submit-quotation.js';

const quotationListFlowErrors = new Rate('quotation_list_flow_errors');
const quotationDetailFlowErrors = new Rate('quotation_detail_flow_errors');
const quotationCreateFlowErrors = new Rate('quotation_create_flow_errors');
const quotationCompleteFlowErrors = new Rate('quotation_complete_flow_errors');

export function runQuotationListFlow(baseUrl, headers) {
  let flowSuccess = true;
  const results = [];

  group('Quotation List Flow', function () {
    const listResult = testListQuotations(baseUrl, headers);
    results.push(listResult);
    if (!listResult.success) {
      flowSuccess = false;
    }
    sleep(1);
  });

  quotationListFlowErrors.add(!flowSuccess);

  return {
    success: flowSuccess,
    results: results,
    totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
  };
}

export function runQuotationDetailFlow(baseUrl, headers, quotationId) {
  let flowSuccess = true;
  const results = [];

  group('Quotation Detail Flow', function () {
    if (!quotationId) {
      const listResult = testListQuotations(baseUrl, headers);
      results.push(listResult);
      if (!listResult.success) {
        flowSuccess = false;
        return;
      }

      try {
        const listData = JSON.parse(listResult.response.body);
        if (listData.data && listData.data.data && listData.data.data.length > 0) {
          quotationId = listData.data.data[0].id;
        } else {
          flowSuccess = false;
          return;
        }
      } catch (e) {
        flowSuccess = false;
        return;
      }
      sleep(1);
    }

    const detailResult = testGetQuotationDetail(baseUrl, headers, quotationId);
    results.push(detailResult);
    if (!detailResult.success) {
      flowSuccess = false;
    }
    sleep(1);
  });

  quotationDetailFlowErrors.add(!flowSuccess);

  return {
    success: flowSuccess,
    results: results,
    totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
  };
}

export function runQuotationCreateFlow(baseUrl, headers) {
  let flowSuccess = true;
  const results = [];

  group('Quotation Create Flow', function () {
    const createResult = testCreateQuotation(baseUrl, headers);
    results.push(createResult);
    if (!createResult.success) {
      flowSuccess = false;
    }

    sleep(2);

    const listAfterCreateResult = testListQuotations(baseUrl, headers);
    results.push(listAfterCreateResult);
    if (!listAfterCreateResult.success) {
      flowSuccess = false;
    }

    sleep(1);
  });

  quotationCreateFlowErrors.add(!flowSuccess);

  return {
    success: flowSuccess,
    results: results,
    totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
  };
}

export function runQuotationCompleteFlow(baseUrl, headers) {
  let flowSuccess = true;
  const results = [];

  group('Quotation Complete Workflow - Create, Submit, PDF', function () {
    // Step 1: Create and save quotation
    const createResult = testCreateQuotation(baseUrl, headers);
    results.push(createResult);
    if (!createResult.success) {
      flowSuccess = false;
      return;
    }

    // Extract quotation ID from create response
    let quotationId;
    try {
      const createData = JSON.parse(createResult.response.body);
      quotationId = createData.data?.id || createData.id;
      if (!quotationId) {
        flowSuccess = false;
        return;
      }
    } catch (e) {
      flowSuccess = false;
      return;
    }

    sleep(2);

    // Step 2: Fill up more data and submit request
    const submitResult = testSubmitQuotationRequest(baseUrl, headers, quotationId);
    results.push(submitResult);
    if (!submitResult.success) {
      flowSuccess = false;
      return;
    }

    sleep(3);

    // Step 3: Check quotation PDF generation
    const pdfResult = testCheckQuotationPdf(baseUrl, headers, quotationId);
    results.push(pdfResult);
    if (!pdfResult.success) {
      flowSuccess = false;
    }

    sleep(1);
  });

  quotationCompleteFlowErrors.add(!flowSuccess);

  return {
    success: flowSuccess,
    results: results,
    totalDuration: results.reduce((sum, result) => sum + result.duration, 0)
  };
}
