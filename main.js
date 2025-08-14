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
  const reports = {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: ReportGenerator.generateSummaryReport(data)
  };

  if (__ENV.EXPORT_HTML === 'true') {
    reports['reports/report.html'] = ReportGenerator.generateHTMLReport(data);
    console.log('📄 HTML report generated: reports/report.html');
  }

  return reports;
}
