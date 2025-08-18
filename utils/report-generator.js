import { TestRunner } from './test-runner.js';

export class ReportGenerator {
  static ensureReportsDirectory() {
    // K6's handleSummary automatically creates directories for file paths
    // This is a placeholder for documentation purposes
    return true;
  }
  static generateHTMLReport(data, testMetadata = {}) {
    const timestamp = testMetadata.timestamp || new Date().toISOString();
    const duration = (data.state.testRunDurationMs / 1000).toFixed(2);
    const totalRequests = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
    const failedRequests = data.metrics.http_req_failed
      ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2)
      : 0;
    const avgResponseTime = data.metrics.http_req_duration
      ? data.metrics.http_req_duration.values.avg.toFixed(2)
      : 0;
    const p95ResponseTime = data.metrics.http_req_duration
      ? data.metrics.http_req_duration.values['p(95)'].toFixed(2)
      : 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K6 Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007acc; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007acc; }
        .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
        .threshold-status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .threshold-pass { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .threshold-fail { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .custom-metrics { margin-top: 30px; }
        .test-config { margin-top: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007acc; }
        .config-section { margin-bottom: 20px; }
        .config-section h4 { color: #007acc; margin-bottom: 10px; }
        .config-section h5 { color: #333; margin-bottom: 8px; font-size: 16px; }
        .scenario-item { background-color: #fff; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #e0e0e0; }
        .scenario-item ul { margin: 10px 0; }
        .scenario-item li { margin: 5px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        .error-logs { margin-top: 30px; }
        .error-item { background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
        .error-timestamp { font-weight: bold; color: #856404; }
        .error-details { margin-top: 10px; font-family: monospace; font-size: 12px; background: #f8f9fa; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 K6 Load Test Report</h1>
            <p>Generated on: ${timestamp}</p>
            ${testMetadata.scene ? `<p><strong>🎬 Scene:</strong> ${testMetadata.scene} | <strong>📋 Test:</strong> ${testMetadata.testName}</p>` : ''}
            ${testMetadata.testSettingConfig ? `<p><strong>⚙️ Test Setting:</strong> ${testMetadata.testSettingConfig.name} - ${testMetadata.testSettingConfig.description}</p>` : ''}
            ${testMetadata.environment ? `<p><strong>🌍 Environment:</strong> ${testMetadata.environment}</p>` : ''}
            ${testMetadata.testStartTime ? `<p><strong>⏰ Start Time:</strong> ${testMetadata.testStartTime} | <strong>⏰ End Time:</strong> ${testMetadata.testEndTime}</p>` : ''}
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${duration}s</div>
                <div class="metric-label">Test Duration</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.metrics.vus_max ? data.metrics.vus_max.values.max : 0}</div>
                <div class="metric-label">Max Virtual Users</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${totalRequests}</div>
                <div class="metric-label">Total Requests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${failedRequests}%</div>
                <div class="metric-label">Failed Requests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${avgResponseTime}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${p95ResponseTime}ms</div>
                <div class="metric-label">95th Percentile</div>
            </div>
        </div>

        <div class="custom-metrics">
            <h3>📊 Custom Metrics</h3>
            ${this.generateCustomMetricsHTML(data.metrics)}
        </div>
        
        ${this.generateTestConfigHTML(testMetadata)}
        
        ${this.generateErrorLogsHTML()}

        <div class="footer">
            <p>Report generated by K6 Test Suite</p>
        </div>
    </div>
</body>
</html>`;
  }

  static generateCustomMetricsHTML(metrics) {
    let html = '';
    const customMetrics = [
      'auth_me_errors',
      'auth_features_errors',
      'master_categories_errors',
      'list_quotations_errors',
      'create_quotation_errors',
      'homepage_flow_errors',
      'quotation_flow_errors'
    ];

    customMetrics.forEach(metricName => {
      if (metrics[metricName]) {
        const rate = (metrics[metricName].values.rate * 100).toFixed(2);
        const statusClass = rate < 5 ? 'threshold-pass' : 'threshold-fail';
        html += `<div class="threshold-status ${statusClass}">
                   <strong>${metricName.replace(/_/g, ' ').toUpperCase()}:</strong> ${rate}%
                 </div>`;
      }
    });

    return html || '<p>No custom metrics available</p>';
  }

  static generateTestConfigHTML(testMetadata) {
    if (!testMetadata || !testMetadata.testSettingConfig) {
      return '';
    }

    const config = testMetadata.testSettingConfig;
    let html = '<div class="test-config">';
    html += '<h3>⚙️ Test Configuration Details</h3>';

    // Test setting overview
    html += `<div class="config-section">`;
    html += `<h4>Setting: ${config.name}</h4>`;
    html += `<p><strong>Description:</strong> ${config.description}</p>`;
    html += `<p><strong>Sleep Duration:</strong> ${config.sleepDuration}s between iterations</p>`;
    html += `</div>`;

    // Scenarios
    html += `<div class="config-section">`;
    html += `<h4>📋 Scenarios</h4>`;
    for (const [scenarioName, scenario] of Object.entries(config.scenarios)) {
      html += `<div class="scenario-item">`;
      html += `<h5>${scenarioName}</h5>`;
      html += `<ul>`;
      html += `<li><strong>Executor:</strong> ${scenario.executor}</li>`;

      if (scenario.rate)
        html += `<li><strong>Rate:</strong> ${scenario.rate}/${scenario.timeUnit || '1s'}</li>`;
      if (scenario.vus) html += `<li><strong>VUs:</strong> ${scenario.vus}</li>`;
      if (scenario.duration) html += `<li><strong>Duration:</strong> ${scenario.duration}</li>`;
      if (scenario.preAllocatedVUs)
        html += `<li><strong>Pre-allocated VUs:</strong> ${scenario.preAllocatedVUs}</li>`;
      if (scenario.maxVUs) html += `<li><strong>Max VUs:</strong> ${scenario.maxVUs}</li>`;
      if (scenario.startVUs) html += `<li><strong>Start VUs:</strong> ${scenario.startVUs}</li>`;

      if (scenario.stages) {
        html += `<li><strong>Stages:</strong></li>`;
        html += `<ul>`;
        scenario.stages.forEach(stage => {
          html += `<li>Duration: ${stage.duration}, Target: ${stage.target} VUs</li>`;
        });
        html += `</ul>`;
      }

      html += `</ul>`;
      html += `</div>`;
    }
    html += `</div>`;

    // Thresholds
    html += `<div class="config-section">`;
    html += `<h4>🎯 Performance Thresholds</h4>`;
    html += `<ul>`;
    for (const [metric, thresholds] of Object.entries(config.thresholds)) {
      html += `<li><strong>${metric}:</strong></li>`;
      html += `<ul>`;
      thresholds.forEach(threshold => {
        html += `<li>${threshold}</li>`;
      });
      html += `</ul>`;
    }
    html += `</ul>`;
    html += `</div>`;

    html += '</div>';
    return html;
  }

  static generateErrorLogsHTML() {
    const errorLogs = global.testErrorLogs || [];

    if (!errorLogs || errorLogs.length === 0) {
      return '<div class="error-logs"><h3>🟢 Error Logs</h3><p>No errors detected during test execution</p></div>';
    }

    let html = '<div class="error-logs"><h3>🔴 Error Logs</h3>';

    errorLogs.forEach((error, index) => {
      html += `
        <div class="error-item">
          <div class="error-timestamp">${error.timestamp} - VU${error.vu} - ${error.scene}/${error.testFile}</div>
          <div><strong>Error:</strong> ${error.error}</div>
          ${
            error.response
              ? `
            <div><strong>HTTP Response:</strong> ${error.response.status} ${error.response.statusText || ''}</div>
            ${error.response.body ? `<div class="error-details">Response Body (first 1000 chars):\n${error.response.body}</div>` : ''}
          `
              : ''
          }
          ${error.stack ? `<div class="error-details">Stack Trace:\n${error.stack}</div>` : ''}
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  static generateCSVReport(data, testMetadata = {}) {
    return this.generateGrafanaCSV(data, testMetadata);
  }

  static generateGrafanaCSV(data, testMetadata = {}) {
    const timestamp = testMetadata.timestamp || new Date().toISOString();
    const scene = testMetadata.scene || __ENV.SCENE || 'unknown';
    const testName = testMetadata.testName || 'unknown';
    const testSetting = testMetadata.testSetting || 'default';
    const environment = testMetadata.environment || __ENV.ENVIRONMENT || 'unknown';

    // Wide format - metrics as columns (Grafana time series friendly)
    const metrics = {
      timestamp: timestamp,
      scene: scene,
      test_name: testName,
      test_setting_name: testMetadata.testSettingName || 'unknown',
      test_setting_description: testMetadata.testSettingConfig?.description || '',
      environment: environment,
      test_start_time: testMetadata.testStartTime || timestamp,
      test_end_time: testMetadata.testEndTime || timestamp
    };

    // Core HTTP metrics
    if (data.metrics.http_req_duration) {
      metrics.http_req_duration_avg = data.metrics.http_req_duration.values.avg.toFixed(2);
      metrics.http_req_duration_p95 = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
      metrics.http_req_duration_min = data.metrics.http_req_duration.values.min.toFixed(2);
      metrics.http_req_duration_max = data.metrics.http_req_duration.values.max.toFixed(2);
    }

    if (data.metrics.http_req_failed) {
      metrics.http_req_failed_rate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    }

    if (data.metrics.http_reqs) {
      metrics.http_reqs_count = data.metrics.http_reqs.values.count;
      metrics.http_reqs_rate = data.metrics.http_reqs.values.rate.toFixed(2);
    }

    if (data.metrics.vus_max) {
      metrics.vus_max = data.metrics.vus_max.values.max;
    }

    // Custom auth metrics
    Object.keys(data.metrics).forEach(metricName => {
      if (
        metricName.includes('_errors') ||
        metricName.includes('_response_time') ||
        metricName.includes('_requests')
      ) {
        const metric = data.metrics[metricName];

        if (metric.values.rate !== undefined) {
          metrics[metricName + '_rate'] = (metric.values.rate * 100).toFixed(2);
        }

        if (metric.values.avg !== undefined) {
          metrics[metricName + '_avg'] = metric.values.avg.toFixed(2);
        }

        if (metric.values.count !== undefined) {
          metrics[metricName + '_count'] = metric.values.count;
        }

        if (metric.values['p(95)'] !== undefined) {
          metrics[metricName + '_p95'] = metric.values['p(95)'].toFixed(2);
        }
      }
    });

    // Generate CSV with headers and one data row
    const headers = Object.keys(metrics).join(',');
    const values = Object.values(metrics).join(',');

    return `${headers}\n${values}`;
  }

  static generateSummaryReport(data, testMetadata = {}) {
    const timestamp = testMetadata.timestamp || new Date().toISOString();
    const duration = (data.state.testRunDurationMs / 1000).toFixed(2);

    let summary = '\n📊 K6 LOAD TEST SUMMARY\n';
    summary += `${'='.repeat(50)}\n`;
    summary += `🕐 Generated: ${timestamp}\n`;
    if (testMetadata.scene) {
      summary += `🎬 Scene: ${testMetadata.scene} | Test: ${testMetadata.testName}\n`;
    }
    if (testMetadata.testSettingConfig) {
      summary += `⚙️  Setting: ${testMetadata.testSettingConfig.name} - ${testMetadata.testSettingConfig.description}\n`;
    }
    if (testMetadata.environment) {
      summary += `🌍 Environment: ${testMetadata.environment}\n`;
    }
    if (testMetadata.testStartTime) {
      summary += `⏰ Started: ${testMetadata.testStartTime} | Ended: ${testMetadata.testEndTime}\n`;
    }
    summary += `⏱️  Duration: ${duration}s\n`;
    summary += `👥 Max VUs: ${data.metrics.vus_max ? data.metrics.vus_max.values.max : 0}\n\n`;

    summary += '📈 HTTP METRICS\n';
    summary += `${'-'.repeat(30)}\n`;
    summary += `Total Requests: ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0}\n`;
    summary += `Failed Requests: ${data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 0}%\n`;
    summary += `Avg Response Time: ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 0}ms\n`;
    summary += `95th Percentile: ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 0}ms\n\n`;

    const customMetrics = Object.keys(data.metrics).filter(
      key => key.includes('_errors') || key.includes('_response_time') || key.includes('_requests')
    );

    if (customMetrics.length > 0) {
      summary += '🎯 CUSTOM METRICS\n';
      summary += `${'-'.repeat(30)}\n`;

      customMetrics.forEach(metricName => {
        const metric = data.metrics[metricName];
        if (metric.values.rate !== undefined) {
          summary += `${metricName}: ${(metric.values.rate * 100).toFixed(2)}%\n`;
        } else if (metric.values.avg !== undefined) {
          summary += `${metricName}: ${metric.values.avg.toFixed(2)}ms\n`;
        } else if (metric.values.count !== undefined) {
          summary += `${metricName}: ${metric.values.count}\n`;
        }
      });
    }

    summary += `\n${'='.repeat(50)}\n`;
    return summary;
  }
}
