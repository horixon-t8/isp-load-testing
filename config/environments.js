export default {
  development: {
    baseUrl: 'https://isp-api-dev.horixon-t8.com',
    timeout: 5000,
    testUser: {
      username: __ENV.DEV_TEST_USERNAME,
      password: __ENV.DEV_TEST_PASSWORD
    }
  },
  staging: {
    baseUrl: 'https://isp-api-uat.horixon-t8.com',
    timeout: 3000,
    testUser: {
      username: __ENV.STAGING_TEST_USERNAME,
      password: __ENV.STAGING_TEST_PASSWORD
    }
  },
  production: {
    baseUrl: 'https://isp-api.horixon-t8.com',
    timeout: 2000,
    testUser: {
      username: __ENV.PROD_TEST_USERNAME,
      password: __ENV.PROD_TEST_PASSWORD
    }
  }
};
