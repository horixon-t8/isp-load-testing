#!/usr/bin/env node

import { exec } from 'child_process';

const GRAFANA_URL = 'http://localhost:18080/grafana/d/k6-load-testing/k6-load-testing-dashboard';

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

  exec(command, error => {
    if (error) {
      console.log(`🌐 Grafana is available at: ${url}`);
      console.log('Please open the URL manually in your browser.');
    } else {
      console.log(`🚀 Opening Grafana dashboard at ${url}`);
    }
  });
}

openBrowser(GRAFANA_URL);
