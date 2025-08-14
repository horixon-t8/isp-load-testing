#!/usr/bin/env node

import { exec } from 'child_process';
import { setTimeout } from 'timers/promises';

const GRAFANA_URL = 'http://localhost:18080/grafana';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000; // 1 second

async function checkGrafanaHealth() {
  return new Promise((resolve) => {
    exec(
      'curl -s -o /dev/null -w "%{http_code}" http://localhost:18080/grafana/api/health',
      (error, stdout) => {
        if (!error && stdout.trim() === '200') {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
}

function openBrowser(url) {
  let command;
  
  switch (process.platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${url}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${url}"`;
      break;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`🌐 Grafana is ready at: ${url}`);
      console.log('Please open the URL manually in your browser.');
    } else {
      console.log(`🚀 Opening Grafana dashboard at ${url}`);
    }
  });
}

async function waitForGrafana() {
  console.log('⏳ Waiting for Grafana to be ready...');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    const isHealthy = await checkGrafanaHealth();
    
    if (isHealthy) {
      console.log('✅ Grafana is ready!');
      openBrowser(GRAFANA_URL);
      return;
    }
    
    process.stdout.write('.');
    await setTimeout(RETRY_INTERVAL);
  }
  
  console.log('\n⚠️  Grafana took longer than expected to start.');
  console.log(`🌐 Please check manually at: ${GRAFANA_URL}`);
}

waitForGrafana();