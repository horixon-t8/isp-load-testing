import { testAuthMe } from './auth-me.js';
import { testAuthFeatures } from './auth-features.js';
import { testMasterCategories } from './master-categories.js';

export function performPrerequisiteChecks(baseUrl, headers, testType) {
  const authMeResult = testAuthMe(baseUrl, headers);
  if (!authMeResult.success) {
    console.error(`Auth me test failed, skipping ${testType} test`);
    return false;
  }

  const authFeaturesResult = testAuthFeatures(baseUrl, headers);
  if (!authFeaturesResult.success) {
    console.error(`Auth features test failed, skipping ${testType} test`);
    return false;
  }

  const masterCategoriesResult = testMasterCategories(baseUrl, headers);
  if (!masterCategoriesResult.success) {
    console.error(`Master categories test failed, skipping ${testType} test`);
    return false;
  }

  return true;
}