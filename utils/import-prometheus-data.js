#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

import inquirer from 'inquirer';

const PROMETHEUS_URL = 'http://localhost:18080/prometheus';
const EXPORTS_DIR = './prometheus/exports';

function isPrometheusRunning() {
  try {
    execSync(`curl -s ${PROMETHEUS_URL}/api/v1/status/config > /dev/null`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getExportFiles() {
  if (!existsSync(EXPORTS_DIR)) {
    return [];
  }

  return readdirSync(EXPORTS_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = join(EXPORTS_DIR, file);
      const stats = statSync(filePath);
      return {
        name: `📄 ${file} (${(stats.size / 1024).toFixed(1)} KB, ${stats.mtime.toLocaleDateString()})`,
        value: filePath,
        short: file
      };
    })
    .sort((a, b) => b.value.localeCompare(a.value)); // Sort by newest first
}

function getBackupFiles() {
  if (!existsSync('prometheus/backups')) {
    return [];
  }

  return readdirSync('prometheus/backups')
    .filter(file => file.endsWith('.tar.gz') && file.includes('prometheus'))
    .map(file => {
      const filePath = join('prometheus/backups', file);
      const stats = statSync(filePath);
      return {
        name: `📦 ${file} (${(stats.size / 1024 / 1024).toFixed(1)} MB, ${stats.mtime.toLocaleDateString()})`,
        value: filePath,
        short: file
      };
    })
    .sort((a, b) => b.value.localeCompare(a.value));
}

async function selectImportType() {
  const exportFiles = getExportFiles();
  const backupFiles = getBackupFiles();

  const choices = [];

  if (exportFiles.length > 0) {
    choices.push({ name: '📊 Import JSON export data', value: 'json' }, new inquirer.Separator());
  }

  if (backupFiles.length > 0) {
    choices.push({ name: '📦 Restore TSDB backup', value: 'backup' }, new inquirer.Separator());
  }

  choices.push({ name: '📁 Import from custom path', value: 'custom' });

  if (choices.length === 1) {
    console.log('⚠️  No export files or backups found.');
    console.log('💡 Run "npm run data:export" first to create exports.');
    return null;
  }

  const { importType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'importType',
      message: '📥 Select import type:',
      choices
    }
  ]);

  return importType;
}

async function importJsonData() {
  const exportFiles = getExportFiles();

  if (exportFiles.length === 0) {
    console.log('❌ No JSON export files found in ./prometheus/exports/');
    return;
  }

  const { selectedFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFile',
      message: '📄 Select export file to import:',
      choices: exportFiles,
      pageSize: 10
    }
  ]);

  console.log(`📊 Importing data from: ${selectedFile}`);
  console.log(
    '⚠️  Note: This will display the JSON data. Manual import to Prometheus requires custom tooling.'
  );

  try {
    execSync(`cat "${selectedFile}" | jq '.'`, { stdio: 'inherit' });
    console.log(
      "\n💡 To replay this data, you'll need to use Prometheus remote write API or promtool."
    );
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

async function restoreBackup() {
  const backupFiles = getBackupFiles();

  if (backupFiles.length === 0) {
    console.log('❌ No backup files found in ./prometheus/backups/');
    return;
  }

  const { selectedBackup } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedBackup',
      message: '📦 Select backup to restore:',
      choices: backupFiles,
      pageSize: 10
    }
  ]);

  console.log('\n⚠️  WARNING: This will replace current Prometheus data!');

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to restore this backup?',
      default: false
    }
  ]);

  if (!confirm) {
    console.log('❌ Restore cancelled.');
    return;
  }

  console.log('🛑 Stopping Prometheus container...');
  try {
    execSync('docker-compose stop prometheus', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Could not stop Prometheus container');
  }

  console.log(`📦 Restoring backup: ${selectedBackup}`);

  try {
    // Backup current data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    execSync(`mv prometheus/data prometheus/data.backup-${timestamp} 2>/dev/null || true`);

    // Extract backup
    execSync(`tar -xzf "${selectedBackup}"`);

    console.log('🚀 Starting Prometheus container...');
    execSync('docker-compose start prometheus', { stdio: 'inherit' });

    console.log('✅ Backup restored successfully!');
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    console.log(
      '💡 Try manually: docker-compose down && tar -xzf backup.tar.gz && docker-compose up -d'
    );
  }
}

async function importCustomPath() {
  const { customPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'customPath',
      message: '📁 Enter path to import file:',
      validate: input => (existsSync(input) ? true : 'File not found')
    }
  ]);

  if (customPath.endsWith('.tar.gz')) {
    console.log('📦 Detected backup file, treating as TSDB restore...');
    // Similar to restoreBackup but with custom path
    console.log(
      '💡 Use the backup restore option and copy your file to ./prometheus/backups/ first'
    );
  } else {
    console.log('📊 Displaying file contents...');
    try {
      execSync(`cat "${customPath}" | head -20`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to read file:', error.message);
    }
  }
}

async function main() {
  console.log('📥 Prometheus Data Import Tool');
  console.log('===============================\n');

  if (!isPrometheusRunning()) {
    console.log('⚠️  Prometheus is not running or not accessible.');
    console.log('💡 For JSON imports, Prometheus should be running: npm run grafana:up');
    console.log('💡 For backup restores, Prometheus will be stopped/started automatically.\n');
  }

  const importType = await selectImportType();

  if (!importType) {
    return;
  }

  switch (importType) {
    case 'json':
      await importJsonData();
      break;
    case 'backup':
      await restoreBackup();
      break;
    case 'custom':
      await importCustomPath();
      break;
  }

  console.log('\n🎉 Import process completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
