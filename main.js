import { ConfigLoader } from './utils/config-loader.js';
import { TestRunner } from './utils/test-runner.js';
import { ReportGenerator } from './utils/report-generator.js';

const config = ConfigLoader.getConfig();

export const options = config.options;

let setupCompleted = false;

export function setup() {
  if (!setupCompleted) {
    console.log('🚀 Starting K6 Test Suite');
    console.log(`📊 Environment: ${config.environment}`);
    console.log(`🎯 Base URL: ${config.baseUrl}`);
    console.log(`⚙️  Test Type: ${config.testType}`);
    
    if (__ENV.SCENE) {
      console.log(`🎬 Scene: ${__ENV.SCENE}`);
    }
    
    console.log('\n📋 Test Configuration:');
    console.log(`   Environment: ${config.environment}`);
    console.log(`   Test Type: ${config.testType}`);
    console.log(`   Base URL: ${config.baseUrl}`);

    if (__ENV.SCENE) {
      console.log(`   Scene: ${__ENV.SCENE}`);
    }
    if (__ENV.USERS) {
      console.log(`   Target Users: ${__ENV.USERS}`);
    }
    if (__ENV.DURATION) {
      console.log(`   Duration: ${__ENV.DURATION}`);
    }
    if (__ENV.RUN_ALL) {
      console.log(`   Run All Tests: ${__ENV.RUN_ALL}`);
    }

    console.log('\n🏁 Test execution starting...\n');
    setupCompleted = true;
  }

  return { config };
}

export default function (data) {
  const testRunner = new TestRunner(data.config);
  const scene = __ENV.SCENE || 'homepage';

  try {
    const result = testRunner.runScene(scene);

    // Only log errors, not success messages on every iteration
    if (!result.success) {
      console.error(`❌ Scene '${scene}' failed`);
    }

    return result;
  } catch (error) {
    console.error(`💥 Error running scene '${scene}':`, error.message);
    return { success: false, error: error.message };
  }
}

export function teardown(data) {
  console.log('\n🏁 Test execution completed');
  console.log(`📊 Final environment: ${data.config.environment}`);
  console.log('📈 Check the reports directory for detailed results');
}

export function handleSummary(data) {
  // Generate timestamp for report names in YYYYMMDDHHmmss format
  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');

  // Extract scene and test information
  const scene = __ENV.SCENE || 'default';
  const testFile = __ENV.TEST_FILE || 'all-tests';
  const testName = testFile.replace('.js', '');
  const env = __ENV.ENV || 'development';

  // Create descriptive report names
  const reportBaseName = `${env}_${timestamp}_${scene}_${testName}`;

  const reports = {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: ReportGenerator.generateSummaryReport(data)
  };

  // Always generate HTML and CSV reports with descriptive names
  const htmlReportPath = `reports/${reportBaseName}.html`;
  const csvReportPath = `reports/${reportBaseName}.csv`;

  reports[htmlReportPath] = ReportGenerator.generateHTMLReport(data);
  reports[csvReportPath] = ReportGenerator.generateCSVReport(data);

  console.log(`📄 HTML report generated: ${htmlReportPath}`);
  console.log(`📊 CSV report generated: ${csvReportPath}`);

  return reports;
}
