#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

import inquirer from 'inquirer';

function getBackupFiles() {
  if (!existsSync('prometheus/backups')) {
    console.log('❌ Backups directory not found');
    return [];
  }

  return readdirSync('prometheus/backups')
    .filter(file => file.endsWith('.tar.gz') && file.includes('prometheus'))
    .map(file => {
      const filePath = join('prometheus/backups', file);
      const stats = statSync(filePath);
      return {
        name: `📦 ${file} (${(stats.size / 1024 / 1024).toFixed(1)} MB, ${stats.mtime.toLocaleString()})`,
        value: filePath,
        short: file
      };
    })
    .sort((a, b) => statSync(b.value).mtime - statSync(a.value).mtime);
}

async function selectBackup() {
  const backups = getBackupFiles();

  if (backups.length === 0) {
    console.log('❌ No Prometheus backups found in ./prometheus/backups/');
    console.log('💡 Create a backup first with: npm run data:backup');
    return null;
  }

  const { selectedBackup } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedBackup',
      message: '📦 Select backup to restore:',
      choices: backups,
      pageSize: 10
    }
  ]);

  return selectedBackup;
}

async function confirmRestore(backupFile) {
  console.log(`\n🔄 About to restore: ${backupFile}`);
  console.log('⚠️  WARNING: This will:');
  console.log('   • Stop the Prometheus container');
  console.log('   • Backup current data (if any)');
  console.log('   • Replace all Prometheus data with backup');
  console.log('   • Restart Prometheus container\n');

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Continue with restore?',
      default: false
    }
  ]);

  return confirm;
}

function executeRestore(backupPath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    console.log('🛑 Stopping Prometheus container...');
    execSync('docker-compose stop prometheus 2>/dev/null || true', { stdio: 'pipe' });

    console.log('💾 Backing up current data...');
    execSync(`mv prometheus/data prometheus/data.backup-${timestamp} 2>/dev/null || true`);

    console.log(`📦 Extracting backup: ${backupPath}`);
    execSync(`tar -xzf "${backupPath}" -C .`);

    console.log('🚀 Starting Prometheus container...');
    execSync('docker-compose start prometheus', { stdio: 'inherit' });

    // Wait a moment for container to start
    console.log('⏳ Waiting for Prometheus to start...');
    for (let i = 0; i < 10; i++) {
      try {
        execSync('curl -s http://localhost:18080/prometheus/api/v1/status/config > /dev/null');
        break;
      } catch {
        execSync('sleep 2');
      }
    }

    console.log('✅ Restore completed successfully!');
    console.log('📊 Prometheus is available at: http://localhost:18080/prometheus');
    console.log('📈 Grafana is available at: http://localhost:18080/grafana');
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    console.log('\n🔧 Manual restore steps:');
    console.log('1. docker-compose stop prometheus');
    console.log('2. mv prometheus/data prometheus/data.backup');
    console.log(`3. tar -xzf "${backupPath}"`);
    console.log('4. docker-compose start prometheus');
  }
}

async function main() {
  console.log('🔄 Prometheus Data Restore Tool');
  console.log('================================\n');

  const backupPath = await selectBackup();
  if (!backupPath) {
    return;
  }

  const confirmed = await confirmRestore(backupPath);
  if (!confirmed) {
    console.log('❌ Restore cancelled.');
    return;
  }

  executeRestore(backupPath);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
