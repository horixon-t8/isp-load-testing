#!/usr/bin/env node

import { mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';

import inquirer from 'inquirer';

const PROMETHEUS_URL = 'http://localhost:18080/prometheus';
const EXPORTS_DIR = './prometheus/exports';

function ensureExportsDir() {
  mkdirSync(EXPORTS_DIR, { recursive: true });
}

function isPrometheusRunning() {
  try {
    execSync(`curl -s ${PROMETHEUS_URL}/api/v1/status/config > /dev/null`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function selectExportType() {
  const { exportType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'exportType',
      message: '📊 Select export type:',
      choices: [
        { name: '📈 All metrics (JSON)', value: 'all' },
        { name: '🔍 Specific query', value: 'query' },
        { name: '⏰ Time range export', value: 'range' },
        { name: '📁 Raw TSDB backup', value: 'backup' }
      ]
    }
  ]);
  return exportType;
}

async function exportAllMetrics() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${EXPORTS_DIR}/all-metrics-${timestamp}.json`;

  console.log('📥 Exporting all current metrics...');

  try {
    execSync(
      `curl -s "${PROMETHEUS_URL}/api/v1/label/__name__/values" | jq -r '.data[]' > /tmp/metrics.list`
    );
    execSync(`curl -s "${PROMETHEUS_URL}/api/v1/query?query={__name__=~\\".*\\"}" > "${filename}"`);
    console.log(`✅ Exported to: ${filename}`);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }
}

async function exportQuery() {
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: '🔍 Enter PromQL query:',
      default: 'k6_http_req_duration'
    }
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${EXPORTS_DIR}/query-${timestamp}.json`;

  console.log(`📊 Exporting query: ${query}`);

  try {
    const encodedQuery = encodeURIComponent(query);
    execSync(`curl -s "${PROMETHEUS_URL}/api/v1/query?query=${encodedQuery}" > "${filename}"`);
    console.log(`✅ Exported to: ${filename}`);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }
}

async function exportTimeRange() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: '🔍 Enter PromQL query:',
      default: 'k6_http_req_duration'
    },
    {
      type: 'input',
      name: 'hours',
      message: '⏰ Hours to look back:',
      default: '1',
      validate: input => !isNaN(input) && parseInt(input) > 0
    },
    {
      type: 'input',
      name: 'step',
      message: '📏 Step interval (e.g., 15s, 1m):',
      default: '15s'
    }
  ]);

  const end = new Date();
  const start = new Date(end.getTime() - parseInt(answers.hours) * 60 * 60 * 1000);

  const startISO = start.toISOString();
  const endISO = end.toISOString();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${EXPORTS_DIR}/range-${timestamp}.json`;

  console.log(`📊 Exporting ${answers.query} from ${startISO} to ${endISO}`);

  try {
    const encodedQuery = encodeURIComponent(answers.query);
    const url = `${PROMETHEUS_URL}/api/v1/query_range?query=${encodedQuery}&start=${startISO}&end=${endISO}&step=${answers.step}`;
    execSync(`curl -s "${url}" > "${filename}"`);
    console.log(`✅ Exported to: ${filename}`);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }
}

function createTSDBBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `prometheus/backups/prometheus-${timestamp}.tar.gz`;

  console.log('📦 Creating TSDB backup...');

  if (!existsSync('prometheus/data')) {
    console.error(
      '❌ No Prometheus data found. Make sure containers are running with volume mapping.'
    );
    return;
  }

  try {
    execSync(`tar -czf ${filename} prometheus/data/`);
    console.log(`✅ Backup created: ${filename}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

async function main() {
  console.log('📊 Prometheus Data Export Tool');
  console.log('================================\n');

  ensureExportsDir();

  if (!isPrometheusRunning()) {
    console.log('⚠️  Prometheus is not running or not accessible.');
    console.log('💡 Start with: npm run grafana:up');

    const { continueAnyway } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueAnyway',
        message: 'Continue with TSDB backup anyway?',
        default: true
      }
    ]);

    if (continueAnyway) {
      createTSDBBackup();
    }
    return;
  }

  const exportType = await selectExportType();

  switch (exportType) {
    case 'all':
      await exportAllMetrics();
      break;
    case 'query':
      await exportQuery();
      break;
    case 'range':
      await exportTimeRange();
      break;
    case 'backup':
      createTSDBBackup();
      break;
  }

  console.log('\n🎉 Export completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
