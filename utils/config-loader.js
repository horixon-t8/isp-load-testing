import environments from '../config/environments.js';
import testSettings from '../config/test-settings.js';

export class ConfigLoader {
  static loadEnvironmentConfig(environment = 'staging') {
    if (!environments[environment]) {
      throw new Error(`Environment '${environment}' not found in configuration`);
    }

    return environments[environment];
  }

  static loadTestSettings(settingType = 'default') {
    if (!testSettings[settingType]) {
      throw new Error(`Test setting '${settingType}' not found in configuration`);
    }

    return testSettings[settingType];
  }

  static getConfig() {
    const env = __ENV.ENV || 'development';
    const testType = __ENV.TEST_TYPE || 'default';

    const envConfig = this.loadEnvironmentConfig(env);
    const testSettings = this.loadTestSettings(testType);

    const config = {
      environment: env,
      testType: testType,
      baseUrl: envConfig.baseUrl,
      timeout: envConfig.timeout,
      testUser: envConfig.testUser,
      options: {
        scenarios: testSettings.scenarios,
        thresholds: testSettings.thresholds
      }
    };

    if (__ENV.USERS) {
      Object.keys(config.options.scenarios).forEach(scenarioKey => {
        const scenario = config.options.scenarios[scenarioKey];
        if (scenario.vus !== undefined) {
          scenario.vus = parseInt(__ENV.USERS);
        }
        if (scenario.startVUs !== undefined) {
          scenario.startVUs = Math.min(parseInt(__ENV.USERS) / 10, 10);
        }
      });
    }

    if (__ENV.DURATION) {
      Object.keys(config.options.scenarios).forEach(scenarioKey => {
        const scenario = config.options.scenarios[scenarioKey];
        if (scenario.duration !== undefined) {
          scenario.duration = __ENV.DURATION;
        }
      });
    }

    return config;
  }
}
