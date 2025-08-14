#!/usr/bin/env node

import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import { config } from 'dotenv';

import inquirer from 'inquirer';

import { TestSelector } from './utils/test-selector.js';

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
  --users <number>         Number of virtual users
  --duration <time>        Test duration (e.g., 30s, 5m)
  --prometheus             Send metrics to Prometheus (Grafana dashboard)
  --interactive, -i        Start interactive mode
  --help                   Show this help

Examples:
  node cli-runner.js                                          # Interactive mode
  node cli-runner.js --scene homepage --tests all             # All homepage tests
  node cli-runner.js --scene quotation --tests 1,3 --users 10 --duration 2m
  node cli-runner.js --scene homepage --tests 1-2 --prometheus

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
    users: 1,
    duration: '30s',
    prometheus: false
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
      case '--users':
        options.users = args[++i];
        break;
      case '--duration':
        options.duration = args[++i];
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
    `USERS=${options.users}`,
    `DURATION=${options.duration}`,
    // Set Prometheus endpoint for Docker proxy
    options.prometheus ? 'K6_PROMETHEUS_RW_SERVER_URL=http://localhost:18080/prometheus/api/v1/write' : '',
    // Pass through username environment variables
    process.env.DEV_TEST_USERNAME ? `DEV_TEST_USERNAME=${process.env.DEV_TEST_USERNAME}` : '',
    process.env.STAGING_TEST_USERNAME ? `STAGING_TEST_USERNAME=${process.env.STAGING_TEST_USERNAME}` : '',
    process.env.PROD_TEST_USERNAME ? `PROD_TEST_USERNAME=${process.env.PROD_TEST_USERNAME}` : '',
    // Pass through password environment variables
    process.env.DEV_TEST_PASSWORD ? `DEV_TEST_PASSWORD=${process.env.DEV_TEST_PASSWORD}` : '',
    process.env.STAGING_TEST_PASSWORD ? `STAGING_TEST_PASSWORD=${process.env.STAGING_TEST_PASSWORD}` : '',
    process.env.PROD_TEST_PASSWORD ? `PROD_TEST_PASSWORD=${process.env.PROD_TEST_PASSWORD}` : ''
  ].filter(Boolean).join(' ');

  try {
    const outputFlag = options.prometheus
      ? '--out experimental-prometheus-rw'
      : '';
    const command = `${envVars} k6 run ${outputFlag} main.js`;
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

function openGrafanaAfterSuccess(hasSuccessfulTests, enabled) {
  if (hasSuccessfulTests && enabled) {
    console.log('\n🎉 Tests completed successfully!');
    console.log('📊 Opening Grafana to view your reports...');
    
    try {
      execSync('node utils/open-browser.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('🌐 Grafana is available at: http://localhost:18080/grafana');
      console.log('💡 Run "npm run grafana" to start Prometheus+Grafana if it\'s not running');
    }
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
    ...tests.map(test => ({
      name: `🧪 ${test.number}. ${test.name}`,
      value: test.number
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
      validate: (answer) => {
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

async function selectUsers() {
  clearScreen();
  
  const { users } = await inquirer.prompt([
    {
      type: 'number',
      name: 'users',
      message: '👥 Number of virtual users:',
      default: 1,
      validate: (value) => {
        if (value < 1 || value > 1000) {
          return 'Please enter a number between 1 and 1000.';
        }
        return true;
      }
    }
  ]);
  
  return users;
}

async function selectDuration() {
  clearScreen();
  
  const { duration } = await inquirer.prompt([
    {
      type: 'input',
      name: 'duration',
      message: '⏱️  Test duration (e.g., 30s, 2m, 1h):',
      default: '30s',
      validate: (value) => {
        if (!/^\d+[smh]$/.test(value)) {
          return 'Please enter a valid duration (e.g., 30s, 2m, 1h).';
        }
        return true;
      }
    }
  ]);
  
  return duration;
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
    const users = await selectUsers();
    const duration = await selectDuration();
    const prometheus = await confirmPrometheus();
    
    clearScreen();
    console.log('📋 Test Configuration Summary:');
    console.log('==============================');
    console.log(`  Scene: ${scene}`);
    console.log(`  Tests: ${tests}`);
    console.log(`  Environment: ${environment}`);
    console.log(`  Users: ${users}`);
    console.log(`  Duration: ${duration}`);
    console.log(`  Prometheus: ${prometheus ? 'Yes' : 'No'}\n`);
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '▶️  Run tests with this configuration?',
        default: false
      }
    ]);
    
    if (confirm) {
      const options = {
        scene,
        tests,
        environment,
        users,
        duration,
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
  console.log(`👥 Users: ${options.users}`);
  console.log(`⏱️  Duration: ${options.duration}`);
  
  // Check if login test is selected and show credential info
  const hasLoginTest = selectedTests.some(test => test.file === '01-auth-login.js');
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
    if (success) {successCount++;}
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${successCount}/${selectedTests.length}`);
  console.log(`❌ Failed: ${selectedTests.length - successCount}/${selectedTests.length}`);

  // Open Grafana if tests passed and Prometheus was enabled
  openGrafanaAfterSuccess(successCount > 0, options.prometheus);
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

  console.log(`🎯 Running ${selectedTests.length} test(s) for scene: ${options.scene}`);
  console.log(`📊 Environment: ${options.environment}`);
  console.log(`👥 Users: ${options.users}`);
  console.log(`⏱️  Duration: ${options.duration}`);

  let successCount = 0;
  const results = [];

  for (const test of selectedTests) {
    const success = runSingleTest(options.scene, test.file, options);
    results.push({ test: test.name, success });
    if (success) {successCount++;}
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${successCount}/${selectedTests.length}`);
  console.log(`❌ Failed: ${selectedTests.length - successCount}/${selectedTests.length}`);

  // Open Grafana if tests passed and Prometheus was enabled
  openGrafanaAfterSuccess(successCount > 0, options.prometheus);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}