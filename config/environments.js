// Handle both k6 and Node.js environments
const ENV = typeof __ENV !== 'undefined' ? __ENV : process.env;

export default {
  development: {
    baseUrl: 'https://isp-api-dev.horixon-t8.com',
    timeout: 60000,
    testUser: {
      username: ENV.DEV_TEST_USERNAME,
      password: ENV.DEV_TEST_PASSWORD
    }
  },
  staging: {
    baseUrl: 'https://isp-api-uat.horixon-t8.com',
    timeout: 60000,
    testUser: {
      username: ENV.STAGING_TEST_USERNAME,
      password: ENV.STAGING_TEST_PASSWORD
    }
  },
  preprod: {
    baseUrl: 'https://isp-api-preprod.horixon-t8.com',
    timeout: 60000,
    testUser: {
      username: ENV.PREPROD_TEST_USERNAME,
      password: ENV.PREPROD_TEST_PASSWORD
    }
  },
  production: {
    baseUrl: 'http://isp-api.dhipaya.co.th',
    timeout: 60000,
    testUser: {
      username: ENV.PROD_TEST_USERNAME,
      password: ENV.PROD_TEST_PASSWORD
    }
  }
};
