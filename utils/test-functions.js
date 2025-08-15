// Test functions for k6 runtime only
// This file is imported only by test-runner.js which runs in k6

import { testAuthLogin } from '../scenes/homepage/01-auth-login.js';
import { testAuthMe } from '../scenes/homepage/02-auth-me.js';
import { testAuthFeatures } from '../scenes/homepage/03-auth-features.js';
import { testMasterCategories } from '../scenes/homepage/04-master-categories.js';
import { testQuotationMyWorkList } from '../scenes/quotation/01-list-quotations-mywork.js';
import { testQuotationMyTeamList } from '../scenes/quotation/02-list-quotations-myteam.js';
import { testGetQuotationDetail } from '../scenes/quotation/03-get-quotation-detail.js';
import { testCreateQuotation } from '../scenes/quotation/04-create-quotation.js';
import { testSubmitQuotationRequest } from '../scenes/quotation/05-submit-quotation.js';

// Function mappings for each test file (only used in k6 runtime)
export const TEST_FUNCTIONS = {
  'homepage/01-auth-login.js': testAuthLogin,
  'homepage/02-auth-me.js': testAuthMe,
  'homepage/03-auth-features.js': testAuthFeatures,
  'homepage/04-master-categories.js': testMasterCategories,
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