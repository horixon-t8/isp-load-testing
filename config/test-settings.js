export default {
  default: {
    description: 'Basic load test with steady 1 req/s',
    scenarios: {
      default: {
        executor: 'constant-arrival-rate',
        rate: 1,
        timeUnit: '1s',
        duration: '30s',
        preAllocatedVUs: 1,
        maxVUs: 5
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.05']
    },
    sleepDuration: 1
  },
  'constant-vus': {
    description: 'Fixed single user load test',
    scenarios: {
      constant_load: {
        executor: 'constant-vus',
        vus: 1,
        duration: '30s'
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.05']
    },
    sleepDuration: 2
  },
  'ramping-vus': {
    description: 'Gradual load increase/decrease',
    scenarios: {
      ramping_load: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
          { duration: '10s', target: 5 },
          { duration: '20s', target: 10 },
          { duration: '10s', target: 0 }
        ]
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.05']
    },
    sleepDuration: 1.5
  },
  light: {
    description: 'Moderate load for everyday scenarios',
    scenarios: {
      light_load: {
        executor: 'constant-arrival-rate',
        rate: 5,
        timeUnit: '1s',
        duration: '2m',
        preAllocatedVUs: 10,
        maxVUs: 20
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<1500'],
      http_req_failed: ['rate<0.02']
    },
    sleepDuration: 1
  },
  heavy: {
    description: 'High stress test with fast interactions',
    scenarios: {
      heavy_load: {
        executor: 'ramping-vus',
        startVUs: 10,
        stages: [
          { duration: '2m', target: 100 },
          { duration: '5m', target: 300 },
          { duration: '10m', target: 500 },
          { duration: '3m', target: 0 }
        ]
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<3000'],
      http_req_failed: ['rate<0.10']
    },
    sleepDuration: 0.5
  },
  spike: {
    description: 'Sudden traffic spike simulation',
    scenarios: {
      spike_test: {
        executor: 'ramping-vus',
        startVUs: 10,
        stages: [
          { duration: '1m', target: 50 },
          { duration: '30s', target: 1000 },
          { duration: '30s', target: 50 },
          { duration: '1m', target: 0 }
        ]
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<5000'],
      http_req_failed: ['rate<0.20']
    },
    sleepDuration: 1
  }
};
