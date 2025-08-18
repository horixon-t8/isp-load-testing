import { testAuthMe } from './auth-me.js';
import { testAuthFeatures } from './auth-features.js';
import { testMasterCategories } from './master-categories.js';

export function performPrerequisiteChecks(baseUrl, headers, testType) {
  // Run all 3 APIs in parallel
  const results = Promise.all([
    Promise.resolve(testAuthMe(baseUrl, headers)),
    Promise.resolve(testAuthFeatures(baseUrl, headers)),
    Promise.resolve(testMasterCategories(baseUrl, headers))
  ]);

  const [authMeResult, authFeaturesResult, masterCategoriesResult] = results;

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
