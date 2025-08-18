import { testAuthMe } from './auth-me.js';
import { testAuthFeatures } from './auth-features.js';
import { testMasterCategories } from './master-categories.js';

export function performPrerequisiteChecks(baseUrl, headers, testType) {
  // Run all 3 APIs sequentially since k6 doesn't support async/await
  const authMeResult = testAuthMe(baseUrl, headers);
  const authFeaturesResult = testAuthFeatures(baseUrl, headers);
  const masterCategoriesResult = testMasterCategories(baseUrl, headers);

  if (!authMeResult.success) {
    console.error(`Auth me test failed, skipping ${testType} test`);
    return false;
  }

  if (!authFeaturesResult.success) {
    console.error(`Auth features test failed, skipping ${testType} test`);
    return false;
  }

  if (!masterCategoriesResult.success) {
    console.error(`Master categories test failed, skipping ${testType} test`);
    return false;
  }

  return true;
}
