// Test functions for k6 runtime only
// This file is imported only by test-runner.js which runs in k6

import { testLogin } from '../tests/scenes/homepage/01-login.js';
import { testHomepage } from '../tests/scenes/homepage/02-homepage.js';
import { testQuotationMyWorkList } from '../tests/scenes/quotation/01-list-quotations-mywork.js';
import { testQuotationMyTeamList } from '../tests/scenes/quotation/02-list-quotations-myteam.js';
import { testGetQuotationDetail } from '../tests/scenes/quotation/03-get-quotation-detail.js';
import { testCreateQuotation } from '../tests/scenes/quotation/04-create-quotation.js';
import { testSubmitQuotationRequest } from '../tests/scenes/quotation/05-submit-quotation.js';

// Function mappings for each test file (only used in k6 runtime)
export const TEST_FUNCTIONS = {
  'homepage/01-login.js': testLogin,
  'homepage/02-homepage.js': testHomepage,
  'quotation/01-list-quotations-mywork.js': testQuotationMyWorkList,
  'quotation/02-list-quotations-myteam.js': testQuotationMyTeamList,
  'quotation/03-get-quotation-detail.js': testGetQuotationDetail,
  'quotation/04-create-quotation.js': testCreateQuotation,
  'quotation/05-submit-quotation.js': testSubmitQuotationRequest
};

export function getTestFunction(sceneName, testFile) {
  const key = `${sceneName}/${testFile}`;
  return TEST_FUNCTIONS[key];
}
