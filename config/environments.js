export default {
  development: {
    baseUrl: 'https://isp-api-dev.horixon-t8.com',
    timeout: 5000,
    authToken: 'dev-token-placeholder'
  },
  staging: {
    baseUrl: 'https://isp-api-uat.horixon-t8.com',
    timeout: 3000,
    authToken: 'staging-token-placeholder'
  },
  production: {
    baseUrl: 'https://isp-api.horixon-t8.com',
    timeout: 2000,
    authToken: 'production-token-placeholder'
  }
};
