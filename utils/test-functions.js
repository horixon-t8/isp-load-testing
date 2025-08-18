// Test functions for k6 runtime only
// This file is imported only by test-runner.js which runs in k6

import { testLoginScene } from '../tests/scenes/homepage/login.js';
import { testHomepageScene } from '../tests/scenes/homepage/homepage.js';
import { testMyWorkQuotationScene } from '../tests/scenes/quotation/list-quotations-mywork.js';
import { testMyTeamQuotationScene } from '../tests/scenes/quotation/list-quotations-myteam.js';
import { testQuotationDetailScene } from '../tests/scenes/quotation/get-quotation-detail.js';
import { testCreateQuotationScene } from '../tests/scenes/quotation/create-quotation.js';
import { testSubmitQuotationScene } from '../tests/scenes/quotation/submit-quotation.js';

// Function mappings for each test file (only used in k6 runtime)
export const TEST_FUNCTIONS = {
  'homepage/login.js': testLoginScene,
  'homepage/homepage.js': testHomepageScene,
  'quotation/list-quotations-mywork.js': testMyWorkQuotationScene,
  'quotation/list-quotations-myteam.js': testMyTeamQuotationScene,
  'quotation/get-quotation-detail.js': testQuotationDetailScene,
  'quotation/create-quotation.js': testCreateQuotationScene,
  'quotation/submit-quotation.js': testSubmitQuotationScene
};

export function getTestFunction(sceneName, testFile) {
  const key = `${sceneName}/${testFile}`;
  return TEST_FUNCTIONS[key];
}
