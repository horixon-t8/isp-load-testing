import environments from './environments.js';

export default {
  getTestUserForEnvironment(environment = 'development') {
    const envConfig = environments[environment];
    if (!envConfig || !envConfig.testUser) {
      throw new Error(`No test user configured for environment: ${environment}`);
    }
    
    return {
      username: envConfig.testUser.username,
      password: envConfig.testUser.password
    };
  },
  
  testUser: {
    get username() {
      const env = __ENV.ENVIRONMENT || 'development';
      const envConfig = environments[env];
      return envConfig?.testUser?.username || 'PLACEHOLDER_USERNAME';
    },
    get password() {
      const env = __ENV.ENVIRONMENT || 'development';
      const envConfig = environments[env];
      return envConfig?.testUser?.password || 'PLACEHOLDER_PASSWORD';
    }
  }
};