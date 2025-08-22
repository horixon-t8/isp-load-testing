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
    const env = __ENV.ENVIRONMENT;
    const testSetting = __ENV.TEST_SETTING;

    if (!env || !testSetting) {
      throw new Error(
        'Environment and test setting must be specified via __ENV.ENVIRONMENT and __ENV.TEST_SETTING'
      );
    }

    const envConfig = this.loadEnvironmentConfig(env);
    const testSettings = this.loadTestSettings(testSetting);

    const config = {
      environment: env,
      testType: testSetting,
      baseUrl: envConfig.baseUrl,
      timeout: envConfig.timeout,
      testUser: envConfig.testUser,
      sleepDuration: testSettings.sleepDuration || 1,
      options: {
        scenarios: testSettings.scenarios,
        thresholds: testSettings.thresholds
      }
    };

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
