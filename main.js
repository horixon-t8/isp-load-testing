import { ConfigLoader } from './utils/config-loader.js';
import { TestRunner } from './utils/test-runner.js';
import { ReportGenerator } from './utils/report-generator.js';
import testSettings from './config/test-settings.js';

const config = ConfigLoader.getConfig();

// Global error storage for handleSummary
global.testErrorLogs = [];

export const options = config.options;

let setupCompleted = false;

export function setup() {
  if (!setupCompleted) {
    // Store test start time in UTC
    global.testStartTime = new Date().toISOString();

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

    // Only log actual errors, not check failures on every iteration
    if (!result.success) {
      // Check if this is due to actual errors or just check failures
      if (result.error) {
        console.error(`❌ Scene '${scene}' failed: ${result.error}`);
      } else if (result.errorLogs) {
        const realErrors = result.errorLogs.filter(log => log.type === 'error');
        if (realErrors.length > 0) {
          console.error(`❌ Scene '${scene}' failed with ${realErrors.length} error(s)`);
        }
        // Don't log anything for pure check failures to reduce noise
      }
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

  // Extract scene and test information with timestamps
  const scene = __ENV.SCENE;
  const testFile = __ENV.TEST_FILE;
  const testName = testFile.replace('.js', '');
  const env = __ENV.ENVIRONMENT;
  const testSettingName = __ENV.TEST_SETTING;

  if (!env || !testSettingName) {
    throw new Error(
      'Environment and test setting must be specified via __ENV.ENVIRONMENT and __ENV.TEST_SETTING'
    );
  }

  // Get full test setting configuration
  const testSettingConfig = testSettings[testSettingName];
  if (!testSettingConfig) {
    throw new Error(`Test setting '${testSettingName}' not found in configuration`);
  }

  // Test timing information
  const testStartTime = global.testStartTime || new Date().toISOString();
  const testEndTime = new Date().toISOString();

  // Create descriptive report names
  const reportBaseName = `${env}_${timestamp}_${scene}_${testName}`;

  // Enhanced test metadata
  const testMetadata = {
    scene,
    testFile,
    testName,
    environment: env,
    testSettingName,
    testSettingConfig: {
      name: testSettingName,
      description: testSettingConfig.description,
      scenarios: testSettingConfig.scenarios,
      thresholds: testSettingConfig.thresholds,
      sleepDuration: testSettingConfig.sleepDuration
    },
    testStartTime,
    testEndTime,
    duration: data.state?.testRunDurationMs || 0,
    timestamp: new Date().toISOString()
  };

  const enhancedData = {
    ...data,
    metadata: testMetadata
  };

  const reports = {
    [`reports/${reportBaseName}.summary.json`]: JSON.stringify(enhancedData, null, 2),
    stdout: ReportGenerator.generateSummaryReport(data, testMetadata)
  };

  // Always generate HTML and CSV reports with descriptive names
  const htmlReportPath = `reports/${reportBaseName}.html`;
  const csvReportPath = `reports/${reportBaseName}.csv`;
  const errorLogPath = `reports/${reportBaseName}.errors.json`;

  reports[htmlReportPath] = ReportGenerator.generateHTMLReport(data, testMetadata);
  reports[csvReportPath] = ReportGenerator.generateCSVReport(data, testMetadata);

  // Generate error logs file if there are errors
  const errorLogs = global.testErrorLogs || [];
  if (errorLogs && errorLogs.length > 0) {
    reports[errorLogPath] = JSON.stringify({ errors: errorLogs, ...testMetadata }, null, 2);
    console.log(`🔴 Error log generated: ${errorLogPath}`);
  }

  console.log(`📄 HTML report generated: ${htmlReportPath}`);
  console.log(`📊 CSV report generated: ${csvReportPath}`);
  console.log(`⏰ Test started: ${testStartTime}`);
  console.log(`⏰ Test ended: ${testEndTime}`);
  console.log(
    `🎬 Scene: ${scene}, Test: ${testName}, Setting: ${testSettingName} (${testSettingConfig.description})`
  );

  return reports;
}
