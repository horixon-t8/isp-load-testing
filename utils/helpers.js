import { sleep } from 'k6';

export class TestHelpers {
  static randomSleep(min = 1, max = 3) {
    const duration = Math.random() * (max - min) + min;
    sleep(duration);
  }

  static generateRandomEmail() {
    const domains = ['example.com', 'test.com', 'demo.org'];
    const randomString = Math.random().toString(36).substring(2, 10);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `test_${randomString}@${domain}`;
  }

  static generateRandomString(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  static generateTestData() {
    return {
      title: `Test ${this.generateRandomString(8)}`,
      description: `Generated test data at ${new Date().toISOString()}`,
      timestamp: Date.now(),
      randomId: Math.floor(Math.random() * 10000)
    };
  }

  static createAuthHeaders(token) {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    };
  }

  static validateResponse(response, expectedStatus = 200) {
    return {
      isValidStatus: response.status === expectedStatus,
      isValidJSON: this.isValidJSON(response.body),
      hasBody: response.body && response.body.length > 0,
      responseTime: response.timings.duration
    };
  }

  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  static logTestResult(testName, success, duration, details = null) {
    const status = success ? '✅' : '❌';
    const durationStr = `${duration.toFixed(2)}ms`;

    console.log(`${status} ${testName}: ${durationStr}${details ? ` - ${details}` : ''}`);
  }

  static waitForCondition(conditionFn, timeout = 10000, interval = 100) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (conditionFn()) {
        return true;
      }
      sleep(interval / 1000);
    }

    return false;
  }

  static calculatePercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  static formatBytes(bytes) {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static createThinkTime(min = 1, max = 5) {
    return Math.random() * (max - min) + min;
  }
}
