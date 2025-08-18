#!/usr/bin/env node

import { execSync } from 'child_process';
import { mkdirSync } from 'fs';

import { config } from 'dotenv';
import inquirer from 'inquirer';

import { TestSelector } from './utils/test-selector.js';
import testSettings from './config/test-settings.js';

const GRAFANA_URL = 'http://localhost:18080/grafana/d/k6-load-testing/k6-load-testing-dashboard';

// Load environment variables from .env file
config();

const args = process.argv.slice(2);

function showUsage() {
  console.log(`
🧪 ISP Load Testing CLI

Usage:
  node cli-runner.js [options]
  
Modes:
  Interactive Mode (default when no arguments):
    node cli-runner.js                     # Start interactive mode
    node cli-runner.js --interactive       # Start interactive mode explicitly
    node cli-runner.js -i                  # Start interactive mode (short)
  
  Command Line Mode:
    node cli-runner.js [options]           # Use command line arguments
  
Options:
  --scene <name>           Scene to test (homepage, quotation)
  --tests <selection>      Test selection (1,2,3 or 1-4 or all)
  --environment <env>      Environment (development, staging, production)
  --setting <name>         Test setting (default, constant-vus, ramping-vus, light, heavy, spike)
  --prometheus             Send metrics to Prometheus (Grafana dashboard)
  --interactive, -i        Start interactive mode
  --help                   Show this help

Examples:
  node cli-runner.js                                          # Interactive mode
  node cli-runner.js --scene homepage --tests all             # All homepage tests
  node cli-runner.js --scene quotation --tests 1,3 --setting light
  node cli-runner.js --scene homepage --tests 1-2 --setting light --prometheus
  node cli-runner.js --scene homepage --tests all --setting heavy

📊 Grafana Integration:
  npm run grafana                                             # Start Prometheus+Grafana and open browser
  Use --prometheus to stream metrics to Prometheus while running
`);
}

function parseArgs(args) {
  const options = {
    scene: null,
    tests: 'all',
    environment: 'development',
    setting: 'default',
    prometheus: true
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--scene':
        options.scene = args[++i];
        break;
      case '--tests':
        options.tests = args[++i];
        break;
      case '--environment':
        options.environment = args[++i];
        break;
      case '--setting':
        options.setting = args[++i];
        break;
      case '--prometheus':
        options.prometheus = true;
        break;
      case '--help':
        showUsage();
        process.exit(0);
        break;
    }
  }

  return options;
}

function runSingleTest(sceneName, testFile, options) {
  console.log(`\n🧪 Running ${sceneName}/${testFile}...`);

  const envVars = [
    `SCENE=${sceneName}`,
    `TEST_FILE=${testFile}`,
    `ENVIRONMENT=${options.environment}`,
    `TEST_SETTING=${options.setting || 'default'}`,
    // Set Prometheus endpoint for Docker proxy
    options.prometheus
      ? 'K6_PROMETHEUS_RW_SERVER_URL="http://localhost:18080/prometheus/api/v1/write"'
      : '',
    options.prometheus
      ? 'K6_PROMETHEUS_RW_TREND_STATS="count,sum,min,max,avg,med,p(50),p(90),p(95),p(99)"'
      : '',
    // options.prometheus
    //   ? 'K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM="true"'
    //   : '',
    // options.prometheus
    //   ? 'K6_PROMETHEUS_RW_PUSH_INTERVAL="1s"'
    //   : '',
    // Pass through username environment variables
    process.env.DEV_TEST_USERNAME ? `DEV_TEST_USERNAME=${process.env.DEV_TEST_USERNAME}` : '',
    process.env.STAGING_TEST_USERNAME
      ? `STAGING_TEST_USERNAME=${process.env.STAGING_TEST_USERNAME}`
      : '',
    process.env.PROD_TEST_USERNAME ? `PROD_TEST_USERNAME=${process.env.PROD_TEST_USERNAME}` : '',
    // Pass through password environment variables
    process.env.DEV_TEST_PASSWORD ? `DEV_TEST_PASSWORD=${process.env.DEV_TEST_PASSWORD}` : '',
    process.env.STAGING_TEST_PASSWORD
      ? `STAGING_TEST_PASSWORD=${process.env.STAGING_TEST_PASSWORD}`
      : '',
    process.env.PROD_TEST_PASSWORD ? `PROD_TEST_PASSWORD=${process.env.PROD_TEST_PASSWORD}` : ''
  ]
    .filter(Boolean)
    .join(' ');

  try {
    const testId = `${sceneName}-${testFile.replace('.js', '')}`;
    const outputFlag = options.prometheus
      ? `--out experimental-prometheus-rw --tag testid=${testId}`
      : '';
    const command = `${envVars} k6 run ${outputFlag} main.js `;
    console.log(`📋 Command: ${command}`);

    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log(`✅ ${testFile} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${testFile} failed:`, error.message);
    return false;
  }
}

function openGrafana(hasSuccessfulTests, enabled) {
  if (hasSuccessfulTests && enabled) {
    console.log('\n🎉 Tests completed successfully!');
  }

  if (enabled) {
    console.log(`🌐 Grafana is available at: ${GRAFANA_URL}`);
    console.log('Please open the URL manually in your browser.');

    // console.log('📊 Opening Grafana to view your reports...');
    // try {
    //   execSync('node utils/open-browser.js', { stdio: 'inherit' });
    // } catch (error) {
    //   console.log('🌐 Grafana is available at: http://localhost:18080/grafana');
    //   console.log('💡 Run "npm run grafana" to start Prometheus+Grafana if it\'s not running');
    // }
  }
}

function ensureReportsDirectory() {
  try {
    mkdirSync('reports', { recursive: true });
  } catch (error) {
    // Directory already exists or other error - ignore
  }
}

function clearScreen() {
  console.clear();
}

function checkDockerServiceHealth(serviceName, healthUrl, timeout = 30000) {
  console.log(`🔍 Checking ${serviceName} health...`);

  try {
    // Check if container is running
    const containerStatus = execSync(`docker-compose ps ${serviceName}`, { encoding: 'utf8' });
    if (!containerStatus.includes('Up')) {
      console.log(`⚠️  ${serviceName} container is not running. Starting services...`);
      execSync('docker-compose up -d', { stdio: 'inherit' });
      console.log(`✅ Services started. Waiting for ${serviceName} to be ready...`);
    }

    // Wait for service to be healthy
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        execSync(`curl -f ${healthUrl} > /dev/null 2>&1`, { timeout: 5000 });
        console.log(`✅ ${serviceName} is healthy`);
        return true;
      } catch (error) {
        process.stdout.write('.');
        execSync('sleep 2');
      }
    }

    console.log(`\n❌ ${serviceName} health check timed out after ${timeout / 1000}s`);
    return false;
  } catch (error) {
    console.error(`❌ Error checking ${serviceName} health:`, error.message);
    return false;
  }
}

function checkPrometheusHealth() {
  return checkDockerServiceHealth('prometheus', 'http://localhost:18080/prometheus/-/healthy');
}

function checkGrafanaHealth() {
  return checkDockerServiceHealth('grafana', 'http://localhost:18080/grafana/api/health');
}

function runServicesHealthCheck() {
  console.log('\n🏥 Running health checks for monitoring services...');
  console.log('=================================================');

  const prometheusHealthy = checkPrometheusHealth();
  const grafanaHealthy = checkGrafanaHealth();

  if (prometheusHealthy && grafanaHealthy) {
    console.log('\n✅ All monitoring services are healthy and ready!');
    return true;
  } else {
    console.log('\n❌ Some monitoring services are not healthy:');
    if (!prometheusHealthy) {
      console.log('  - Prometheus is not responding');
    }
    if (!grafanaHealthy) {
      console.log('  - Grafana is not responding');
    }
    console.log('\n💡 Try running: npm run grafana:up');
    return false;
  }
}

function generateTestSettingDescription(key, setting) {
  const scenario = Object.values(setting.scenarios)[0];
  const executor = scenario.executor;
  const sleepDuration = setting.sleepDuration || 1;
  const description = setting.description || 'Custom load testing configuration';

  let pattern = '';

  switch (executor) {
    case 'constant-arrival-rate':
      pattern = `${scenario.rate} req/s, up to ${scenario.maxVUs} VUs, ${sleepDuration}s think`;
      break;
    case 'constant-vus':
      pattern = `${scenario.vus} VU, ${scenario.duration}, ${sleepDuration}s think`;
      break;
    case 'ramping-vus':
      if (scenario.stages) {
        const targets = scenario.stages.map(stage => stage.target);
        const startVUs = scenario.startVUs || 0;
        const maxTarget = Math.max(...targets);
        const totalDuration = scenario.stages.reduce((sum, stage) => {
          const duration = stage.duration;
          const value = parseInt(duration);
          const unit = duration.slice(-1);
          return sum + (unit === 'm' ? value * 60 : value);
        }, 0);
        const durationStr =
          totalDuration >= 60 ? Math.round(totalDuration / 60) + 'm' : totalDuration + 's';
        pattern = `${startVUs}→${maxTarget} VUs over ${durationStr}, ${sleepDuration}s think`;
      }
      break;
    default:
      pattern = `Custom, ${sleepDuration}s think`;
  }

  const emoji =
    {
      default: '🏃',
      'constant-vus': '👥',
      'ramping-vus': '📈',
      light: '💡',
      heavy: '💪',
      spike: '⚡'
    }[key] || '⚙️';

  return {
    name: `${emoji} ${key} - ${description} (${pattern})`,
    value: key,
    description
  };
}

async function selectScene() {
  clearScreen();
  const scenes = TestSelector.getAvailableScenes();

  const { scene } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scene',
      message: '🎯 Select scene:',
      choices: scenes.map(scene => ({
        name: `📁 ${scene}`,
        value: scene
      })),
      pageSize: 10
    }
  ]);

  return scene;
}

async function selectTests(sceneName) {
  clearScreen();
  const tests = TestSelector.getTestsForScene(sceneName);

  const choices = [
    ...tests.map((test, index) => ({
      name: `🧪 ${index + 1}. ${test.name}`,
      value: (index + 1).toString()
    })),
    new inquirer.Separator(),
    {
      name: '🎯 Select All Tests',
      value: 'all'
    }
  ];

  const { selectedTests } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedTests',
      message: `🔢 Select tests for ${sceneName}:`,
      choices,
      pageSize: 15,
      validate: answer => {
        if (answer.length === 0) {
          return 'You must choose at least one test.';
        }
        return true;
      }
    }
  ]);

  if (selectedTests.includes('all')) {
    return 'all';
  }

  return selectedTests.join(',');
}

async function selectEnvironment() {
  clearScreen();
  const environments = ['development', 'staging', 'production'];

  const { environment } = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: '🌍 Select environment:',
      choices: environments.map(env => ({
        name: `🌐 ${env}`,
        value: env
      })),
      default: 'development'
    }
  ]);

  return environment;
}

async function selectTestSetting() {
  clearScreen();

  // Generate settings from config
  const settings = Object.keys(testSettings).map(key =>
    generateTestSettingDescription(key, testSettings[key])
  );

  const { setting } = await inquirer.prompt([
    {
      type: 'list',
      name: 'setting',
      message: '⚙️  Select test setting:',
      choices: settings,
      default: 'default',
      pageSize: 10
    }
  ]);

  return setting;
}

async function confirmPrometheus() {
  clearScreen();

  const { usePrometheus } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'usePrometheus',
      message: '📊 Stream metrics to Prometheus (Grafana)?',
      default: true
    }
  ]);

  return usePrometheus;
}

async function interactiveMode() {
  clearScreen();
  console.log('🧪 ISP Load Testing - Interactive Mode');
  console.log('=====================================\n');

  try {
    const scene = await selectScene();
    const tests = await selectTests(scene);
    const environment = await selectEnvironment();
    const setting = await selectTestSetting();
    const prometheus = await confirmPrometheus();

    clearScreen();
    console.log('📋 Test Configuration Summary:');
    console.log('==============================');
    console.log(`  Scene: ${scene}`);

    // Show test names, not just numbers
    const availableTests = TestSelector.getTestsForScene(scene);
    const selectedTests = TestSelector.parseTestSelection(tests, availableTests);
    console.log(`  Tests: ${tests}`);
    if (selectedTests.length <= 5) {
      selectedTests.forEach(test => {
        const testIndex = availableTests.indexOf(test) + 1;
        console.log(`    → ${testIndex}. ${test.name}`);
      });
    } else {
      console.log(`    → ${selectedTests.length} tests selected`);
    }

    console.log(`  Environment: ${environment}`);

    // Get setting description
    const settingConfig = testSettings[setting];
    const settingDesc = generateTestSettingDescription(setting, settingConfig);
    console.log(`  Setting: ${setting}`);
    console.log(`    → ${settingDesc.name.split(' - ')[1]}`);

    console.log(`  Prometheus: ${prometheus ? 'Yes' : 'No'}\n`);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '▶️  Run tests with this configuration?',
        default: true
        // default: false
      }
    ]);

    if (confirm) {
      const options = {
        scene,
        tests,
        environment,
        setting,
        prometheus
      };

      clearScreen();
      console.log('🚀 Starting tests...\n');
      await runTests(options);
    } else {
      console.log('❌ Test execution cancelled.');
    }
  } catch (error) {
    console.error('💥 Error in interactive mode:', error.message);
  }
}

async function runTests(options) {
  const availableTests = TestSelector.getTestsForScene(options.scene);
  const selectedTests = TestSelector.parseTestSelection(options.tests, availableTests);

  console.log(`🎯 Running ${selectedTests.length} test(s) for scene: ${options.scene}`);
  console.log(`📊 Environment: ${options.environment}`);
  console.log(`⚙️  Setting: ${options.setting || 'default'}`);

  // Run health checks for monitoring services if Prometheus is enabled
  if (options.prometheus) {
    const servicesHealthy = runServicesHealthCheck();
    if (!servicesHealthy) {
      console.log('\n❌ Monitoring services are not healthy. Test execution stopped.');
      console.log('Run "npm run grafana:up" to start the services and try again.');
      process.exit(1);
    }
  }

  // Check if login test is selected and show credential info
  const hasLoginTest = selectedTests.some(test => test.file === 'login.js');
  if (hasLoginTest) {
    console.log('\n💡 Login Test Info:');
    console.log('   To use real credentials, set: TEST_PASSWORD=your_password');
    console.log('   Example: TEST_PASSWORD=realpass node cli-runner.js --scene homepage --tests 1');
  }

  let successCount = 0;
  const results = [];

  for (const test of selectedTests) {
    const success = runSingleTest(options.scene, test.file, options);
    results.push({ test: test.name, success });
    if (success) {
      successCount++;
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${successCount}/${selectedTests.length}`);
  console.log(`❌ Failed: ${selectedTests.length - successCount}/${selectedTests.length}`);

  // Open Grafana if tests passed and Prometheus was enabled
  openGrafana(successCount > 0, options.prometheus);
}

async function main() {
  // Ensure reports directory exists
  ensureReportsDirectory();

  if (args.length === 0) {
    // No arguments provided - start interactive mode
    await interactiveMode();
    return;
  }

  // Check if user wants interactive mode explicitly
  if (args.includes('--interactive') || args.includes('-i')) {
    await interactiveMode();
    return;
  }

  const options = parseArgs(args);

  if (!options.scene) {
    console.error('❌ Scene is required. Use --scene <name>');
    showUsage();
    process.exit(1);
  }

  const availableScenes = TestSelector.getAvailableScenes();
  if (!availableScenes.includes(options.scene)) {
    console.error(`❌ Unknown scene: ${options.scene}`);
    console.log('Available scenes:', availableScenes.join(', '));
    process.exit(1);
  }

  const availableTests = TestSelector.getTestsForScene(options.scene);
  if (availableTests.length === 0) {
    console.error(`❌ No tests found for scene: ${options.scene}`);
    process.exit(1);
  }

  const selectedTests = TestSelector.parseTestSelection(options.tests, availableTests);
  if (selectedTests.length === 0) {
    console.error(`❌ No tests selected with: ${options.tests}`);
    process.exit(1);
  }

  // Validate test setting
  const availableSettings = Object.keys(testSettings);
  if (!availableSettings.includes(options.setting)) {
    console.error(`❌ Unknown test setting: ${options.setting}`);
    console.log('Available settings:', availableSettings.join(', '));
    process.exit(1);
  }

  console.log(`🎯 Running ${selectedTests.length} test(s) for scene: ${options.scene}`);
  console.log(`📊 Environment: ${options.environment}`);
  console.log(`⚙️  Setting: ${options.setting || 'default'}`);

  // Run health checks for monitoring services if Prometheus is enabled
  if (options.prometheus) {
    const servicesHealthy = runServicesHealthCheck();
    if (!servicesHealthy) {
      console.log('\n❌ Monitoring services are not healthy. Test execution stopped.');
      console.log('Run "npm run grafana:up" to start the services and try again.');
      process.exit(1);
    }
  }

  let successCount = 0;
  const results = [];

  for (const test of selectedTests) {
    const success = runSingleTest(options.scene, test.file, options);
    results.push({ test: test.name, success });
    if (success) {
      successCount++;
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${successCount}/${selectedTests.length}`);
  console.log(`❌ Failed: ${selectedTests.length - successCount}/${selectedTests.length}`);

  // Open Grafana if tests passed and Prometheus was enabled
  openGrafana(successCount > 0, options.prometheus);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
